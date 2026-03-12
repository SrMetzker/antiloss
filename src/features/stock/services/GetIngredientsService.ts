import { prisma } from '../../../config/database'

interface GetIngredientsInput {
  establishmentId?: string
}

export class GetIngredientsService {
  async execute(input?: GetIngredientsInput) {
    const where: any = {}
    if (input?.establishmentId) where.establishmentId = input.establishmentId

    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return ingredients
  }
}
