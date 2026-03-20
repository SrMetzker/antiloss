import { prisma } from '../../../config/database'
import { AppError } from '../../../utils/errors'

interface Input {
  userRole: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF'
  userEstablishmentIds: string[]
  establishmentId?: string
  providerReference?: string
  amountCents?: number
}

const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const addYears = (date: Date, years: number) => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export class MarkSubscriptionAsPaidService {
  async execute(input: Input) {
    const selectedEstablishmentId =
      input.establishmentId ??
      (input.userEstablishmentIds.length === 1 ? input.userEstablishmentIds[0] : undefined)

    if (!selectedEstablishmentId) {
      throw new AppError(400, 'Informe el establishmentId para registrar el pago')
    }

    if (input.userRole !== 'ADMIN' && !input.userEstablishmentIds.includes(selectedEstablishmentId)) {
      throw new AppError(403, 'Sin permiso para registrar el pago de este establecimiento')
    }

    const subscription = await prisma.subscription.findUnique({
      where: { establishmentId: selectedEstablishmentId },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
            priceCents: true,
            billingCycle: true
          }
        }
      }
    })

    if (!subscription) {
      throw new AppError(404, 'Suscripción no encontrada para el establecimiento indicado')
    }

    const now = new Date()
    const nextPeriodEnd =
      subscription.plan.billingCycle === 'YEARLY' ? addYears(now, 1) : addMonths(now, 1)

    const amountCents = input.amountCents && input.amountCents > 0 ? input.amountCents : subscription.plan.priceCents

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          trialEndsAt: null,
          canceledAt: null,
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd
        },
        include: {
          plan: {
            select: {
              code: true,
              name: true,
              priceCents: true,
              currency: true,
              billingCycle: true
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

      await tx.billingHistory.create({
        data: {
          subscriptionId: subscription.id,
          provider: 'MANUAL',
          providerReference: input.providerReference ?? null,
          amountCents,
          status: 'SUCCEEDED',
          dueAt: now,
          paidAt: now
        }
      })

      return updatedSubscription
    })

    return updated
  }
}
