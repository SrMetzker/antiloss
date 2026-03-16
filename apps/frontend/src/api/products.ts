import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Product, ProductFormData } from '@/types'

type BackendProduct = {
  id: string
  name: string
  price: number
  sku?: string | null
  establishmentId: string
  createdAt: string
  stockMovements?: Array<{ quantity: number; type: string }>
}

const mapProduct = (product: BackendProduct): Product => ({
  id: product.id,
  name: product.name,
  price: product.price,
  sku: product.sku ?? '',
  category: 'other',
  establishmentId: product.establishmentId,
  createdAt: product.createdAt,
  updatedAt: product.createdAt,
  stock: undefined,
})

const getContext = () => {
  const { activeEstablishmentId, user } = useAuthStore.getState()
  return {
    establishmentId: activeEstablishmentId,
    createdBy: user?.id,
  }
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { establishmentId } = getContext()
    if (!establishmentId) return []

    const response = await apiClient.get<BackendProduct[]>('/products', {
      params: { establishmentId },
    })

    return response.data.map(mapProduct)
  },

  getById: async (id: string): Promise<Product> => {
    const all = await productsApi.getAll()
    const found = all.find((item) => item.id === id)
    if (!found) throw new Error('Product not found')
    return found
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const { establishmentId, createdBy } = getContext()
    if (!establishmentId || !createdBy) {
      throw new Error('Usuário não autenticado ou estabelecimento não selecionado')
    }

    const payload = {
      name: data.name,
      sku: data.sku,
      price: data.price,
      establishmentId,
      createdBy,
    }

    const response = await apiClient.post<BackendProduct>('/products', payload)
    return mapProduct(response.data)
  },

  update: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const payload: Record<string, unknown> = {}

    if (data.name !== undefined) payload.name = data.name
    if (data.sku !== undefined) payload.sku = data.sku
    if (data.price !== undefined) payload.price = data.price

    const response = await apiClient.put<BackendProduct>(`/products/${id}`, payload)
    return mapProduct(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  search: async (term: string): Promise<Product[]> => {
    const { establishmentId } = getContext()
    if (!establishmentId) return []

    const response = await apiClient.get<BackendProduct[]>('/products/search', {
      params: {
        establishmentId,
        name: term,
      },
    })

    return response.data.map(mapProduct)
  },
}
