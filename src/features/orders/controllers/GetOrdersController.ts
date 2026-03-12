import { Request, Response, NextFunction } from 'express'
import { GetOrdersService } from '../services/GetOrdersService'

const service = new GetOrdersService()

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, establishmentId } = req.query

    const orders = await service.execute({
      tableId: tableId as string,
      establishmentId: establishmentId as string
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
}
