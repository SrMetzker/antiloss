import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../../../utils/errors'
import { GetKitchenOrdersService } from '../services/GetKitchenOrdersService'

const service = new GetKitchenOrdersService()

export const getKitchenOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const establishmentId = typeof req.query.establishmentId === 'string'
      ? req.query.establishmentId
      : undefined

    if (!establishmentId) {
      throw new ValidationError('establishmentId e obrigatorio para visualizar pedidos da cozinha')
    }

    const orders = await service.execute(establishmentId)
    res.json(orders)
  } catch (error) {
    next(error)
  }
}
