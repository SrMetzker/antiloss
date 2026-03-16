import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteRecipeService {
  async execute(productId: string) {
    await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({
        where: { productId }
      })

      if (!recipe) {
        throw new NotFoundError('Receita nao encontrada')
      }

      await tx.recipeItem.deleteMany({
        where: { recipeId: recipe.id }
      })

      await tx.recipe.delete({
        where: { id: recipe.id }
      })
    })

    return { message: 'Receita excluida com sucesso' }
  }
}