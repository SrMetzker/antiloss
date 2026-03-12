import { prisma } from '../../../config/database'

export class GetTablesService {
  async execute(establishmentId?: string) {
    const where = establishmentId ? { establishmentId } : {}
    const tables = await prisma.table.findMany({
      where,
      orderBy: { number: 'asc' }
    })
    return tables
  }
}
