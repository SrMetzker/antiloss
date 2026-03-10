import { Request, Response, NextFunction } from 'express'
import { GetEstablishmentService } from '../services/GetEstablishmentService'

const service = new GetEstablishmentService()

export const getEstablishments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const establishments = await service.execute()
    res.json(establishments)
  } catch (error) {
    next(error)
  }
}
