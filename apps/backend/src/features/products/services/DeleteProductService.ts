import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteProductService {
  async execute(productId: string) {
    // Verifica se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new NotFoundError('¡Producto no encontrado!')
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { productId }
      })

      const recipe = await tx.recipe.findUnique({
        where: { productId },
        select: { id: true }
      })

      if (recipe) {
        await tx.recipeItem.deleteMany({
          where: { recipeId: recipe.id }
        })

        await tx.recipe.delete({
          where: { id: recipe.id }
        })
      }

      await tx.stockMovement.deleteMany({
        where: { productId }
      })

      await tx.product.delete({
        where: { id: productId }
      })
    })

    return { message: '¡Producto eliminado con éxito!' }
  }
}
