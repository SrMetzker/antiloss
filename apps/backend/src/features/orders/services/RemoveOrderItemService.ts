import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

interface RemoveOrderItemInput {
  orderId: string
  itemId: string
}

export class RemoveOrderItemService {
  async execute(input: RemoveOrderItemInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        table: true
      }
    })

    if (!order) {
      throw new NotFoundError('Pedido nao encontrado')
    }

    if (order.status !== 'OPEN') {
      throw new ValidationError('Somente pedidos em aberto podem ser editados')
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: input.itemId }
    })

    if (!orderItem || orderItem.orderId !== order.id) {
      throw new NotFoundError('Item de pedido nao encontrado')
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({
        where: { id: orderItem.id }
      })

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
