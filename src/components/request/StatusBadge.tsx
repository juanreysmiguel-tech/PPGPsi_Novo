import { Badge } from '@/components/ui/Badge'

interface StatusBadgeProps {
  status: string
  className?: string
}

/**
 * Visual badge for request status with colors from STATUS_COLORS config
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Map status to badge variant
  let variant: 'default' | 'success' | 'danger' | 'warning' | 'info' = 'default'
  if (status.includes('Aprovado') || status.includes('Concluido')) {
    variant = 'success'
  } else if (status.includes('Reprovado') || status.includes('Indeferido')) {
    variant = 'danger'
  } else if (status.includes('Aguardando') || status.includes('Pendente')) {
    variant = 'warning'
  } else if (status.includes('Analise') || status.includes('Pauta')) {
    variant = 'info'
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}
