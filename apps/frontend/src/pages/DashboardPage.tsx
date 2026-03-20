import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, AlertTriangle, TrendingUp, UtensilsCrossed,
  Plus, Warehouse, BookOpen, ArrowRight
} from 'lucide-react'
import { useProducts, useIngredients, useReports } from '@/hooks'
import { StatCard, Card, EmptyState, PageLoader } from '@/components/ui/Card'
import { formatCurrency, formatShortDate } from '@/utils/format'
import { useAuthStore } from '@/store/authStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: products, isLoading: loadingProducts } = useProducts()
  const { data: ingredients } = useIngredients()
  const { data: reports, isLoading: loadingReports } = useReports()

  const lowStockProducts = products?.filter(
    (p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold
  ) ?? []

  const lowStockIngredients = ingredients?.filter(
    (i) => i.currentStock <= i.minStock
  ) ?? []

  const todaySales = reports?.dailySales[reports.dailySales.length - 1]
  const yesterdaySales = reports?.dailySales[reports.dailySales.length - 2]
  const salesTrend = todaySales && yesterdaySales && yesterdaySales.total > 0
    ? ((todaySales.total - yesterdaySales.total) / yesterdaySales.total * 100).toFixed(1)
    : null

  const chartData = reports?.dailySales.slice(-7).map((d) => ({
    date: formatShortDate(d.date),
    sales: d.total,
    orders: d.orderCount,
  })) ?? []

  if (loadingProducts || loadingReports) return <PageLoader />

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">
          Good {getGreeting()}, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here's what's happening today</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Today's Sales"
          value={todaySales ? formatCurrency(todaySales.total) : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={salesTrend ? { value: `${Math.abs(+salesTrend)}%`, positive: +salesTrend > 0 } : undefined}
          accent
        />
        <StatCard
          label="Total Products"
          value={products?.length ?? 0}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Low Stock Products"
          value={lowStockProducts.length}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="Orders Today"
          value={todaySales?.orderCount ?? 0}
          icon={<UtensilsCrossed className="w-5 h-5" />}
        />
      </div>

      {/* Sales chart */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white">Sales — Last 7 days</h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs text-brand font-semibold flex items-center gap-1 hover:underline"
          >
            Full report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.40} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3149" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#7B99C4', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7B99C4', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} width={50} />
              <Tooltip
                contentStyle={{ background: '#0C1829', border: '1px solid #1E3149', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#E9F0FF', fontWeight: 600 }}
                formatter={(v: number) => [formatCurrency(v), 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Low stock alerts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Stock Alerts
            </h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {lowStockIngredients.length === 0 ? (
            <EmptyState title="All stock looks good!" description="No low stock alerts" />
          ) : (
            <div className="flex flex-col gap-2">
              {lowStockIngredients.slice(0, 5).map((i) => (
                <div key={i.id} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{i.name}</p>
                    <p className="text-xs text-gray-500">Min: {i.minStock} {i.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{i.currentStock} {i.unit}</p>
                    <span className="badge-red text-[10px]">Low</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top products */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Top Sellers</h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
            >
              All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {!reports?.topProducts.length ? (
            <EmptyState title="No sales data yet" />
          ) : (
            <div className="flex flex-col gap-2">
              {reports.topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-bg-border last:border-0">
                  <span className="w-6 h-6 rounded-lg bg-bg-elevated flex items-center justify-center text-xs font-bold text-gray-400">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.productName}</p>
                    <p className="text-xs text-gray-500">{p.quantity} sold</p>
                  </div>
                  <p className="text-sm font-bold text-brand">{formatCurrency(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5">
        <h2 className="font-display font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'New Order', icon: <UtensilsCrossed className="w-5 h-5" />, path: '/tables' },
            { label: 'Add Product', icon: <Package className="w-5 h-5" />, path: '/products' },
            { label: 'Stock Entry', icon: <Warehouse className="w-5 h-5" />, path: '/inventory' },
            { label: 'New Recipe', icon: <BookOpen className="w-5 h-5" />, path: '/recipes' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="card-elevated p-4 flex flex-col items-center gap-2.5 text-center hover:border-brand/30 active:scale-95 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center text-brand">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-300">{action.label}</span>
              <Plus className="w-3 h-3 text-brand" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
