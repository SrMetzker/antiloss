import { Request, Response, NextFunction } from 'express'
import { CloseOrderService } from '../services/CloseOrderService'
import { ValidationError } from '../../../utils/errors'

const service = new CloseOrderService()

export const closeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { createdBy: bodyCreatedBy, allowNegativeStock } = req.body
    const createdBy = req.user?.userId ?? bodyCreatedBy

    if (!id) {
      throw new ValidationError('Nao foi possivel identificar o pedido para finalizar')
    }

    if (!createdBy) {
      throw new ValidationError('createdBy e obrigatorio para registrar movimentacao de estoque')
    }

    const order = await service.execute({
      orderId: id as string,
      createdBy,
      allowNegativeStock: Boolean(allowNegativeStock),
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}