import { prisma } from '../../../config/database'

interface GetMovementsInput {
  productId?: string
}

export class GetStockMovementsService {
  async execute(input?: GetMovementsInput) {
    const where: any = {}
    if (input?.productId) where.productId = input.productId

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      take: 15,
      include: {
        ingredient: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return stockMovements
  }
}
