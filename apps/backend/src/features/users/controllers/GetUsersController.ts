import { Request, Response, NextFunction } from 'express'
import { GetUsersService } from '../services/GetUsersService'
import type { UserRole } from '../../../middleware/auth'

const service = new GetUsersService()

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { establishmentId } = req.query
    const requesterRole = req.user?.role as UserRole | undefined

    const input = {
      establishmentId: establishmentId as string,
      ...(requesterRole ? { requesterRole } : {})
    }

    const users = await service.execute(input)

    res.json(users)

  } catch (error) {
    next(error)
  }
}
