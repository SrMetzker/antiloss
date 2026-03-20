import { prisma } from '../config/database'
import { AppError, NotFoundError } from './errors'

interface PlanContext {
  establishmentId: string
  establishmentName: string
  planName: string
  maxUsers: number
  maxProducts: number
  maxTables: number | null
}

const getPlanContext = async (establishmentId: string): Promise<PlanContext> => {
  const subscription = await prisma.subscription.findUnique({
    where: { establishmentId },
    select: {
      establishmentId: true,
      establishment: {
        select: {
          name: true,
        },
      },
      plan: {
        select: {
          name: true,
          maxUsers: true,
          maxProducts: true,
          maxTables: true,
        },
      },
    },
  })

  if (!subscription) {
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true },
    })

    if (!establishment) {
      throw new NotFoundError('No fue posible identificar el establecimiento indicado')
    }

    throw new AppError(409, 'Establecimiento sin suscripción/plan configurado')
  }

  return {
    establishmentId: subscription.establishmentId,
    establishmentName: subscription.establishment.name,
    planName: subscription.plan.name,
    maxUsers: subscription.plan.maxUsers,
    maxProducts: subscription.plan.maxProducts,
    maxTables: subscription.plan.maxTables,
  }
}

export const enforceUserLimitForEstablishments = async (establishmentIds: string[]) => {
  const uniqueEstablishments = [...new Set(establishmentIds)]

  await Promise.all(
    uniqueEstablishments.map(async (establishmentId) => {
      const context = await getPlanContext(establishmentId)
      const currentUsers = await prisma.establishmentUser.count({
        where: { establishmentId },
      })

      if (currentUsers >= context.maxUsers) {
        throw new AppError(
          422,
          `Límite de usuarios alcanzado en el plan ${context.planName} para ${context.establishmentName} (${context.maxUsers})`
        )
      }
    })
  )
}

export const enforceProductLimit = async (establishmentId: string) => {
  const context = await getPlanContext(establishmentId)
  const currentProducts = await prisma.product.count({
    where: { establishmentId },
  })

  if (currentProducts >= context.maxProducts) {
    throw new AppError(
      422,
      `Límite de productos alcanzado en el plan ${context.planName} para ${context.establishmentName} (${context.maxProducts})`
    )
  }
}

export const enforceTableLimit = async (establishmentId: string) => {
  const context = await getPlanContext(establishmentId)
  if (context.maxTables == null) return

  const currentTables = await prisma.table.count({
    where: { establishmentId },
  })

  if (currentTables >= context.maxTables) {
    throw new AppError(
      422,
      `Límite de mesas alcanzado en el plan ${context.planName} para ${context.establishmentName} (${context.maxTables})`
    )
  }
}
