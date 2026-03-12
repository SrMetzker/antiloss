import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

interface UpdateIngredientInput {
  name?: string
  unit?: 'UNIT' | 'ML' | 'L' | 'G' | 'KG'
  currentStock?: number
  minimumStock?: number
  createdBy?: string
}

export class UpdateIngredientService {
  async execute(ingredientId: string, input: UpdateIngredientInput) {
    const existing = await prisma.ingredient.findUnique({ where: { id: ingredientId } })
    if (!existing) {
      throw new NotFoundError('Ingredient not found')
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ingredientUpdated = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.unit && { unit: input.unit }),
          ...(input.currentStock !== undefined && { currentStock: input.currentStock }),
          ...(input.minimumStock !== undefined && { minimumStock: input.minimumStock })
        }
      })

      if (input.currentStock !== undefined && input.currentStock !== existing.currentStock) {
        const diff = input.currentStock - existing.currentStock
        await tx.stockMovement.create({
          data: {
            ingredientId,
            type: diff > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(diff),
            note: 'Manual stock adjustment',
            createdBy: input.createdBy || existing.createdBy,
            createdAt: new Date()
          }
        })
      }

      return ingredientUpdated
    })

    return updated
  }
}
