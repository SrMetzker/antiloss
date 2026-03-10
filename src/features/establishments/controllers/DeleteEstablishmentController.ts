import { Request, Response, NextFunction } from 'express'
import { DeleteEstablishmentService } from '../services/DeleteEstablishmentService'
import { ValidationError } from '../../../utils/errors'

const service = new DeleteEstablishmentService()

export const deleteEstablishment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ValidationError('Não foi possível identificar o estabelecimento a ser atualizado!')
    }

    const establishment = await service.execute(id as string)

    res.json(establishment)
  } catch (error) {
    next(error)
  }
}
