import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

interface RecipeItemInput {
  ingredientId: string
  quantity: number
}

interface UpdateRecipeInput {
  items: RecipeItemInput[]
}

export class UpdateRecipeService {
  async execute(productId: string, input: UpdateRecipeInput) {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('items son obligatorios')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { productId }
    })

    if (!recipe) {
      throw new NotFoundError('Receta no encontrada')
    }

    const updatedRecipe = await prisma.$transaction(async (tx) => {
      await tx.recipeItem.deleteMany({
        where: { recipeId: recipe.id }
      })

      for (const item of input.items) {
        await tx.recipeItem.create({
          data: {
            recipeId: recipe.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity
          }
        })
      }

      return tx.recipe.findUnique({
        where: { id: recipe.id },
        include: {
          product: true,
          items: {
            include: {
              ingredient: true
            }
          }
        }
      })
    })

    return updatedRecipe
  }
}
