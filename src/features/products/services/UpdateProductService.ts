import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

interface UpdateProductInput {
  name?: string
  sku?: string
  price?: number
  establishmentId?: string
}

export class UpdateProductService {
  async execute(productId: string, input: UpdateProductInput) {
    // Verifica se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      throw new NotFoundError('Não foi possível identificar o produto para atualização!')
    }

    // Atualiza apenas os campos fornecidos
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.sku && { sku: input.sku }),
        ...(input.price && { price: input.price }),
        ...(input.establishmentId && { establishmentId: input.establishmentId })
      },
      include: {
        establishment: true
      }
    })

    return updatedProduct
  }
}
