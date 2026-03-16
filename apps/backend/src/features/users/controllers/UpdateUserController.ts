import { Request, Response, NextFunction } from 'express'
import { UpdateUserService } from '../services/UpdateUserService'
import { AppError, ValidationError } from '../../../utils/errors'

const service = new UpdateUserService()

const normalizeRole = (value: unknown): 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF' | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === 'ADMIN' || normalized === 'MANAGER' || normalized === 'BARTENDER' || normalized === 'CHEF') {
    return normalized
  }

  throw new ValidationError('Role invalida. Use ADMIN, MANAGER, BARTENDER ou CHEF')
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { email, password, name, role, establishmentIds } = req.body

    let scopedRole = normalizeRole(role)
    let scopedEstablishmentIds = establishmentIds as string[] | undefined

    if (req.user?.role === 'MANAGER') {
      if (role === 'ADMIN' || role === 'MANAGER') {
        throw new AppError(403, 'Manager nao pode atribuir role ADMIN ou MANAGER')
      }

      if (scopedEstablishmentIds) {
        const allowed = new Set(req.user.establishmentIds)
        scopedEstablishmentIds = scopedEstablishmentIds.filter((item) => allowed.has(item))

        if (!scopedEstablishmentIds.length) {
          throw new AppError(403, 'Vinculo de estabelecimento fora do escopo do manager')
        }
      }
    }

    if (!id) {
      throw new ValidationError('Não foi possível identificar o usuário para atualização!')
    }

    if (!email && !password && !name && !role && !establishmentIds) {
      throw new ValidationError('Pelo menos um campo deve ser fornecido para a atualização!')
    }

    const updatedUser = await service.execute(id as string, {
      email: email as string,
      password: password as string,
      name: name as string,
      role: scopedRole,
      establishmentIds: scopedEstablishmentIds
    })

    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
}
