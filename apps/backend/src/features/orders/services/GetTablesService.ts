import { prisma } from '../../../config/database'

export class GetTablesService {
  async execute(establishmentId?: string) {
    const where = establishmentId ? { establishmentId } : {}
    const tables = await prisma.table.findMany({
      where,
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        establishmentId: true,
        capacity: true,
        isReserved: true,
        orders: {
          where: { status: 'OPEN' },
          select: { id: true },
          take: 1,
        },
      }
    })

    return tables.map(({ orders, ...table }) => {
      const activeOrderId = orders[0]?.id ?? null

      return {
        ...table,
        activeOrderId,
        status: activeOrderId ? 'occupied' : table.isReserved ? 'reserved' : 'free',
      }
    })
  }
}
