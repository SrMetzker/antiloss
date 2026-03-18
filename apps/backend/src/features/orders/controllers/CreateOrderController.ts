import { Request, Response, NextFunction } from 'express'
import { CreateOrderService } from '../services/CreateOrderService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateOrderService()

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, items } = req.body

    if (!tableId) {
      throw new ValidationError('¡No fue posible identificar la mesa para crear el pedido!')
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('¡El pedido debe contener al menos un ítem!')
    }

    const order = await service.execute({ tableId, items })

    res.status(201).json(order)

  } catch (error) {
    next(error)
  }
}
