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
      throw new AppError(400, 'Informe el establishmentId para consultar la suscripción')
    }

    if (input.userRole !== 'ADMIN' && !input.userEstablishmentIds.includes(selectedEstablishmentId)) {
      throw new AppError(403, 'Sin permiso para consultar la suscripción de este establecimiento')
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
      throw new AppError(404, 'Suscripción no encontrada para el establecimiento indicado')
    }

    return subscription
  }
}
