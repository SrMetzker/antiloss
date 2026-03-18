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
      throw new AppError(400, 'Informe o ID do estabelecimento para alterar o plano!')
    }

    if (input.userRole !== 'ADMIN' && !input.userEstablishmentIds.includes(selectedEstablishmentId)) {
      throw new AppError(403, 'Usuário sem permissão para alterar assinatura deste estabelecimento')
    }

    if (!input.planCode?.trim()) {
      throw new AppError(400, 'O código do plano é obrigatório!')
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
      throw new AppError(404, 'Plano não encontrado ou inativo')
    }

    const subscription = await prisma.subscription.findUnique({
      where: { establishmentId: selectedEstablishmentId },
      select: { id: true },
    })

    if (!subscription) {
      throw new AppError(404, 'Assinatura não encontrada para o estabelecimento informado')
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
