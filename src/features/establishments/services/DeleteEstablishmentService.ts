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

    // Remover produtos vinculados e, em seguida, o estabelecimento em uma transação
    await prisma.$transaction(async (tx) => {
      await tx.product.deleteMany({
        where: { establishmentId: EstablishmentId }
      })

      await tx.establishment.delete({
        where: { id: EstablishmentId }
      })
    })

    return { message: 'Estabelecimento e produtos vinculados excluídos com sucesso!'}
  }
}
