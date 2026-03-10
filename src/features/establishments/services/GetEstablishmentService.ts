import { prisma } from '../../../config/database'

export class GetEstablishmentService {
  async execute() {
    const establishments = await prisma.establishment.findMany({
      include: {
        products: true
      }
    })

    return establishments
  }
}
