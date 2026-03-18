import { Request, Response, NextFunction } from 'express'
import { GetOrdersService } from '../services/GetOrdersService'
import { AppError } from '../../../utils/errors'

const service = new GetOrdersService()

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, establishmentId, status } = req.query

    if (req.user?.role === 'BARTENDER' && !tableId) {
      throw new AppError(400, '¡Usuario sin permiso para acceder a pedidos sin informar la mesa!')
    }

    const orders = await service.execute({
      tableId: tableId as string,
      establishmentId: establishmentId as string,
      status: req.user?.role === 'BARTENDER' ? 'OPEN' : status as string
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
}
