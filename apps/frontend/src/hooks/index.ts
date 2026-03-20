import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { productsApi } from '@/api/products'
import { inventoryApi } from '@/api/inventory'
import { recipesApi } from '@/api/recipes'
import { ordersApi } from '@/api/orders'
import { reportsApi } from '@/api/reports'
import { usersApi } from '@/api/users'
import { establishmentsApi } from '@/api/establishments'
import { toast } from '@/store/toastStore'
import type {
  EstablishmentCreateInput,
  EstablishmentUpdateInput,
  ProductFormData,
  RecipeFormData,
  StockMovementFormData,
  UserCreateInput,
  UserUpdateInput,
} from '@/types'

const onErrorMessage = (message: string) => (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (responseData && typeof responseData === 'object') {
      const data = responseData as Record<string, unknown>
      const apiMessage =
        (typeof data.error === 'string' && data.error) ||
        (typeof data.message === 'string' && data.message) ||
        undefined

      if (apiMessage) {
        toast.error(apiMessage)
        return
      }
    }
  }

  const fallback = error instanceof Error && error.message ? error.message : message
  toast.error(fallback)
}

// Products
export const useProducts = () =>
  useQuery({ queryKey: ['products'], queryFn: productsApi.getAll })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductFormData) => productsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: onErrorMessage('Failed to create product'),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated')
    },
    onError: onErrorMessage('Failed to update product'),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product removed')
    },
    onError: onErrorMessage('Failed to remove product'),
  })
}

// Inventory
export const useIngredients = () =>
  useQuery({ queryKey: ['ingredients'], queryFn: inventoryApi.getIngredients })

export const useStockMovements = () =>
  useQuery({ queryKey: ['movements'], queryFn: inventoryApi.getMovements })

export const useCreateMovement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockMovementFormData) => inventoryApi.createMovement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      qc.invalidateQueries({ queryKey: ['movements'] })
      toast.success('Stock updated')
    },
    onError: onErrorMessage('Failed to update stock'),
  })
}

export const useCreateIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient created')
    },
    onError: onErrorMessage('Failed to create ingredient'),
  })
}

export const useUpdateIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof inventoryApi.updateIngredient>[1] }) =>
      inventoryApi.updateIngredient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient updated')
    },
    onError: onErrorMessage('Failed to update ingredient'),
  })
}

export const useDeleteIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.deleteIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient removed')
    },
    onError: onErrorMessage('Failed to remove ingredient'),
  })
}

// Recipes
export const useRecipes = () =>
  useQuery({ queryKey: ['recipes'], queryFn: recipesApi.getAll })

export const useCreateRecipe = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecipeFormData) => recipesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Recipe created')
    },
    onError: onErrorMessage('Failed to create recipe'),
  })
}

export const useUpdateRecipe = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecipeFormData> }) => recipesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe updated')
    },
    onError: onErrorMessage('Failed to update recipe'),
  })
}

export const useDeleteRecipe = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe removed')
    },
    onError: onErrorMessage('Failed to remove recipe'),
  })
}

// Tables / Orders
export const useTables = () =>
  useQuery({ queryKey: ['tables'], queryFn: ordersApi.getTables, refetchInterval: 15000 })

export const useCreateTable = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (number: number) => ordersApi.createTable(number),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table created')
    },
    onError: onErrorMessage('Failed to create table'),
  })
}

export const useTableOrder = (tableId: string | null) =>
  useQuery({
    queryKey: ['table-order', tableId],
    queryFn: () => ordersApi.getOrderByTable(tableId!),
    enabled: Boolean(tableId),
  })

export const useCreateOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tableId, items }: { tableId: string; items: Array<{ productId: string; quantity: number }> }) =>
      ordersApi.createOrder(tableId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['table-order'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Order created')
    },
    onError: onErrorMessage('Failed to create order'),
  })
}

export const useCloseOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, allowNegativeStock }: { orderId: string; allowNegativeStock?: boolean }) =>
      ordersApi.closeOrder(orderId, { allowNegativeStock }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['table-order'] })
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Order closed')
    },
    onError: onErrorMessage('Failed to close order'),
  })
}

export const useAddItemToOpenOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, productId, quantity }: { orderId: string; productId: string; quantity?: number }) =>
      ordersApi.addItemToOrder(orderId, { productId, quantity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['table-order'] })
      toast.success('Item added to order')
    },
    onError: onErrorMessage('Failed to add item to order'),
  })
}

export const useRemoveItemFromOpenOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      ordersApi.removeOrderItem(orderId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['table-order'] })
      toast.success('Item removed from order')
    },
    onError: onErrorMessage('Failed to remove item from order'),
  })
}

export const useAllOrders = () =>
  useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAllOrders })

export const useKitchenOrders = () =>
  useQuery({ queryKey: ['kitchen-orders'], queryFn: ordersApi.getKitchenOrders, refetchInterval: 10000 })

// Reports
export const useReports = () =>
  useQuery({ queryKey: ['reports'], queryFn: reportsApi.getSummary })

// Establishments
export const useEstablishments = () =>
  useQuery({ queryKey: ['establishments'], queryFn: establishmentsApi.getAll })

export const useCreateEstablishment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EstablishmentCreateInput) => establishmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['establishments'] })
      toast.success('Establishment created')
    },
    onError: onErrorMessage('Failed to create establishment'),
  })
}

export const useUpdateEstablishment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstablishmentUpdateInput }) =>
      establishmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['establishments'] })
      toast.success('Establishment updated')
    },
    onError: onErrorMessage('Failed to update establishment'),
  })
}

export const useDeleteEstablishment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => establishmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['establishments'] })
      toast.success('Establishment removed')
    },
    onError: onErrorMessage('Failed to remove establishment'),
  })
}

// Users
export const useUsers = () =>
  useQuery({ queryKey: ['users'], queryFn: usersApi.getAll })

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateInput) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created')
    },
    onError: onErrorMessage('Failed to create user'),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateInput }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
    onError: onErrorMessage('Failed to update user'),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User removed')
    },
    onError: onErrorMessage('Failed to remove user'),
  })
}
