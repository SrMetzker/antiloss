import { Request, Response, NextFunction } from 'express'
import { UpdateEstablishmentService } from '../services/UpdateEstablishmentService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateEstablishmentService()

export const updateEstablishment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name } = req.body

    if (!id) {
      throw new ValidationError('¡No fue posible identificar el establecimiento a actualizar!')
    }

    if (!name) {
      throw new ValidationError('¡El nombre del establecimiento es obligatorio!')
    }

    const establishment = await service.execute(id as string, name)

    res.json(establishment)
  } catch (error) {
    next(error)
  }
}
