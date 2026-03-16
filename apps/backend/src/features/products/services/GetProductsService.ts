import { prisma } from '../../../config/database'

interface GetProductsInput {
  establishmentId?: string
}

export class GetProductsService {
  async execute(input?: GetProductsInput) {
    const where: any = {}

    if (input?.establishmentId) {
      where.establishmentId = input.establishmentId
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        establishment: true,
        stockMovements: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return products
  }
}
