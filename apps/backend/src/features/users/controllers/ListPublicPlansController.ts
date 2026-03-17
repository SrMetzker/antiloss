import { Request, Response, NextFunction } from 'express'
import { ListPublicPlansService } from '../services/ListPublicPlansService'

const service = new ListPublicPlansService()

export const listPublicPlans = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await service.execute()
    res.json(plans)
  } catch (error) {
    next(error)
  }
}
