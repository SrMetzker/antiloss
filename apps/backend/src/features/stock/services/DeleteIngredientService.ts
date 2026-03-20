import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

export class DeleteIngredientService {
  async execute(ingredientId: string) {
    const existing = await prisma.ingredient.findUnique({ where: { id: ingredientId } })
    if (!existing) {
      throw new NotFoundError('Ingrediente no encontrado')
    }

    const recipeUsage = await prisma.recipeItem.findFirst({
      where: { ingredientId }
    })

    if (recipeUsage) {
      throw new ValidationError('No es posible eliminar un ingrediente vinculado a una receta')
    }

    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: { ingredientId }
      })

      await tx.ingredient.delete({ where: { id: ingredientId } })
    })

    return { message: 'Ingrediente eliminado' }
  }
}
