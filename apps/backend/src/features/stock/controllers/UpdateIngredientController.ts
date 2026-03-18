import { Request, Response, NextFunction } from 'express'
import { UpdateIngredientService } from '../services/UpdateIngredientService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateIngredientService()

export const updateIngredient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { name, unit, currentStock, minimumStock, createdBy } = req.body

    if (!id) {
      throw new ValidationError('El ID del ingrediente es obligatorio')
    }

    const updated = await service.execute(id, { name, unit, currentStock, minimumStock, createdBy })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}
