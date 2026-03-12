import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class GetRecipeByProductService {
  async execute(productId: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { productId },
      include: {
        product: true,
        items: {
          include: { ingredient: true }
        }
      }
    })

    if (!recipe) {
      throw new NotFoundError('Recipe not found')
    }

    return recipe
  }
}
