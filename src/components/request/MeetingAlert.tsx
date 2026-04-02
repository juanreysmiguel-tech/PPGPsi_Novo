import { useOpenMeetings } from '@/hooks/useMeetings'
import { formatDate, daysUntil } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { Calendar } from 'lucide-react'
import type { Meeting } from '@/types'

interface MeetingAlertProps {
  onNewRequest?: () => void
}

/**
 * Next meeting alert bar. Replicated from renderStudent meeting-alert section.
 * Shows the next open meeting date, deadline countdown, and a CTA button.
 */
export function MeetingAlert({ onNewRequest }: MeetingAlertProps) {
  const { data: meetings, isLoading } = useOpenMeetings()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    )
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-gray-300" />
          <span className="text-gray-500 text-sm">Nenhuma reuniao aberta no momento</span>
        </div>
      </div>
    )
  }

  const next = meetings[0] as Meeting
  const deadline = next.prazoFechamento
  const daysLeft = deadline ? daysUntil(deadline) : null

  const urgency = daysLeft === null ? 'normal' : daysLeft <= 0 ? 'expired' : daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'normal'

  const countdownBadge = (() => {
    if (daysLeft === null) return null
    if (daysLeft <= 0) return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Prazo encerrado</span>
    if (daysLeft <= 3) return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{daysLeft} dia(s) para fazer pedido!</span>
    if (daysLeft <= 7) return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{daysLeft} dias restantes</span>
    return <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{daysLeft} dias para fazer pedido</span>
  })()

  return (
    <div className={cn(
      'rounded-xl border bg-white p-4 shadow-sm',
      urgency === 'critical' && 'border-red-200 bg-red-50/50',
      urgency === 'expired' && 'border-red-300 bg-red-50',
      urgency === 'warning' && 'border-amber-200 bg-amber-50/50',
    )}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary-400" />
          <div>
            <p className="font-semibold text-gray-800">{next.nome}</p>
            <p className="text-sm text-gray-500">
              Data: {formatDate(next.dataReuniao)}
              {deadline && <> | Prazo: {formatDate(deadline)}</>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {countdownBadge}
          {onNewRequest && urgency !== 'expired' && (
            <button
              onClick={onNewRequest}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              + Nova Solicitacao
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
