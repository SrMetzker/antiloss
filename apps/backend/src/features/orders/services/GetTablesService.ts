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
        orders: {
          where: { status: 'OPEN' },
          select: { id: true },
          take: 1,
        },
      }
    })

    return tables.map(({ orders, ...table }) => ({
      ...table,
      activeOrderId: orders[0]?.id ?? null,
    }))
  }
}
