import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteEstablishmentService {
  async execute(EstablishmentId: string) {
    // Verifica se o estabelecimento existe
    const establishmentExists = await prisma.establishment.findUnique({
      where: { id: EstablishmentId }
    })

    if (!establishmentExists) {
      throw new NotFoundError('Estabelecimento não encontrado!')
    }

    // Remover entidades relacionadas e o estabelecimento em uma transação
    await prisma.$transaction(async (tx) => {
      await tx.recipeItem.deleteMany({
        where: {
          recipe: {
            product: {
              establishmentId: EstablishmentId
            }
          }
        }
      })

      // deletar recipes e produtos antes de establishment
      await tx.recipe.deleteMany({
        where: {
          product: {
            establishmentId: EstablishmentId
          }
        }
      })

      await tx.product.deleteMany({
        where: { establishmentId: EstablishmentId }
      })

      await tx.ingredient.deleteMany({
        where: { establishmentId: EstablishmentId }
      })

      await tx.orderItem.deleteMany({
        where: {
          order: {
            table: {
              establishmentId: EstablishmentId
            }
          }
        }
      })

      await tx.order.deleteMany({
        where: {
          table: {
            establishmentId: EstablishmentId
          }
        }
      })

      await tx.table.deleteMany({
        where: { establishmentId: EstablishmentId }
      })

      await tx.stockMovement.deleteMany({
        where: {
          OR: [
            { ingredient: { establishmentId: EstablishmentId } },
            { product: { establishmentId: EstablishmentId } }
          ]
        }
      })

      await tx.establishment.delete({
        where: { id: EstablishmentId }
      })
    })

    return { message: 'Estabelecimento e produtos vinculados excluídos com sucesso!'}
  }
}
