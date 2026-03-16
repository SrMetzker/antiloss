import { Request, Response, NextFunction } from 'express'
import { CreateEstablishmentService } from '../services/CreateEstablishmentService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateEstablishmentService()

export const createEstablishment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, createdBy: bodyCreatedBy } = req.body
    const createdBy = req.user?.userId ?? bodyCreatedBy

    if (!name) {
      throw new ValidationError('O nome do estabelecimento é obrigatório!')
    }
    if (!createdBy) {
      throw new ValidationError('Não foi possível identificar o usuário criador do estabelecimento!')
    }

    const establishment = await service.execute({ name, createdBy })

    res.json(establishment)
  } catch (error) {
    next(error)
  }
}
