import { Request, Response, NextFunction } from 'express'
import { CreateTableService } from '../services/CreateTableService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateTableService()

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { number, establishmentId, capacity } = req.body

    if (number === undefined || !establishmentId) {
      throw new ValidationError('number y establishmentId son obligatorios')
    }

    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      throw new ValidationError('capacity debe ser un entero mayor o igual a 1')
    }

    const table = await service.execute({ number, establishmentId, capacity })
    res.status(201).json(table)
  } catch (error) {
    next(error)
  }
}
