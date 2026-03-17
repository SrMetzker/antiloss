import { prisma } from '../../../config/database'
import { AppError } from '../../../utils/errors'

interface Input {
  userRole: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF'
  userEstablishmentIds: string[]
  establishmentId?: string
}

export class GetSubscriptionStatusService {
  async execute(input: Input) {
    const selectedEstablishmentId =
      input.establishmentId ??
      (input.userEstablishmentIds.length === 1 ? input.userEstablishmentIds[0] : undefined)

    if (!selectedEstablishmentId) {
      throw new AppError(400, 'Informe establishmentId para consultar assinatura')
    }

    if (input.userRole !== 'ADMIN' && !input.userEstablishmentIds.includes(selectedEstablishmentId)) {
      throw new AppError(403, 'Sem permissao para consultar assinatura deste estabelecimento')
    }

    const subscription = await prisma.subscription.findUnique({
      where: { establishmentId: selectedEstablishmentId },
      include: {
        plan: {
          select: {
            code: true,
            name: true,
            priceCents: true,
            currency: true,
            billingCycle: true,
            trialDays: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!subscription) {
      throw new AppError(404, 'Assinatura nao encontrada para o estabelecimento informado')
    }

    return subscription
  }
}
