import { Request, Response, NextFunction } from 'express'
import { GetUsersService } from '../services/GetUsersService'

const service = new GetUsersService()

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { establishmentId } = req.query

    const users = await service.execute({
      establishmentId: establishmentId as string
    })

    res.json(users)

  } catch (error) {
    next(error)
  }
}
