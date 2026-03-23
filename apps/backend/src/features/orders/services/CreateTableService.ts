import { prisma } from '../../../config/database'
import { AppError } from '../../../utils/errors'
import { enforceTableLimit } from '../../../utils/planLimits'

interface CreateTableInput {
  number: number
  establishmentId: string
  capacity?: number
  isReserved?: boolean
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
      throw new AppError(400, 'La mesa ya existe en este establecimiento')
    }

    await enforceTableLimit(input.establishmentId)

    const table = await prisma.table.create({
      data: {
        number: input.number,
        establishmentId: input.establishmentId,
        capacity: input.capacity ?? 4,
        isReserved: input.isReserved ?? false,
        createdAt: new Date()
      }
    })

    return table
  }
}
