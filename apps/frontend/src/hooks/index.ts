import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
      toast.success('Produto criado com sucesso')
    },
    onError: onErrorMessage('Falha ao criar produto'),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto atualizado')
    },
    onError: onErrorMessage('Falha ao atualizar produto'),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto removido')
    },
    onError: onErrorMessage('Falha ao remover produto'),
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
      toast.success('Estoque atualizado')
    },
    onError: onErrorMessage('Falha ao atualizar estoque'),
  })
}

export const useCreateIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediente criado')
    },
    onError: onErrorMessage('Falha ao criar ingrediente'),
  })
}

export const useUpdateIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof inventoryApi.updateIngredient>[1] }) =>
      inventoryApi.updateIngredient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediente atualizado')
    },
    onError: onErrorMessage('Falha ao atualizar ingrediente'),
  })
}

export const useDeleteIngredient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.deleteIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediente removido')
    },
    onError: onErrorMessage('Falha ao remover ingrediente'),
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
      toast.success('Receita criada')
    },
    onError: onErrorMessage('Falha ao criar receita'),
  })
}

export const useUpdateRecipe = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecipeFormData> }) => recipesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Receita atualizada')
    },
    onError: onErrorMessage('Falha ao atualizar receita'),
  })
}

export const useDeleteRecipe = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Receita removida')
    },
    onError: onErrorMessage('Falha ao remover receita'),
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
      toast.success('Mesa criada')
    },
    onError: onErrorMessage('Falha ao criar mesa'),
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
      toast.success('Pedido criado')
    },
    onError: onErrorMessage('Falha ao criar pedido'),
  })
}

export const useCloseOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.closeOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['table-order'] })
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Pedido finalizado')
    },
    onError: onErrorMessage('Falha ao finalizar pedido'),
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
      toast.success('Item adicionado ao pedido')
    },
    onError: onErrorMessage('Falha ao adicionar item ao pedido'),
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
      toast.success('Item removido do pedido')
    },
    onError: onErrorMessage('Falha ao remover item do pedido'),
  })
}

export const useAllOrders = () =>
  useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAllOrders })

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
      toast.success('Estabelecimento criado')
    },
    onError: onErrorMessage('Falha ao criar estabelecimento'),
  })
}

export const useUpdateEstablishment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstablishmentUpdateInput }) =>
      establishmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['establishments'] })
      toast.success('Estabelecimento atualizado')
    },
    onError: onErrorMessage('Falha ao atualizar estabelecimento'),
  })
}

export const useDeleteEstablishment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => establishmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['establishments'] })
      toast.success('Estabelecimento removido')
    },
    onError: onErrorMessage('Falha ao remover estabelecimento'),
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
      toast.success('Usuário criado')
    },
    onError: onErrorMessage('Falha ao criar usuário'),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateInput }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário atualizado')
    },
    onError: onErrorMessage('Falha ao atualizar usuário'),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário removido')
    },
    onError: onErrorMessage('Falha ao remover usuário'),
  })
}
