import { Request, Response, NextFunction } from 'express'
import { LoginService } from '../services/LoginService'

const service = new LoginService()

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    const result = await service.execute({
      email,
      password
    })

    res.json(result)

  } catch (error) {
    next(error)
  }
}
