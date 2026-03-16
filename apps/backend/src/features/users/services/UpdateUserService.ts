import { prisma } from '../../../config/database'
import { InternalServerError, NotFoundError } from '../../../utils/errors'
import bcrypt from 'bcryptjs'

interface UpdateUserInput {
  email?: string
  password?: string
  name?: string
  role?: 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF' | undefined
  establishmentIds?: string[] | undefined
}

export class UpdateUserService {
  async execute(userId: string, input: UpdateUserInput) {
    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw new NotFoundError('Não foi possível identificar o usuário para atualização!')
    }

    // Se a senha for fornecida, faz hash dela
    let hashedPassword: string
    if (input.password) {
      hashedPassword = await bcrypt.hash(input.password, 10)
    }

    // Atualiza apenas os campos fornecidos
    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(input.email && { email: input.email }),
          ...(hashedPassword && { password: hashedPassword }),
          ...(input.name && { name: input.name }),
          ...(input.role && { role: input.role })
        }
      })

      if (input.establishmentIds) {
        await tx.establishmentUser.deleteMany({ where: { userId } })
        if (input.establishmentIds.length > 0) {
          await tx.establishmentUser.createMany({
            data: input.establishmentIds.map((establishmentId) => ({
              userId,
              establishmentId
            })),
            skipDuplicates: true
          })
        }
      }

      return tx.user.findUnique({
        where: { id: userId },
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

    if (!updatedUser) {
      throw new InternalServerError('Falha ao atualizar usuario')
    }

    return updatedUser
  }
}
