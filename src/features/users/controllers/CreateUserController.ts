import { Request, Response, NextFunction } from 'express'
import { CreateUserService } from '../services/CreateUserService'
import { ValidationError } from '../../../utils/errors'

const service = new CreateUserService()

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, createdBy } = req.body

    if (!email) {
      throw new ValidationError('O email é obrigatório!')
    }
    if (!password) {
      throw new ValidationError('A senha é obrigatória!')
    }
    if (!name) {
      throw new ValidationError('O nome é obrigatório!')
    }
    if (!createdBy) {
      throw new ValidationError('Não foi possível identificar o usuário criador do novo usuário!')
    }

    const user = await service.execute({
      email,
      password,
      name,
      createdBy
    })

    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}
