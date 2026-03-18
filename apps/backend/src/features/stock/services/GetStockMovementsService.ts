import { prisma } from '../../../config/database'

interface GetMovementsInput {
  productId?: string
  establishmentId?: string
}

export class GetStockMovementsService {
  async execute(input?: GetMovementsInput) {
    const where: any = {}

    if (input?.productId) where.productId = input.productId

    if (input?.establishmentId) where.ingredient = {
      establishmentId: input.establishmentId
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      take: 100,
      include: {
        ingredient: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return stockMovements
  }
}
