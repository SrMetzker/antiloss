import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteProductService {
  async execute(productId: string) {
    // Verifica se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new NotFoundError('Produto não encontrado!')
    }

    // Deleta o produto
    await prisma.product.delete({
      where: { id: productId }
    })

    return { message: 'Produto Deletado com sucesso!' }
  }
}
