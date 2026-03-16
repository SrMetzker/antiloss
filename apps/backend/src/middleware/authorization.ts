import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import type { UserRole } from './auth'

const isAdmin = (req: Request) => req.user?.role === 'ADMIN'

const hasEstablishmentAccess = (req: Request, establishmentId?: string | null) => {
  if (isAdmin(req)) return true
  if (!establishmentId) return false
  return req.user?.establishmentIds.includes(establishmentId) ?? false
}

const ensureEstablishmentsForNonAdmin = (req: Request) => {
  if (isAdmin(req)) return

  if (!req.user?.establishmentIds.length) {
    throw new AppError(403, 'Usuario sem vinculo de estabelecimento')
  }
}

const getQueryParam = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role
    if (!userRole || !roles.includes(userRole)) {
      throw new AppError(403, 'Sem permissao para esta operacao')
    }
    next()
  }
}

export const enforceEstablishmentScope = (source: 'query' | 'body' = 'query') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    ensureEstablishmentsForNonAdmin(req)

    if (isAdmin(req)) return next()

    const fieldValue =
      source === 'query'
        ? getQueryParam((req.query as Record<string, unknown>).establishmentId)
        : (req.body?.establishmentId as string | undefined)

    if (!fieldValue) {
      if ((req.user?.establishmentIds.length ?? 0) === 1) {
        const [first] = req.user!.establishmentIds
        if (source === 'query') {
          req.query.establishmentId = first
        } else {
          req.body.establishmentId = first
        }
        return next()
      }

      throw new AppError(400, 'establishmentId e obrigatorio para este usuario')
    }

    if (!hasEstablishmentAccess(req, fieldValue)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento informado')
    }

    next()
  }
}

export const enforceTableAccessFromBody = (field = 'tableId') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const tableId = req.body?.[field] as string | undefined
    if (!tableId) {
      throw new AppError(400, `${field} e obrigatorio`)
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { establishmentId: true }
    })

    if (!table) {
      throw new AppError(404, 'Mesa nao encontrada')
    }

    if (!hasEstablishmentAccess(req, table.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento da mesa')
    }

    next()
  }
}

export const enforceTableAccessFromQuery = (field = 'tableId') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const tableId = getQueryParam((req.query as Record<string, unknown>)[field])
    if (!tableId) return next()

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { establishmentId: true }
    })

    if (!table) {
      throw new AppError(404, 'Mesa nao encontrada')
    }

    if (!hasEstablishmentAccess(req, table.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento da mesa')
    }

    next()
  }
}

export const enforceOrderAccessFromParam = (param = 'id') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const orderId = req.params[param]
    if (!orderId) {
      throw new AppError(400, `${param} e obrigatorio`)
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
      select: {
        table: {
          select: {
            establishmentId: true
          }
        }
      }
    })

    if (!order) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    if (!hasEstablishmentAccess(req, order.table.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento do pedido')
    }

    next()
  }
}

export const enforceProductAccessFromParam = (param = 'id') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const productId = req.params[param]
    if (!productId) {
      throw new AppError(400, `${param} e obrigatorio`)
    }

    const product = await prisma.product.findUnique({
      where: { id: productId as string },
      select: { establishmentId: true }
    })

    if (!product) {
      throw new AppError(404, 'Produto nao encontrado')
    }

    if (!hasEstablishmentAccess(req, product.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento do produto')
    }

    next()
  }
}

export const enforceIngredientAccessFromParam = (param = 'id') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const ingredientId = req.params[param]
    if (!ingredientId) {
      throw new AppError(400, `${param} e obrigatorio`)
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId as string },
      select: { establishmentId: true }
    })

    if (!ingredient) {
      throw new AppError(404, 'Ingrediente nao encontrado')
    }

    if (!hasEstablishmentAccess(req, ingredient.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento do ingrediente')
    }

    next()
  }
}

export const enforceRecipeAccessByProductParam = (param = 'productId') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const productId = req.params[param]
    if (!productId) {
      throw new AppError(400, `${param} e obrigatorio`)
    }

    const product = await prisma.product.findUnique({
      where: { id: productId as string },
      select: { establishmentId: true }
    })

    if (!product) {
      throw new AppError(404, 'Produto nao encontrado')
    }

    if (!hasEstablishmentAccess(req, product.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento do produto')
    }

    next()
  }
}

export const enforceProductAccessFromBody = (field = 'productId') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdmin(req)) return next()

    const productId = req.body?.[field] as string | undefined
    if (!productId) {
      throw new AppError(400, `${field} e obrigatorio`)
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { establishmentId: true }
    })

    if (!product) {
      throw new AppError(404, 'Produto nao encontrado')
    }

    if (!hasEstablishmentAccess(req, product.establishmentId)) {
      throw new AppError(403, 'Sem acesso ao estabelecimento do produto')
    }

    next()
  }
}
