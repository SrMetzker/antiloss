import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/errors'

export type UserRole = 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF'

interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  establishmentIds: string[]
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    throw new AppError(401, 'Access token required')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    throw new AppError(403, 'Invalid or expired token')
  }
}
