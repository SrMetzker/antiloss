import { NextFunction, Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../utils/errors'

const isAdmin = (req: Request) => req.user?.role === 'ADMIN'

const parseString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

const isSubscriptionAccessible = (
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',
  trialEndsAt: Date | null,
  now: Date
) => {
  if (status === 'ACTIVE') return true
  if (status !== 'TRIAL') return false
  if (!trialEndsAt) return false
  return trialEndsAt > now
}

export const ensureSubscriptionAccess = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (isAdmin(req)) return next()

    const establishmentIds = req.user?.establishmentIds ?? []
    if (!establishmentIds.length) {
      throw new AppError(403, 'Usuario sem vinculo de estabelecimento')
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { establishmentId: { in: establishmentIds } },
      select: {
        establishmentId: true,
        status: true,
        trialEndsAt: true
      }
    })

    const now = new Date()
    const accessibleEstablishments = new Set(
      subscriptions
        .filter((item) => isSubscriptionAccessible(item.status, item.trialEndsAt, now))
        .map((item) => item.establishmentId)
    )

    if (!accessibleEstablishments.size) {
      throw new AppError(402, 'Assinatura inativa ou trial expirado para este estabelecimento')
    }

    const requestEstablishmentId =
      parseString((req.query as Record<string, unknown>).establishmentId) ??
      parseString(req.body?.establishmentId) ??
      parseString(req.params?.establishmentId)

    if (requestEstablishmentId && !accessibleEstablishments.has(requestEstablishmentId)) {
      throw new AppError(402, 'Assinatura inativa para o estabelecimento informado')
    }

    next()
  } catch (error) {
    next(error)
  }
}
