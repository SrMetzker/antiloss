import { Request, Response, NextFunction } from 'express'
import { UpdateProductService } from '../services/UpdateProductService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateProductService()

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, sku, price, establishmentId } = req.body

    if (!id) {
      throw new ValidationError('Não foi possível identificar o produto a ser atualizado!')
    }

    // Valida se pelo menos um campo foi fornecido
    if (!name && !sku && price === undefined && !establishmentId) {
      throw new ValidationError('Pelo menos um campo deve ser fornecido para a atualização!')
    }

    const updatedProduct = await service.execute(id as string, {
      name,
      sku,
      price,
      establishmentId
    })

    res.json(updatedProduct)
  } catch (error) {
    next(error)
  }
}
