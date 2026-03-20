import { Request, Response, NextFunction } from 'express'
import { DeleteRecipeService } from '../services/DeleteRecipeService'
import { ValidationError } from '../../../utils/errors'

const service = new DeleteRecipeService()

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params

    if (!productId) {
      throw new ValidationError('¡El productId es obligatorio!')
    }

    const result = await service.execute(productId as string)

    res.json(result)
  } catch (error) {
    next(error)
  }
}