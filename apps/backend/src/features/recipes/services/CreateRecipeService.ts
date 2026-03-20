import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

interface RecipeItemInput {
  ingredientId: string
  quantity: number
}

interface CreateRecipeInput {
  productId: string
  items: RecipeItemInput[]
  createdBy: string
}

export class CreateRecipeService {
  async execute(input: CreateRecipeInput) {
    if (!input.productId || !input.items || input.items.length === 0) {
      throw new ValidationError('productId y items son obligatorios')
    }

    const product = await prisma.product.findUnique({
      where: { id: input.productId }
    })

    if (!product) {
      throw new NotFoundError('Producto no encontrado')
    }

    const existingRecipe = await prisma.recipe.findUnique({
      where: { productId: input.productId }
    })

    if (existingRecipe) {
      throw new ValidationError('El producto ya tiene una receta registrada')
    }

    const recipe = await prisma.$transaction(async (tx) => {
      const createdRecipe = await tx.recipe.create({
        data: {
          productId: input.productId,
          createdBy: input.createdBy,
          createdAt: new Date()
        }
      })

      for (const item of input.items) {
        await tx.recipeItem.create({
          data: {
            recipeId: createdRecipe.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity
          }
        })
      }

      return tx.recipe.findUnique({
        where: { id: createdRecipe.id },
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

    return recipe
  }
}