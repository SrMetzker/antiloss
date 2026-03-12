import { prisma } from '../../../config/database'

export class GetEstablishmentService {
  async execute(userId?: string, role?: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF') {
    const where = role === 'ADMIN' || !userId
      ? {}
      : {
          users: {
            some: {
              userId
            }
          }
        }

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        products: true
      }
    })

    return establishments
  }
}
