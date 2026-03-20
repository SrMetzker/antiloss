import { Request, Response, NextFunction } from 'express'
import { CreateProductService } from '../services/CreateProductService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateProductService()

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, price, establishmentId, createdBy: bodyCreatedBy } = req.body
    const createdBy = req.user?.userId ?? bodyCreatedBy

    if (!name) {
      throw new ValidationError('¡El nombre del producto es obligatorio!')
    }

    if (price) {
      const priceNumber = parseFloat(price)
      if (isNaN(priceNumber) || priceNumber < 0) {
        throw new ValidationError('¡El precio del producto debe ser un número válido y no puede ser negativo!')
      }
    } else {
      throw new ValidationError('¡El precio del producto es obligatorio!')
    }

    if (!establishmentId) {
      throw new ValidationError('¡El ID del establecimiento es obligatorio!')
    }

    if (!createdBy) {
      throw new ValidationError('¡No fue posible identificar al usuario creador del producto!')
    }

    const product = await service.execute({
      name,
      sku,
      price,
      establishmentId,
      createdBy
    })

    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}
