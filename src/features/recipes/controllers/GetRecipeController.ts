import { Request, Response, NextFunction } from 'express'
import { GetRecipeService } from '../services/GetRecipeService'
import { ValidationError } from '../../../utils/errors'

const service = new GetRecipeService()

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params

    if (!productId) {
      throw new ValidationError('O productId e obrigatorio!')
    }

    const recipe = await service.execute(productId as string)

    res.json(recipe)
  } catch (error) {
    next(error)
  }
}