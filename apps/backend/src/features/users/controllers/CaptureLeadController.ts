import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../../config/database'
import { ValidationError } from '../../../utils/errors'

export const captureLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, establishmentName } = req.body as Record<string, unknown>

    if (!name || typeof name !== 'string') throw new ValidationError('Nome é obrigatório')
    if (!email || typeof email !== 'string') throw new ValidationError('Email é obrigatório')
    if (!establishmentName || typeof establishmentName !== 'string') {
      throw new ValidationError('Nome do estabelecimento é obrigatório')
    }

    // Upsert: se o lead já existe pelo email, atualiza; senão cria
    const existing = await prisma.lead.findFirst({ where: { email } })

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name,
          phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
          establishmentName,
        },
      })
    } else {
      await prisma.lead.create({
        data: {
          name,
          email,
          phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
          establishmentName,
        },
      })
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    next(error)
  }
}
