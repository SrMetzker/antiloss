import { prisma } from '../../../config/database'

interface GetUsersInput {
  establishmentId?: string
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
