import { Request, Response, NextFunction } from 'express'
import { RegisterService } from '../services/RegisterService'
import { ValidationError } from '../../../utils/errors'

const service = new RegisterService()

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, establishmentName, planCode } = req.body

    if (!email) throw new ValidationError('El email es obligatorio')
    if (!password) throw new ValidationError('La contraseña es obligatoria')
    if (!name) throw new ValidationError('El nombre es obligatorio')
    if (!establishmentName) throw new ValidationError('El nombre del establecimiento es obligatorio')

    const result = await service.execute({
      email,
      password,
      name,
      establishmentName,
      planCode
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}
