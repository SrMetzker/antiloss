import { prisma } from '../../../config/database'

export class GetOrdersService {
  async execute(input?: { tableId?: string; establishmentId?: string; status?: string }) {
    const where: any = {}

    if (input?.tableId) {
      where.tableId = input.tableId
    }

    if (input?.status) {
      where.status = input.status
    }

    if (input?.establishmentId) {
      where.table = {
        establishmentId: input.establishmentId
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
