import { prisma } from '../../../config/database'

export class GetKitchenOrdersService {
  async execute(establishmentId: string) {
    const orders = await prisma.order.findMany({
      where: {
        status: 'OPEN',
        table: {
          establishmentId
        }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        table: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return orders
  }
}
