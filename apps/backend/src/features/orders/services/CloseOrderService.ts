import { prisma } from '../../../config/database'
import { AppError, NotFoundError, ValidationError } from '../../../utils/errors'

interface CloseOrderInput {
  orderId: string
  createdBy: string
  allowNegativeStock?: boolean
}

export class CloseOrderService {
  async execute(input: CloseOrderInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipe: {
                  include: {
                    items: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      throw new NotFoundError('Pedido no encontrado')
    }

    if (order.status !== 'OPEN') {
      throw new ValidationError('Solo los pedidos abiertos pueden ser finalizados')
    }

    const ingredientAdjustments: { id: string; decrement: number }[] = []

    for (const orderItem of order.items) {
      const recipe = orderItem.product.recipe
      if (!recipe) {
        throw new ValidationError(`Producto ${orderItem.product.name} sin receta configurada`)
      }

      for (const recipeItem of recipe.items) {
        const needed = recipeItem.quantity * orderItem.quantity
        const existing = ingredientAdjustments.find((adj) => adj.id === recipeItem.ingredientId)

        if (existing) {
          existing.decrement += needed
        } else {
          ingredientAdjustments.push({ id: recipeItem.ingredientId, decrement: needed })
        }
      }
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientAdjustments.map((adj) => adj.id) } }
    })

    const shortages: Array<{
      ingredientId: string
      ingredientName: string
      currentStock: number
      required: number
      shortBy: number
    }> = []

    for (const adj of ingredientAdjustments) {
      const ingredient = ingredients.find((i) => i.id === adj.id)
      if (!ingredient) {
        throw new NotFoundError(`Ingrediente ${adj.id} no encontrado`)
      }

      if (ingredient.currentStock < adj.decrement) {
        shortages.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          currentStock: ingredient.currentStock,
          required: adj.decrement,
          shortBy: adj.decrement - ingredient.currentStock,
        })
      }
    }

    if (shortages.length > 0 && !input.allowNegativeStock) {
      const names = shortages.map((item) => item.ingredientName).join(', ')
      throw new AppError(
        409,
        `Stock insuficiente para: ${names}. Confirme para cerrar con stock negativo.`,
        {
          code: 'INSUFFICIENT_STOCK',
          details: {
            shortages,
          },
        }
      )
    }

    const closedOrder = await prisma.$transaction(async (tx) => {
      for (const adj of ingredientAdjustments) {
        await tx.ingredient.update({
          where: { id: adj.id },
          data: {
            currentStock: { decrement: adj.decrement }
          }
        })

        await tx.stockMovement.create({
          data: {
            ingredientId: adj.id,
            type: 'SALE',
            quantity: adj.decrement,
            note: `Sell order ${order.id}`,
            createdBy: input.createdBy,
            createdAt: new Date()
          }
        })
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CLOSED' },
        include: {
          table: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })
    })

    return closedOrder
  }
}