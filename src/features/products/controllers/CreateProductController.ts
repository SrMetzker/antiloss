import { Request, Response, NextFunction } from 'express'
import { CreateProductService } from '../services/CreateProductService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateProductService()

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, price, establishmentId, createdBy } = req.body

    if (!name) {
      throw new ValidationError('O nome do produto é obrigatório!')
    }

    if (price) {
      const priceNumber = parseFloat(price)
      if (isNaN(priceNumber) || priceNumber < 0) {
        throw new ValidationError('O preço do produto deve ser um número válido e não pode ser negativo!')
      }
    } else {
      throw new ValidationError('O preço do produto é obrigatório!')
    }

    if (!establishmentId) {
      throw new ValidationError('O ID do estabelecimento é obrigatório!')
    }

    if (!createdBy) {
      throw new ValidationError('Não foi possível identificar o usuário criador do produto!')
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
