import { Request, Response, NextFunction } from 'express'
import { GetRecipeByProductService } from '../services/GetRecipeByProductService'

const service = new GetRecipeByProductService()

export const getRecipeByProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId

    if (!productId) {
      throw new Error('productId is required')
    }

    const recipe = await service.execute(productId)
    res.json(recipe)
  } catch (error) {
    next(error)
  }
}
