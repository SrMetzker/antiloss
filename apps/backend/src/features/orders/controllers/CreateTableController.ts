import { Request, Response, NextFunction } from 'express'
import { CreateTableService } from '../services/CreateTableService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateTableService()

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { number, establishmentId } = req.body

    if (number === undefined || !establishmentId) {
      throw new ValidationError('number e establishmentId são obrigatórios')
    }

    const table = await service.execute({ number, establishmentId })
    res.status(201).json(table)
  } catch (error) {
    next(error)
  }
}
