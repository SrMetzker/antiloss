import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteEstablishmentService {
  async execute(establishmentId: string) {
    // Verifica se o estabelecimento existe
    const establishmentExists = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    })

    if (!establishmentExists) {
      throw new NotFoundError('¡Establecimiento no encontrado!')
    }

    // Remover entidades relacionadas e o estabelecimento em uma transação
    await prisma.$transaction(async (tx) => {
      await tx.establishmentUser.deleteMany({
        where: { establishmentId: establishmentId }
      })

      await tx.stockMovement.deleteMany({
        where: {
          OR: [
            { ingredient: { establishmentId: establishmentId } },
            { product: { establishmentId: establishmentId } }
          ]
        }
      })

      await tx.recipeItem.deleteMany({
        where: {
          OR: [
            {
              recipe: {
                product: {
                  establishmentId: establishmentId
                }
              }
            },
            {
              ingredient: {
                establishmentId: establishmentId
              }
            }
          ]
        }
      })

      await tx.orderItem.deleteMany({
        where: {
          order: {
            table: {
              establishmentId: establishmentId
            }
          }
        }
      })

      await tx.order.deleteMany({
        where: {
          table: {
            establishmentId: establishmentId
          }
        }
      })

      await tx.table.deleteMany({
        where: { establishmentId: establishmentId }
      })

      // deletar recipes e produtos antes de establishment
      await tx.recipe.deleteMany({
        where: {
          product: {
            establishmentId: establishmentId
          }
        }
      })

      await tx.product.deleteMany({
        where: { establishmentId: establishmentId }
      })

      await tx.ingredient.deleteMany({
        where: { establishmentId: establishmentId }
      })

      await tx.establishment.delete({
        where: { id: establishmentId }
      })
    })

    return { message: '¡Establecimiento y productos vinculados eliminados con éxito!' }
  }
}
