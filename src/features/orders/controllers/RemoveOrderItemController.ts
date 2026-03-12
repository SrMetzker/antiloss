import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../../../utils/errors'
import { RemoveOrderItemService } from '../services/RemoveOrderItemService'

const service = new RemoveOrderItemService()

export const removeOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId

    if (!id) {
      throw new ValidationError('Nao foi possivel identificar o pedido')
    }

    if (!itemId) {
      throw new ValidationError('itemId e obrigatorio')
    }

    const order = await service.execute({
      orderId: id,
      itemId
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}
