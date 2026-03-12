import { Request, Response, NextFunction } from 'express'
import { CreateRecipeService } from '../services/CreateRecipeService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateRecipeService()

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, items, createdBy: bodyCreatedBy } = req.body
    const createdBy = req.user?.userId ?? bodyCreatedBy

    if (!productId) {
      throw new ValidationError('O productId é obrigatório!')
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Os itens da receita são obrigatórios!')
    }

    if (!createdBy) {
      throw new ValidationError('Não foi possível identificar o usuário criador da receita!')
    }

    const recipe = await service.execute({
      productId,
      items,
      createdBy
    })

    res.status(201).json(recipe)

  } catch (error) {
    next(error)
  }
}
