import { prisma } from '../../../config/database'
import { enforceTableLimit } from '../../../utils/planLimits'

interface CreateTableInput {
  number: number
  establishmentId: string
}

export class CreateTableService {
  async execute(input: CreateTableInput) {
    const exists = await prisma.table.findFirst({
      where: {
        number: input.number,
        establishmentId: input.establishmentId
      }
    })

    if (exists) {
      throw new Error('Table already exists for this establishment')
    }

    await enforceTableLimit(input.establishmentId)

    const table = await prisma.table.create({
      data: {
        number: input.number,
        establishmentId: input.establishmentId,
        createdAt: new Date()
      }
    })

    return table
  }
}
