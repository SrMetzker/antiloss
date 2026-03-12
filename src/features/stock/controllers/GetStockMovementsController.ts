import { Request, Response, NextFunction } from 'express'
import { GetStockMovementsService } from '../services/GetStockMovementsService'

const service = new GetStockMovementsService()

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.query

    const stockMovements = await service.execute({
      productId: productId as string
    })

    res.json(stockMovements)
  } catch (error) {
    next(error)
  }
}
