/**
 * StatCard Component
 * Displays a metric with trend indicator and sparkline
 * Used in dashboards for KPIs
 */

import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
}

const colorClasses = {
  primary: 'bg-blue-50 border-blue-200 text-blue-700',
  secondary: 'bg-violet-50 border-violet-200 text-violet-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
}

const trendColors = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
}

const trendSymbols = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  color = 'primary',
  onClick,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border p-6 transition-all hover:shadow-md',
        colorClasses[color],
        onClick && 'cursor-pointer hover:border-opacity-80'
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      aria-label={label}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && <div className="text-2xl">{icon}</div>}
        {trend && (
          <div className={clsx('text-sm font-semibold', trendColors[trend.direction])}>
            {trendSymbols[trend.direction]} {trend.percentage}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}
