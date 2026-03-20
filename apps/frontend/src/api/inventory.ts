import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Ingredient, StockMovement, StockMovementFormData, StockUnit } from '@/types'

type BackendIngredient = {
  id: string
  name: string
  unit: 'UNIT' | 'ML' | 'L' | 'G' | 'KG'
  currentStock: number
  minimumStock?: number | null
  establishmentId: string
}

type BackendStockMovement = {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  ingredientId: string
  note?: string
  createdBy: string
  createdAt: string
  ingredient: BackendIngredient
}

const unitMap: Record<BackendIngredient['unit'], StockUnit> = {
  UNIT: 'unit',
  ML: 'ml',
  L: 'l',
  G: 'g',
  KG: 'kg',
}

const toBackendUnit = (unit: StockUnit): BackendIngredient['unit'] => {
  const map: Record<StockUnit, BackendIngredient['unit']> = {
    unit: 'UNIT',
    ml: 'ML',
    l: 'L',
    g: 'G',
    kg: 'KG',
    cl: 'ML',
    bottle: 'UNIT',
  }

  return map[unit]
}

const mapIngredient = (ingredient: BackendIngredient): Ingredient => ({
  id: ingredient.id,
  name: ingredient.name,
  unit: unitMap[ingredient.unit],
  currentStock: ingredient.currentStock,
  minStock: ingredient.minimumStock ?? 0,
  establishmentId: ingredient.establishmentId,
  costPerUnit: 0,
  category: 'geral',
})

const mapStockMovement = (movement: BackendStockMovement): StockMovement => ({
  id: movement.id,
  ingredientId: movement.ingredientId,
  ingredientName: movement.ingredient.name,
  type: movement.type,
  quantity: movement.quantity,
  unit: unitMap[movement.ingredient.unit],
  reason: movement.note,
  createdBy: movement.createdBy,
  createdAt: movement.createdAt,
})

const getContext = () => {
  const { activeEstablishmentId, user } = useAuthStore.getState()
  return {
    establishmentId: activeEstablishmentId,
    createdBy: user?.id,
  }
}

export const inventoryApi = {
  getIngredients: async (): Promise<Ingredient[]> => {
    const { establishmentId } = getContext()
    if (!establishmentId) return []

    const response = await apiClient.get<BackendIngredient[]>('/stock', {
      params: { establishmentId },
    })

    return response.data.map(mapIngredient)
  },

  getMovements: async (): Promise<StockMovement[]> => {
    const { establishmentId } = getContext()
    if (!establishmentId) return []

    const response = await apiClient.get<BackendStockMovement[]>('/stock/movements', {
      params: { establishmentId },
    })

    return response.data.map(mapStockMovement)
  },

  createMovement: async (data: StockMovementFormData): Promise<StockMovement> => {
    const ingredients = await inventoryApi.getIngredients()
    const { createdBy, establishmentId } = getContext()

    if (!createdBy || !establishmentId) {
      throw new Error('User not authenticated or establishment not selected')
    }

    const typedName = data.ingredientName.trim()
    if (!typedName) {
      throw new Error('Ingredient is required')
    }

    let ingredient =
      (data.ingredientId
        ? ingredients.find((item) => item.id === data.ingredientId)
        : undefined) ??
      ingredients.find((item) => item.name.toLowerCase() === typedName.toLowerCase())

    if (!ingredient) {
      if (data.type === 'OUT' || data.type === 'LOSS') {
        throw new Error('Cannot subtract stock from an ingredient that does not exist yet')
      }

      ingredient = await inventoryApi.createIngredient({
        name: typedName,
        unit: data.unit,
        currentStock: 0,
        minStock: data.minimumStock ?? 0,
        establishmentId,
        costPerUnit: 0,
        category: 'geral',
      })
    }

    const nextStock =
      data.type === 'IN'
        ? ingredient.currentStock + data.quantity
        : data.type === 'ADJUSTMENT'
          ? data.quantity
          : Math.max(0, ingredient.currentStock - data.quantity)

    await apiClient.put(`/stock/${ingredient.id}`, {
      currentStock: nextStock,
      minimumStock: data.minimumStock,
      establishmentId,
      createdBy,
    })

    return {
      id: `local-${Date.now()}`,
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      type: data.type,
      quantity: data.quantity,
      unit: ingredient.unit,
      reason: data.reason,
      createdBy,
      createdAt: new Date().toISOString(),
    }
  },

  createIngredient: async (data: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    const { establishmentId, createdBy } = getContext()

    if (!establishmentId || !createdBy) {
      throw new Error('User not authenticated or establishment not selected')
    }

    const response = await apiClient.post<BackendIngredient>('/stock', {
      name: data.name,
      unit: toBackendUnit(data.unit),
      currentStock: data.currentStock,
      minimumStock: data.minStock,
      establishmentId,
      createdBy,
    })

    return mapIngredient(response.data)
  },

  updateIngredient: async (id: string, data: Partial<Omit<Ingredient, 'id'>>): Promise<Ingredient> => {
    const { createdBy } = getContext()

    const response = await apiClient.put<BackendIngredient>(`/stock/${id}`, {
      name: data.name,
      unit: data.unit ? toBackendUnit(data.unit) : undefined,
      currentStock: data.currentStock,
      minimumStock: data.minStock,
      createdBy,
    })

    return mapIngredient(response.data)
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await apiClient.delete(`/stock/${id}`)
  },
}
