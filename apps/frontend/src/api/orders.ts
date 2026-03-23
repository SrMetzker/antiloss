import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Order, Table } from '@/types'

type BackendTable = {
  id: string
  number: number
  establishmentId: string
  capacity: number
  isReserved: boolean
  status?: 'free' | 'occupied' | 'reserved'
  activeOrderId?: string | null
}

type BackendOrder = {
  id: string
  tableId: string
  status: 'OPEN' | 'CLOSED' | 'CANCELED'
  total: number
  createdAt: string
  updatedAt: string
  closedAt?: string | null
  table?: BackendTable
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    product?: { name: string }
  }>
}

const mapTable = (table: BackendTable): Table => {
  const status = table.status ?? (table.activeOrderId ? 'occupied' : table.isReserved ? 'reserved' : 'free')

  return {
    id: table.id,
    number: table.number,
    establishmentId: table.establishmentId,
    capacity: table.capacity,
    status,
    ...(table.activeOrderId ? { activeOrderId: table.activeOrderId } : {}),
  }
}

const mapOrder = (order: BackendOrder): Order => ({
  id: order.id,
  tableId: order.tableId,
  tableNumber: order.table?.number ?? 0,
  status:
    order.status === 'OPEN' ? 'open' : order.status === 'CLOSED' ? 'closed' : 'cancelled',
  items: order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name ?? 'Produto',
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  })),
  total: order.total,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  ...(order.closedAt ? { closedAt: order.closedAt } : {}),
})

const getContext = () => {
  const { activeEstablishmentId, user } = useAuthStore.getState()
  const fallbackEstablishmentId = user?.establishments?.[0]?.establishmentId

  return {
    establishmentId: activeEstablishmentId ?? fallbackEstablishmentId,
    createdBy: user?.id,
  }
}

export const ordersApi = {
  getTables: async (): Promise<Table[]> => {
    const { establishmentId } = getContext()

    const response = await apiClient.get<BackendTable[]>('/orders/tables', {
      params: establishmentId ? { establishmentId } : undefined,
    })

    const tables = response.data.map(mapTable)

    return tables
  },

  createTable: async (payload: { number: number; capacity?: number }): Promise<Table> => {
    const { establishmentId } = getContext()
    if (!establishmentId) {
      throw new Error('Establishment not selected')
    }

    const requestBody: {
      number: number
      establishmentId: string
      capacity?: number
    } = {
      number: payload.number,
      establishmentId,
    }

    if (payload.capacity !== undefined) {
      requestBody.capacity = payload.capacity
    }

    const response = await apiClient.post<BackendTable>('/orders/tables', requestBody)

    return mapTable(response.data)
  },

  updateTable: async (
    tableId: string,
    payload: { capacity?: number; isReserved?: boolean }
  ): Promise<Table> => {
    const { establishmentId } = getContext()
    if (!establishmentId) {
      throw new Error('Establishment not selected')
    }

    const requestBody: {
      establishmentId: string
      capacity?: number
      isReserved?: boolean
    } = {
      establishmentId,
    }

    if (payload.capacity !== undefined) {
      requestBody.capacity = payload.capacity
    }

    if (payload.isReserved !== undefined) {
      requestBody.isReserved = payload.isReserved
    }

    const response = await apiClient.patch<BackendTable>(`/orders/tables/${tableId}`, requestBody)
    return mapTable(response.data)
  },

  getOrdersByTable: async (tableId: string): Promise<Order[]> => {
    const { establishmentId } = getContext()
    const response = await apiClient.get<BackendOrder[]>('/orders', {
      params: {
        tableId,
        establishmentId: establishmentId ?? undefined,
      },
    })

    return response.data.map(mapOrder)
  },

  getOrderByTable: async (tableId: string): Promise<Order | null> => {
    const orders = await ordersApi.getOrdersByTable(tableId)
    return orders.find((order) => order.status === 'open') ?? null
  },

  createOrder: async (
    tableId: string,
    items: Array<{ productId: string; quantity: number }>
  ): Promise<Order> => {
    const response = await apiClient.post<BackendOrder>('/orders', {
      tableId,
      items,
    })

    const open = await ordersApi.getOrdersByTable(tableId)
    return open.find((order) => order.id === response.data.id) ?? mapOrder(response.data)
  },

  closeOrder: async (orderId: string, options?: { allowNegativeStock?: boolean }): Promise<Order> => {
    const { createdBy } = getContext()
    if (!createdBy) throw new Error('User not authenticated')

    const response = await apiClient.patch<BackendOrder>(`/orders/${orderId}/close`, {
      createdBy,
      allowNegativeStock: options?.allowNegativeStock ?? false,
    })

    return mapOrder(response.data)
  },

  addItemToOrder: async (
    orderId: string,
    payload: { productId: string; quantity?: number }
  ): Promise<Order> => {
    const response = await apiClient.post<BackendOrder>(`/orders/${orderId}/items`, {
      productId: payload.productId,
      quantity: payload.quantity ?? 1,
    })

    return mapOrder(response.data)
  },

  removeOrderItem: async (orderId: string, itemId: string): Promise<Order> => {
    const response = await apiClient.delete<BackendOrder>(`/orders/${orderId}/items/${itemId}`)
    return mapOrder(response.data)
  },

  getAllOrders: async (): Promise<Order[]> => {
    const { establishmentId } = getContext()
    const response = await apiClient.get<BackendOrder[]>('/orders', {
      params: {
        establishmentId: establishmentId ?? undefined,
      },
    })

    const orders = response.data.map(mapOrder)
    if (!establishmentId) return orders

    return orders.filter((order) => {
      const source = response.data.find((item) => item.id === order.id)
      return source?.table?.establishmentId === establishmentId
    })
  },

  getKitchenOrders: async (): Promise<Order[]> => {
    const { establishmentId } = getContext()
    if (!establishmentId) {
      throw new Error('Establishment not selected')
    }

    const response = await apiClient.get<BackendOrder[]>('/orders/kitchen', {
      params: { establishmentId },
    })

    return response.data.map(mapOrder)
  },
}
