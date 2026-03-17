import { NextFunction, Request, Response } from 'express'
import { ValidationError } from '../../../utils/errors'
import { ChangeSubscriptionPlanService } from '../services/ChangeSubscriptionPlanService'

const service = new ChangeSubscriptionPlanService()

export const changeSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario nao autenticado')

    const { establishmentId, planCode } = req.body

    if (typeof planCode !== 'string' || !planCode.trim()) {
      throw new ValidationError('planCode e obrigatorio')
    }

    const payload: Parameters<ChangeSubscriptionPlanService['execute']>[0] = {
      userRole: req.user.role,
      userEstablishmentIds: req.user.establishmentIds,
      planCode,
    }

    if (typeof establishmentId === 'string' && establishmentId) {
      payload.establishmentId = establishmentId
    }

    const result = await service.execute(payload)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
