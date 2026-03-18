import { Request, Response, NextFunction } from 'express'
import { CreateUserService } from '../services/CreateUserService'
import { AppError, ValidationError } from '../../../utils/errors'

const service = new CreateUserService()

const normalizeRole = (value: unknown): 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF' | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === 'ADMIN' || normalized === 'MANAGER' || normalized === 'BARTENDER' || normalized === 'CHEF') {
    return normalized
  }

  throw new ValidationError('Role invalida. Use ADMIN, MANAGER, BARTENDER ou CHEF')
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role, establishmentIds, createdBy: bodyCreatedBy } = req.body
    const createdBy = req.user?.userId ?? bodyCreatedBy

    let scopedRole = normalizeRole(role)
    let scopedEstablishmentIds = establishmentIds as string[] | undefined

    if (req.user?.role === 'MANAGER') {
      if (role === 'ADMIN' || role === 'MANAGER') {
        throw new AppError(400, 'Usuário sem permissão para atribuir o papel informado!')
      }

      const allowed = new Set(req.user.establishmentIds)
      scopedEstablishmentIds = (establishmentIds as string[] | undefined)?.length
        ? (establishmentIds as string[]).filter((id) => allowed.has(id))
        : [...allowed]

      if (!scopedEstablishmentIds.length) {
        throw new AppError(400, 'Usuário deve ser vinculado a pelo menos um estabelecimento!')
      }

      scopedRole = role ?? 'BARTENDER'
    }

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
      email: email as string,
      password: password as string,
      name: name as string,
      role: scopedRole,
      establishmentIds: scopedEstablishmentIds,
      createdBy: createdBy as string
    })

    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}
