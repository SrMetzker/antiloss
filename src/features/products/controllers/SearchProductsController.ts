import { Request, Response, NextFunction } from 'express'
import { SearchProductsService } from '../services/SearchProductsService'

const service = new SearchProductsService()

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, establishmentId } = req.query

    const products = await service.execute({
      name: name as string,
      sku: sku as string,
      establishmentId: establishmentId as string
    })

    res.json(products)
  } catch (error) {
    next(error)
  }
}
