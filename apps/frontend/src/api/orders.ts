import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Order, Table } from '@/types'

type BackendTable = {
  id: string
  number: number
  establishmentId: string
  activeOrderId?: string | null
}

type BackendOrder = {
  id: string
  tableId: string
  status: 'OPEN' | 'CLOSED' | 'CANCELED'
  total: number
  createdAt: string
  table?: BackendTable
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    product?: { name: string }
  }>
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
  updatedAt: order.createdAt,
  closedAt: order.status === 'CLOSED' ? order.createdAt : undefined,
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

    const tables = response.data.map((table) => ({
      id: table.id,
      number: table.number,
      establishmentId: table.establishmentId,
      capacity: 4,
      status: table.activeOrderId ? 'occupied' as const : 'free' as const,
      activeOrderId: table.activeOrderId ?? undefined,
    }))

    return tables
  },

  createTable: async (number: number): Promise<Table> => {
    const { establishmentId } = getContext()
    if (!establishmentId) {
      throw new Error('Estabelecimento não selecionado')
    }

    const response = await apiClient.post<BackendTable>('/orders/tables', {
      number,
      establishmentId,
    })

    return {
      id: response.data.id,
      number: response.data.number,
      establishmentId: response.data.establishmentId,
      capacity: 4,
      status: 'free',
    }
  },

  getOrdersByTable: async (tableId: string): Promise<Order[]> => {
    const response = await apiClient.get<BackendOrder[]>('/orders', {
      params: { tableId },
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
    if (!createdBy) throw new Error('Usuário não autenticado')

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
    const response = await apiClient.get<BackendOrder[]>('/orders')
    const { establishmentId } = getContext()

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
      throw new Error('Estabelecimento não selecionado')
    }

    const response = await apiClient.get<BackendOrder[]>('/orders/kitchen', {
      params: { establishmentId },
    })

    return response.data.map(mapOrder)
  },
}
