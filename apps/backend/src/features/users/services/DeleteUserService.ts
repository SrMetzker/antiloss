import { prisma } from '../../../config/database'
import { NotFoundError } from '../../../utils/errors'

export class DeleteUserService {
  async execute(userId: string) {
    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw new NotFoundError('Usuário não encontrado!')
    }

    // Deleta o usuário
    await prisma.user.delete({
      where: { id: userId }
    })

    return { message: 'Usuário Deletado com sucesso!' }
  }
}
