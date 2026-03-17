import { prisma } from '../../../config/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ValidationError, NotFoundError } from '../../../utils/errors'

interface LoginInput {
  email: string
  password: string
}

export class LoginService {
  async execute(input: LoginInput) {
    if (!input.email || !input.password) {
      throw new ValidationError('Email e senha são obrigatórios!')
    }

    // Busca usuário por email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        establishments: {
          include: {
            establishment: {
              include: {
                subscription: {
                  include: {
                    plan: {
                      select: {
                        code: true,
                        name: true,
                        priceCents: true,
                        currency: true,
                        billingCycle: true,
                        trialDays: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundError('Invalid credentials')
    }

    // Verifica senha
    const isPasswordValid = await bcrypt.compare(input.password, user.password)
    if (!isPasswordValid) {
      throw new ValidationError('Invalid credentials')
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        establishmentIds: user.establishments.map((item) => item.establishmentId)
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    )

    // Remove senha da resposta
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
      expiresIn: '24h'
    }
  }
}
