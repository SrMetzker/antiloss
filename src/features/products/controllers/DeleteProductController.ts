import { Request, Response, NextFunction } from 'express'
import { DeleteProductService } from '../services/DeleteProductService'
import { ValidationError } from '../../../utils/errors'

const service = new DeleteProductService()

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ValidationError('O ID do produto é obrigatório!')
    }

    const result = await service.execute(id as string)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
