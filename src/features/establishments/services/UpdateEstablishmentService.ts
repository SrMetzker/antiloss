import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class UpdateEstablishmentService {
  async execute(EstablishmentId: string, name: string) {
    // Verifica se o estabelecimento existe
    const establishmentExists = await prisma.establishment.findUnique({
      where: { id: EstablishmentId }
    })

    if (!establishmentExists) {
      throw new NotFoundError('Estabelecimento não encontrado!')
    }

    const establishment = await prisma.establishment.update({
      where: { id: EstablishmentId },
      data: {
        ...name && { name },
      }
    })

    return establishment
  }
}
