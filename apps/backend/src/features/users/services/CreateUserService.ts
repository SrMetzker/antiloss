import { prisma } from '../../../config/database'
import bcrypt from 'bcryptjs'
import { InternalServerError } from '../../../utils/errors'
import { enforceUserLimitForEstablishments } from '../../../utils/planLimits'

interface CreateUserInput {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF' | undefined
  establishmentIds?: string[] | undefined
  createdBy: string
}

export class CreateUserService {
  async execute(input: CreateUserInput) {
    if (input.establishmentIds?.length) {
      await enforceUserLimitForEstablishments(input.establishmentIds)
    }

    // Faz hash da senha com salt rounds de 10
    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role ?? 'BARTENDER',
          createdAt: new Date(),
          createdBy: input.createdBy
        }
      })

      if (input.establishmentIds?.length) {
        await tx.establishmentUser.createMany({
          data: input.establishmentIds.map((establishmentId) => ({
            userId: created.id,
            establishmentId
          })),
          skipDuplicates: true
        })
      }

      return tx.user.findUnique({
        where: { id: created.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          createdBy: true,
          establishments: {
            include: {
              establishment: true
            }
          }
        }
      })
    })

    if (!user) {
      throw new InternalServerError('Falha ao criar usuario')
    }

    return user
  }
}
