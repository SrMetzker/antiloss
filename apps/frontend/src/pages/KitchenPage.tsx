import React from 'react'
import { Clock3, Flame, UtensilsCrossed } from 'lucide-react'
import { useKitchenOrders } from '@/hooks'
import { Badge, Card, EmptyState, PageLoader, StatCard } from '@/components/ui/Card'
import { formatRelativeTime, formatTime } from '@/utils/format'

export const KitchenPage: React.FC = () => {
  const { data: orders, isLoading } = useKitchenOrders()

  if (isLoading) return <PageLoader />

  const kitchenOrders = orders ?? []
  const totalItems = kitchenOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )
  const longestWait = kitchenOrders.length
    ? kitchenOrders
        .map((order) => Date.now() - new Date(order.createdAt).getTime())
        .sort((a, b) => b - a)[0]
    : 0
  const longestWaitMinutes = Math.max(0, Math.floor(longestWait / 60000))

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Kitchen Queue</h1>
          <p className="text-gray-400 text-sm mt-0.5">Open orders being prepared in the kitchen</p>
        </div>
        <Badge variant="amber" className="!text-xs">
          Auto-updates every 10s
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Open Orders"
          value={kitchenOrders.length}
          icon={<Flame className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Items to Produce"
          value={totalItems}
          icon={<UtensilsCrossed className="w-5 h-5" />}
        />
        <StatCard
          label="Longest Wait"
          value={`${longestWaitMinutes}m`}
          icon={<Clock3 className="w-5 h-5" />}
        />
      </div>

      {kitchenOrders.length === 0 ? (
        <EmptyState
          icon={<Flame className="w-7 h-7" />}
          title="No orders in queue"
          description="When a new order is opened, it will appear here for the kitchen."
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {kitchenOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-display font-bold text-white text-lg">Table {order.tableNumber}</h2>
                  <p className="text-xs text-gray-500">Started {formatRelativeTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <Badge variant="amber">OPEN</Badge>
                  <p className="text-[11px] text-gray-500 mt-1">{formatTime(order.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {order.items.map((item) => (
                  <div key={item.id} className="card-elevated p-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-white font-medium truncate">{item.productName}</p>
                    <span className="badge-blue">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}