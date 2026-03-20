import { prisma } from '../../../config/database'
import { AppError } from '../../../utils/errors'

interface Input {
  userRole: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF'
  userEstablishmentIds: string[]
  establishmentId?: string
  planCode: string
}

export class ChangeSubscriptionPlanService {
  async execute(input: Input) {
    const selectedEstablishmentId =
      input.establishmentId ??
      (input.userEstablishmentIds.length === 1 ? input.userEstablishmentIds[0] : undefined)

    if (!selectedEstablishmentId) {
      throw new AppError(400, '¡Informe el ID del establecimiento para cambiar el plan!')
    }

    if (input.userRole !== 'ADMIN' && !input.userEstablishmentIds.includes(selectedEstablishmentId)) {
      throw new AppError(403, 'Usuario sin permiso para modificar la suscripción de este establecimiento')
    }

    if (!input.planCode?.trim()) {
      throw new AppError(400, '¡El código del plan es obligatorio!')
    }

    const plan = await prisma.plan.findFirst({
      where: {
        code: input.planCode,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (!plan) {
      throw new AppError(404, 'Plan no encontrado o inactivo')
    }

    const subscription = await prisma.subscription.findUnique({
      where: { establishmentId: selectedEstablishmentId },
      select: { id: true },
    })

    if (!subscription) {
      throw new AppError(404, 'Suscripción no encontrada para el establecimiento indicado')
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: plan.id,
      },
      include: {
        plan: {
          select: {
            code: true,
            name: true,
            priceCents: true,
            currency: true,
            billingCycle: true,
            trialDays: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return updated
  }
}
