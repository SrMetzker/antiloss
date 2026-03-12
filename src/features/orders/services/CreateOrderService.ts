import { prisma } from '../../../config/database'
import { NotFoundError, ValidationError } from '../../../utils/errors'

interface OrderItemInput {
  productId: string
  quantity: number
}

interface CreateOrderInput {
  tableId: string
  items: OrderItemInput[]
}

export class CreateOrderService {
  async execute(input: CreateOrderInput) {
    if (!input.tableId) {
      throw new ValidationError(`Não foi possível identificar o 'tableId' para a qual o pedido será criado!`)
    }

    const table = await prisma.table.findUnique({ where: { id: input.tableId } })
    if (!table) {
      throw new NotFoundError('Não foi possível encontrar a mesa para a qual o pedido será criado!')
    }

    const productIds = input.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        recipe: {
          include: {
            items: { include: { ingredient: true } }
          }
        }
      }
    })

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products not found')
    }

    // Valida itens e calcula total
    let total = 0

    for (const orderItem of input.items) {
      const product = products.find((p) => p.id === orderItem.productId)
      if (!product) throw new NotFoundError(`Product ${orderItem.productId} not found`)
      if (!product.recipe) throw new ValidationError(`Product ${product.name} has no recipe configured`)
      if (orderItem.quantity <= 0) throw new ValidationError('Item quantity must be greater than zero')

      total += product.price * orderItem.quantity
    }

    // Cria pedido (baixa de estoque acontece no fechamento)
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          tableId: input.tableId,
          status: 'OPEN',
          total,
          createdAt: new Date()
        }
      })

      const orderItems = input.items.map((item) => ({
        orderId: created.id,
        productId: item.productId,
        quantity: item.quantity,
        price: products.find((p) => p.id === item.productId)?.price || 0
      }))

      await tx.orderItem.createMany({ data: orderItems })

      return created
    })

    return order
  }
}
