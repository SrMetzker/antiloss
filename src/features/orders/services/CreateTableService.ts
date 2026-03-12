import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

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
