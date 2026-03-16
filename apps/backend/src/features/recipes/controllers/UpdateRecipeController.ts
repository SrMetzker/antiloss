import { Request, Response, NextFunction } from 'express'
import { UpdateRecipeService } from '../services/UpdateRecipeService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateRecipeService()

export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params
    const { items } = req.body

    if (!productId) {
      throw new ValidationError('O productId e obrigatorio!')
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Os itens da receita sao obrigatorios!')
    }

    const recipe = await service.execute(productId as string, { items })

    res.json(recipe)
  } catch (error) {
    next(error)
  }
}