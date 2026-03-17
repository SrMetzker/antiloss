import { prisma } from '../../../config/database'
import { ensureDefaultPlans } from './EnsureDefaultPlansService'

export class ListPublicPlansService {
  async execute() {
    await ensureDefaultPlans()

    return prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        priceCents: true,
        currency: true,
        billingCycle: true,
        trialDays: true,
        maxUsers: true,
        maxProducts: true,
        maxTables: true
      },
      orderBy: { priceCents: 'asc' }
    })
  }
}
