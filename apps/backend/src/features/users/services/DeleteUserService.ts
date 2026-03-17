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

    // Remove vínculos do usuário com estabelecimentos para respeitar FK RESTRICT.
    await prisma.$transaction(async (tx) => {
      await tx.establishmentUser.deleteMany({
        where: { userId }
      })

      await tx.user.delete({
        where: { id: userId }
      })
    })

    return { message: 'Usuário Deletado com sucesso!' }
  }
}
