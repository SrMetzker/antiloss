import { Request, Response, NextFunction } from 'express'
import { GetIngredientsService } from '../services/GetIngredientsService'

const service = new GetIngredientsService()

export const getIngredients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { establishmentId } = req.query

    const ingredients = await service.execute({
      establishmentId: establishmentId as string
    })

    res.json(ingredients)
  } catch (error) {
    next(error)
  }
}
