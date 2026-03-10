import { prisma } from '../../../config/database'

interface SearchProductsInput {
  name?: string
  sku?: string
  establishmentId?: string
}

export class SearchProductsService {
  async execute(input: SearchProductsInput) {
    const where: any = {}

    if (input.name) {
      where.name = {
        contains: input.name,
        mode: 'insensitive' // Case insensitive
      }
    }

    if (input.sku) {
      where.sku = {
        contains: input.sku,
        mode: 'insensitive'
      }
    }

    if (input.establishmentId) {
      where.establishmentId = input.establishmentId
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        establishment: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Últimas 5 movimentações
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return products
  }
}
