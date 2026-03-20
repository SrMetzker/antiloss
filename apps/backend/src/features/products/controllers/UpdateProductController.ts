import { Request, Response, NextFunction } from 'express'
import { UpdateProductService } from '../services/UpdateProductService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateProductService()

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, sku, price, establishmentId } = req.body

    if (!id) {
      throw new ValidationError('¡No fue posible identificar el producto a actualizar!')
    }

    // Valida se pelo menos um campo foi fornecido
    if (!name && !sku && price === undefined && !establishmentId) {
      throw new ValidationError('¡Al menos un campo debe ser proporcionado para la actualización!')
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
