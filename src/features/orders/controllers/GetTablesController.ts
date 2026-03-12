import { Request, Response, NextFunction } from 'express'
import { GetTablesService } from '../services/GetTablesService'

const service = new GetTablesService()

export const getTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { establishmentId } = req.query
    const tables = await service.execute(establishmentId as string)
    res.json(tables)
  } catch (error) {
    next(error)
  }
}
