import { Request, Response, NextFunction } from 'express'
import { UpdateTableService } from '../services/UpdateTableService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateTableService()

export const updateTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { establishmentId, capacity, isReserved } = req.body

    if (!id || !establishmentId) {
      throw new ValidationError('id y establishmentId son obligatorios')
    }

    const table = await service.execute({
      id: id as string,
      establishmentId,
      capacity,
      isReserved,
    })

    res.json(table)
  } catch (error) {
    next(error)
  }
}
