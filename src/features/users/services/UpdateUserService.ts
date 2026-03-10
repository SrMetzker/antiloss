import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'
import bcrypt from 'bcryptjs'

interface UpdateUserInput {
  email?: string
  password?: string
  name?: string
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
    let hashedPassword
    if (input.password) {
      hashedPassword = await bcrypt.hash(input.password, 10)
    }

    // Atualiza apenas os campos fornecidos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.email && { email: input.email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(input.name && { name: input.name })
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        createdBy: true,
        establishments: true
      }
    })

    return updatedUser
  }
}
