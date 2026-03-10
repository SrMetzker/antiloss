import { prisma } from '../../../config/database'

interface GetUsersInput {
  establishmentId?: string
}

export class GetUsersService {
  async execute(input?: GetUsersInput) {
    const where: any = {};

    if (input?.establishmentId) {
      where.establishmentId = input.establishmentId
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return users
  }
}
