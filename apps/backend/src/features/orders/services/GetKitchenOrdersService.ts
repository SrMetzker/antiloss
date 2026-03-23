import { prisma } from '../../../config/database'

export class GetKitchenOrdersService {
  async execute(establishmentId: string) {
    const orders = await prisma.order.findMany({
      where: {
        status: 'OPEN',
        table: {
          establishmentId
        },
        items: {
          some: {
            product: {
              category: 'FOOD'
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        table: true,
        items: {
          where: {
            product: {
              category: 'FOOD'
            }
          },
          include: {
            product: true
          }
        }
      }
    })

    return orders
  }
}
