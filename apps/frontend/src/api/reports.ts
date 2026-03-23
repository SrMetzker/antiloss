import { ordersApi } from '@/api/orders'
import { inventoryApi } from '@/api/inventory'
import type { DailySales, ReportSummary, TopProduct } from '@/types'

const toDateKey = (value: string) => new Date(value).toISOString().slice(0, 10)

export const reportsApi = {
  getSummary: async (): Promise<ReportSummary> => {
    const orders = await ordersApi.getAllOrders()
    const movements = await inventoryApi.getMovements()
    const closedOrders = orders.filter((order) => order.status === 'closed')

    const dailyMap = new Map<string, { total: number; orderCount: number }>()
    const productMap = new Map<string, TopProduct>()

    for (const order of closedOrders) {
      const day = toDateKey(order.createdAt)
      const currentDay = dailyMap.get(day) ?? { total: 0, orderCount: 0 }
      dailyMap.set(day, {
        total: currentDay.total + order.total,
        orderCount: currentDay.orderCount + 1,
      })

      for (const item of order.items) {
        const current = productMap.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        }

        productMap.set(item.productId, {
          ...current,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.subtotal,
        })
      }
    }

    const dailySales: DailySales[] = Array.from(dailyMap.entries())
      .map(([date, values]) => ({
        date,
        total: values.total,
        orderCount: values.orderCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const topProducts = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity)
    const stockLosses = movements
      .filter((movement) => movement.type === 'LOSS')
      .map((movement) => ({
        ingredientId: movement.ingredientId,
        ingredientName: movement.ingredientName,
        quantity: movement.quantity,
        unit: movement.unit,
        date: toDateKey(movement.createdAt),
      }))

    return {
      dailySales,
      topProducts,
      stockLosses,
      totalRevenue: dailySales.reduce((sum, item) => sum + item.total, 0),
      totalOrders: dailySales.reduce((sum, item) => sum + item.orderCount, 0),
    }
  },
}
