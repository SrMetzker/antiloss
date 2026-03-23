import { prisma } from '../../../config/database'
import { AppError, ValidationError } from '../../../utils/errors'

interface UpdateTableInput {
  id: string
  establishmentId: string
  capacity?: number
  isReserved?: boolean
}

export class UpdateTableService {
  async execute(input: UpdateTableInput) {
    if (input.capacity !== undefined && (!Number.isInteger(input.capacity) || input.capacity < 1)) {
      throw new ValidationError('capacity debe ser un entero mayor o igual a 1')
    }

    const table = await prisma.table.findUnique({
      where: { id: input.id },
      include: {
        orders: {
          where: { status: 'OPEN' },
          select: { id: true },
          take: 1,
        },
      },
    })

    if (!table) {
      throw new AppError(404, 'Mesa no encontrada')
    }

    if (table.establishmentId !== input.establishmentId) {
      throw new AppError(403, 'Sin acceso al establecimiento de la mesa')
    }

    const data: {
      capacity?: number
      isReserved?: boolean
    } = {}

    if (input.capacity !== undefined) {
      data.capacity = input.capacity
    }

    if (input.isReserved !== undefined) {
      data.isReserved = input.isReserved
    }

    const updated = await prisma.table.update({
      where: { id: input.id },
      data,
    })

    const openOrder = await prisma.order.findFirst({
      where: {
        tableId: input.id,
        status: 'OPEN',
      },
      select: { id: true },
    })

    const activeOrderId = openOrder?.id ?? null

    return {
      id: updated.id,
      number: updated.number,
      establishmentId: updated.establishmentId,
      capacity: updated.capacity,
      isReserved: updated.isReserved,
      activeOrderId,
      status: activeOrderId ? 'occupied' : updated.isReserved ? 'reserved' : 'free',
    }
  }
}
