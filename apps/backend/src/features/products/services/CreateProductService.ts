import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'
import { enforceProductLimit } from '../../../utils/planLimits'

interface CreateProductInput {
  name: string
  sku: string
  price: number
  category?: 'SPIRITS' | 'BEER' | 'WINE' | 'COCKTAILS' | 'SOFT_DRINKS' | 'FOOD' | 'OTHER'
  establishmentId: string
  createdBy: string
}

export class CreateProductService {
  async execute(input: CreateProductInput) {
    // Verifica se o estabelecimento existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: input.establishmentId }
    });
    if (!establishment) {
      throw new NotFoundError('¡No fue posible identificar el establecimiento para el producto!')
    }

    await enforceProductLimit(input.establishmentId)

    const product = await prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku,
        price: input.price,
        category: input.category ?? 'OTHER',
        establishmentId: input.establishmentId,
        createdAt: new Date(),
        createdBy: input.createdBy
      },
      include: {
        establishment: true
      }
    })

    return product
  }
}
