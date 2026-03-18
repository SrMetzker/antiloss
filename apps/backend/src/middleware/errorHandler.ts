import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      code: err.code,
      details: err.details,
    })
  }

  console.error(err)
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  })
}
