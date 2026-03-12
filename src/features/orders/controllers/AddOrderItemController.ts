import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../../../utils/errors'
import { AddOrderItemService } from '../services/AddOrderItemService'

const service = new AddOrderItemService()

export const addOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { productId, quantity } = req.body

    if (!id) {
      throw new ValidationError('Nao foi possivel identificar o pedido')
    }

    if (!productId) {
      throw new ValidationError('productId e obrigatorio')
    }

    const qty = Number(quantity ?? 1)
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new ValidationError('quantity deve ser maior que zero')
    }

    const order = await service.execute({
      orderId: id,
      productId,
      quantity: qty
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}
