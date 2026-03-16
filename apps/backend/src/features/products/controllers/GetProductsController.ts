import { Request, Response, NextFunction } from 'express'
import { GetProductsService } from '../services/GetProductsService'

const service = new GetProductsService()

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { establishmentId } = req.query

    const products = await service.execute({
      establishmentId: establishmentId as string
    })

    res.json(products)

  } catch (error) {
    next(error)
  }
}
