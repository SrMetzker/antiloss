import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class GetRecipeService {
  async execute(productId: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { productId },
      include: {
        product: true,
        items: {
          include: {
            ingredient: true
          }
        }
      }
    })

    if (!recipe) {
      throw new NotFoundError('Receta no encontrada')
    }

    return recipe
  }
}