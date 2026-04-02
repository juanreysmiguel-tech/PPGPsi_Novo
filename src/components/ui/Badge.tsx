import { cn } from '@/lib/cn'
import { getStatusColor } from '@/lib/statusUtils'

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  const { bg, text } = getStatusColor(status)
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        bg,
        text,
        className,
      )}
    >
      {status}
    </span>
  )
}

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
}

interface SimpleBadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: SimpleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
