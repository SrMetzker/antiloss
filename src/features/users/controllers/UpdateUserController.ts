import { Request, Response, NextFunction } from 'express'
import { UpdateUserService } from '../services/UpdateUserService'
import { ValidationError } from '../../../utils/errors'

const service = new UpdateUserService()

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { email, password, name } = req.body

    if (!id) {
      throw new ValidationError('Não foi possível identificar o usuário para atualização!')
    }

    if (!email && !password && !name) {
      throw new ValidationError('Pelo menos um campo deve ser fornecido para a atualização!')
    }

    const updatedUser = await service.execute(id as string, {
      email,
      password,
      name
    })

    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
}
