import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

interface CreateIngredientInput {
  name: string
  unit: 'UNIT' | 'ML' | 'L' | 'G' | 'KG'
  currentStock: number
  minimumStock?: number
  establishmentId: string
  createdBy: string
}

export class CreateIngredientService {
  async execute(input: CreateIngredientInput) {
    const establishment = await prisma.establishment.findUnique({
      where: { id: input.establishmentId }
    })

    if (!establishment) {
      throw new NotFoundError('Estabelecimento nao encontrado')
    }

    const ingredient = await prisma.$transaction(async (tx) => {
      const created = await tx.ingredient.create({
        data: {
          name: input.name,
          unit: input.unit,
          currentStock: input.currentStock,
          minimumStock: input.minimumStock ?? null,
          establishmentId: input.establishmentId,
          createdAt: new Date(),
          createdBy: input.createdBy
        }
      })

      if (input.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            ingredientId: created.id,
            type: 'IN',
            quantity: input.currentStock,
            note: 'Initial stock',
            createdBy: input.createdBy,
            createdAt: new Date()
          }
        })
      }

      return created
    })

    return ingredient
  }
}
