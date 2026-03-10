import { prisma } from '../../../config/database'

interface CreateEstablishmentInput {
  name: string
  createdBy: string
}

export class CreateEstablishmentService {
  async execute(input: CreateEstablishmentInput) {
    const establishment = await prisma.establishment.create({
      data: {
        name: input.name,
        createdAt: new Date(),
        createdBy: input.createdBy
      }
    })

    return establishment
  }
}
