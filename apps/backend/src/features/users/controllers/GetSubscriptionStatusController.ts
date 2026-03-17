import { Request, Response, NextFunction } from 'express'
import { GetSubscriptionStatusService } from '../services/GetSubscriptionStatusService'
import { ValidationError } from '../../../utils/errors'

const service = new GetSubscriptionStatusService()

export const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario nao autenticado')

    const establishmentId =
      typeof req.query.establishmentId === 'string' ? req.query.establishmentId : undefined

    const payload: Parameters<GetSubscriptionStatusService['execute']>[0] = {
      userRole: req.user.role,
      userEstablishmentIds: req.user.establishmentIds
    }

    if (establishmentId) {
      payload.establishmentId = establishmentId
    }

    const result = await service.execute(payload)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
