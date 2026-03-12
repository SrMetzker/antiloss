import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

interface AddOrderItemInput {
  orderId: string
  productId: string
  quantity: number
}

export class AddOrderItemService {
  async execute(input: AddOrderItemInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        table: true,
        items: true
      }
    })

    if (!order) {
      throw new NotFoundError('Pedido nao encontrado')
    }

    if (order.status !== 'OPEN') {
      throw new ValidationError('Somente pedidos em aberto podem ser editados')
    }

    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: {
        recipe: true
      }
    })

    if (!product) {
      throw new NotFoundError('Produto nao encontrado')
    }

    if (!product.recipe) {
      throw new ValidationError(`Produto ${product.name} sem receita configurada`)
    }

    if (product.establishmentId !== order.table.establishmentId) {
      throw new ValidationError('Produto de estabelecimento diferente do pedido')
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existingItem = order.items.find((item) => item.productId === input.productId)

      if (existingItem) {
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + input.quantity
          }
        })
      } else {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: input.quantity,
            price: product.price
          }
        })
      }

      const items = await tx.orderItem.findMany({
        where: { orderId: order.id }
      })

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return tx.order.update({
        where: { id: order.id },
        data: { total },
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

    return updated
  }
}
