import { prisma } from '../../../config/database'
import bcrypt from 'bcryptjs'

interface CreateUserInput {
  email: string
  password: string
  name: string
  createdBy: string
}

export class CreateUserService {
  async execute(input: CreateUserInput) {
    // Faz hash da senha com salt rounds de 10
    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        createdAt: new Date(),
        createdBy: input.createdBy
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

    return user
  }
}
