import axios from 'axios'
import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { productsApi } from '@/api/products'
import type { Recipe, RecipeFormData } from '@/types'

type BackendRecipe = {
  id: string
  productId: string
  createdAt: string
  product?: { id: string; name: string }
  items: Array<{
    ingredientId: string
    quantity: number
    ingredient?: { name: string; unit: string }
  }>
}

const mapUnit = (unit: string) => {
  const normalized = unit.toLowerCase()
  if (normalized === 'unit') return 'unit'
  if (normalized === 'ml') return 'ml'
  if (normalized === 'l') return 'l'
  if (normalized === 'g') return 'g'
  if (normalized === 'kg') return 'kg'
  return 'unit'
}

const mapRecipe = (recipe: BackendRecipe): Recipe => ({
  id: recipe.id,
  productId: recipe.productId,
  productName: recipe.product?.name ?? '',
  ingredients: recipe.items.map((item) => ({
    ingredientId: item.ingredientId,
    ingredientName: item.ingredient?.name ?? '',
    quantity: item.quantity,
    unit: mapUnit(item.ingredient?.unit ?? 'unit'),
  })),
  createdAt: recipe.createdAt,
  updatedAt: recipe.createdAt,
})

const getContext = () => {
  const { user } = useAuthStore.getState()
  return { createdBy: user?.id }
}

export const recipesApi = {
  getAll: async (): Promise<Recipe[]> => {
    const products = await productsApi.getAll()

    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const response = await apiClient.get<BackendRecipe>(`/recipes/${product.id}`)
          return mapRecipe({ ...response.data, product: { id: product.id, name: product.name } })
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null
          }
          throw error
        }
      })
    )

    return results.filter((item): item is Recipe => item !== null)
  },

  getById: async (productId: string): Promise<Recipe> => {
    const response = await apiClient.get<BackendRecipe>(`/recipes/${productId}`)
    return mapRecipe(response.data)
  },

  create: async (data: RecipeFormData): Promise<Recipe> => {
    const { createdBy } = getContext()
    if (!createdBy) throw new Error('Usuário não autenticado')

    const response = await apiClient.post<BackendRecipe>('/recipes', {
      productId: data.productId,
      createdBy,
      items: data.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      })),
    })

    return mapRecipe(response.data)
  },

  update: async (productId: string, data: Partial<RecipeFormData>): Promise<Recipe> => {
    if (!data.ingredients || data.ingredients.length === 0) {
      throw new Error('É necessário enviar ao menos um ingrediente')
    }

    const response = await apiClient.put<BackendRecipe>(`/recipes/${productId}`, {
      items: data.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      })),
    })

    return mapRecipe(response.data)
  },

  delete: async (productId: string): Promise<void> => {
    await apiClient.delete(`/recipes/${productId}`)
  },
}
