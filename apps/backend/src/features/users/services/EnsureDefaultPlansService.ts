import { prisma } from '../../../config/database'

const defaultPlans = [
  {
    code: 'starter',
    name: 'Iniciante',
    description: 'Plano inicial para operacao basica',
    priceCents: 1490,
    currency: 'EUR' as const,
    billingCycle: 'MONTHLY' as const,
    trialDays: 14,
    maxUsers: 3,
    maxProducts: 50,
    maxTables: 4,
  },
  {
    code: 'pro',
    name: 'Profissional',
    description: 'Plano para bares e restaurantes em crescimento',
    priceCents: 3490,
    currency: 'EUR' as const,
    billingCycle: 'MONTHLY' as const,
    trialDays: 14,
    maxUsers: 10,
    maxProducts: 200,
    maxTables: 15,
  },
]

export const ensureDefaultPlans = async () => {
  const count = await prisma.plan.count({ where: { isActive: true } })
  if (count > 0) return

  await prisma.$transaction(
    defaultPlans.map((plan) =>
      prisma.plan.upsert({
        where: { code: plan.code },
        create: plan,
        update: {
          ...plan,
          isActive: true,
        },
      })
    )
  )
}
