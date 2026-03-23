import { prisma } from '../../../config/database'
import { AppError, NotFoundError } from '../../../utils/errors'
import type { UserRole } from '../../../middleware/auth'

interface DeleteUserContext {
  requesterRole?: UserRole
}

export class DeleteUserService {
  async execute(userId: string, context?: DeleteUserContext) {
    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw new NotFoundError('¡Usuario no encontrado!')
    }

    if (existingUser.role === 'ADMIN' && context?.requesterRole !== 'ADMIN') {
      throw new AppError(403, '¡No tienes permiso para eliminar usuarios ADMIN!')
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

    return { message: '¡Usuario eliminado con éxito!' }
  }
}
