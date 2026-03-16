import React from 'react'
import { Loader2, Inbox } from 'lucide-react'

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  elevated?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, elevated }) => (
  <div
    className={`
      ${elevated ? 'card-elevated' : 'card'}
      ${onClick ? 'cursor-pointer hover:border-brand/30 active:scale-[0.98] transition-all duration-150' : ''}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const badgeMap: Record<BadgeVariant, string> = {
  green: 'badge-green',
  red: 'badge-red',
  amber: 'badge-amber',
  blue: 'badge-blue',
  gray: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/20',
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className = '' }) => (
  <span className={`${badgeMap[variant]} ${className}`}>{children}</span>
)

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', centered }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = <Loader2 className={`${sizeMap[size]} text-brand animate-spin`} />
  if (centered) {
    return (
      <div className="flex items-center justify-center py-16">
        {spinner}
      </div>
    )
  }
  return spinner
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="w-10 h-10 text-brand animate-spin" />
    <p className="text-gray-400 text-sm font-medium">Loading...</p>
  </div>
)

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-bg-border flex items-center justify-center mb-4 text-gray-500">
      {icon ?? <Inbox className="w-7 h-7" />}
    </div>
    <h3 className="font-display font-bold text-white mb-1">{title}</h3>
    {description && <p className="text-gray-400 text-sm max-w-xs mb-4">{description}</p>}
    {action}
  </div>
)

// ─── ErrorState ───────────────────────────────────────────────────────────────
interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
      <span className="text-red-400 text-xl">⚠</span>
    </div>
    <p className="text-gray-400 text-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-sm !py-2 !px-4">
        Try again
      </button>
    )}
  </div>
)

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-bg-border" />
    {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
    <div className="flex-1 h-px bg-bg-border" />
  </div>
)

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  accent?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, accent }) => (
  <div className={`stat-card ${accent ? 'border-brand/30 bg-brand-muted' : ''}`}>
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${accent ? 'bg-brand/20 text-brand' : 'bg-bg-elevated text-gray-400'}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    <div>
      <p className="label mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold ${accent ? 'text-brand' : 'text-white'}`}>
        {value}
      </p>
    </div>
  </div>
)
