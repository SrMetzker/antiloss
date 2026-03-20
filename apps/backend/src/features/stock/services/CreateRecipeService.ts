import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

interface RecipeItemInput {
  ingredientId: string
  quantity: number
}

interface CreateRecipeInput {
  productId: string
  createdBy: string
  items: RecipeItemInput[]
}

export class CreateRecipeService {
  async execute(input: CreateRecipeInput) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } })
    if (!product) {
      throw new NotFoundError('Producto no encontrado')
    }

    const recipe = await prisma.recipe.create({
      data: {
        productId: input.productId,
        createdBy: input.createdBy,
        items: {
          create: input.items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    })

    return recipe
  }
}
