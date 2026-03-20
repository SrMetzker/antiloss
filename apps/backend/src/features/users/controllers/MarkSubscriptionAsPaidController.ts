import { Request, Response, NextFunction } from 'express'
import { MarkSubscriptionAsPaidService } from '../services/MarkSubscriptionAsPaidService'
import { ValidationError } from '../../../utils/errors'

const service = new MarkSubscriptionAsPaidService()

export const markSubscriptionAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario no autenticado')

    const { establishmentId, providerReference, amountCents } = req.body

    const payload: Parameters<MarkSubscriptionAsPaidService['execute']>[0] = {
      userRole: req.user.role,
      userEstablishmentIds: req.user.establishmentIds
    }

    if (typeof establishmentId === 'string' && establishmentId) {
      payload.establishmentId = establishmentId
    }

    if (typeof providerReference === 'string' && providerReference) {
      payload.providerReference = providerReference
    }

    if (typeof amountCents === 'number') {
      payload.amountCents = amountCents
    }

    const result = await service.execute(payload)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
