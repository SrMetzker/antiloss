import { Request, Response, NextFunction } from 'express'
import { DeleteUserService } from '../services/DeleteUserService'
import { ValidationError } from '../../../utils/errors'

const service = new DeleteUserService()

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ValidationError('O ID do usuário é obrigatório!')
    }

    const result = await service.execute(id as string)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
