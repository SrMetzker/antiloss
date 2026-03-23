import { prisma } from '../../../config/database'
import type { UserRole } from '../../../middleware/auth'

interface GetUsersInput {
  establishmentId?: string
  requesterRole?: UserRole | undefined
}

export class GetUsersService {
  async execute(input?: GetUsersInput) {
    const where: any = {}

    if (input?.establishmentId) {
      where.establishments = {
        some: {
          establishmentId: input.establishmentId
        }
      }
    }

    if (input?.requesterRole !== 'ADMIN') {
      where.role = {
        not: 'ADMIN'
      }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        createdBy: true,
        establishments: {
          include: {
            establishment: true
          }
        }
      },
      where,
      orderBy: { createdAt: 'desc' }
    })

    return users
  }
}
