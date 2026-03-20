import { Request, Response, NextFunction } from 'express'
import { DeleteIngredientService } from '../services/DeleteIngredientService'
import { ValidationError } from '../../../utils/errors'

const service = new DeleteIngredientService()

export const deleteIngredient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) {
      throw new ValidationError('El ID del ingrediente es obligatorio')
    }

    const result = await service.execute(id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
