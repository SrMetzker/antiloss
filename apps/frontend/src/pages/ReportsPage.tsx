import React, { useState } from 'react'
import { TrendingUp, ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { useReports } from '@/hooks'
import { StatCard, Card, PageLoader, EmptyState } from '@/components/ui/Card'
import { formatCurrency, formatShortDate, formatDate } from '@/utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6']

export const ReportsPage: React.FC = () => {
  const { data: reports, isLoading } = useReports()
  const [period, setPeriod] = useState<7 | 14>(7)

  if (isLoading) return <PageLoader />
  if (!reports) return <EmptyState title="No report data" />

  const dailyData = reports.dailySales
    .slice(-period)
    .map((d) => ({
      date: formatShortDate(d.date),
      sales: d.total,
      orders: d.orderCount,
    }))

  const pieData = reports.topProducts.slice(0, 5).map((p, idx) => ({
    name: p.productName,
    value: p.quantity,
    color: COLORS[idx],
  }))

  const avgSales = reports.dailySales.length
    ? reports.dailySales.reduce((s, d) => s + d.total, 0) / reports.dailySales.length
    : 0

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Reports</h1>
        <p className="text-gray-400 text-sm mt-0.5">Business performance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(reports.totalRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Total Orders"
          value={reports.totalOrders}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Daily Sales"
          value={formatCurrency(avgSales)}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Stock Losses"
          value={reports.stockLosses.length}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Period toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400 font-medium">Period:</span>
        {([7, 14] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              period === p ? 'bg-brand text-black' : 'bg-bg-elevated text-gray-400 hover:text-white'
            }`}
          >
            {p} days
          </button>
        ))}
      </div>

      {/* Sales chart */}
      <Card className="p-5 mb-4">
        <h2 className="font-display font-bold text-white mb-4">Daily Sales</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} width={52} />
              <Tooltip
                contentStyle={{ background: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: number) => [formatCurrency(v), 'Sales']}
              />
              <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Orders trend */}
      <Card className="p-5 mb-4">
        <h2 className="font-display font-bold text-white mb-4">Order Volume</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: number) => [v, 'Orders']}
              />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Top products */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-white mb-4">Top Products</h2>
          <div className="flex flex-col gap-2">
            {reports.topProducts.map((p, idx) => {
              const maxQty = reports.topProducts[0].quantity
              const pct = Math.round((p.quantity / maxQty) * 100)
              return (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">{p.productName}</p>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{p.quantity} units</span>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[idx] }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand w-16 text-right flex-shrink-0">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Pie chart */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-white mb-4">Sales Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Stock losses */}
      <Card className="p-5">
        <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Stock Losses
        </h2>
        {reports.stockLosses.length === 0 ? (
          <EmptyState title="No losses recorded" description="No stock loss movements found" />
        ) : (
          <div className="flex flex-col gap-2">
            {reports.stockLosses.map((loss, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{loss.ingredientName}</p>
                  <p className="text-xs text-gray-500">{formatDate(loss.date)}</p>
                </div>
                <span className="badge-red">{loss.quantity} {loss.unit}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
