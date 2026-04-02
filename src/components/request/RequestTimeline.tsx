import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/utils'
import type { HistoryEntry } from '@/types'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface RequestTimelineProps {
  history: HistoryEntry[]
}

/**
 * Visual timeline for request approval history (historicoAprovacao).
 * Replicated from the original system's approval trail display.
 */
export function RequestTimeline({ history }: RequestTimelineProps) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">Nenhum historico disponivel.</p>
  }

  // Show newest first
  const sorted = [...history].reverse()

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200" />

      {sorted.map((entry, idx) => {
        const actionLower = entry.action.toLowerCase()
        const isApproval = actionLower.includes('aprovad')
        const isRejection = actionLower.includes('indeferid') || actionLower.includes('reprovad')
        const isPending = actionLower.includes('pendente') || actionLower.includes('aguard')

        const Icon = isRejection ? XCircle : isApproval ? CheckCircle : isPending ? Clock : MessageSquare
        const iconColor = isRejection ? 'text-red-500' : isApproval ? 'text-emerald-500' : isPending ? 'text-amber-500' : 'text-primary-500'
        const bgColor = isRejection ? 'bg-red-50' : isApproval ? 'bg-emerald-50' : isPending ? 'bg-amber-50' : 'bg-primary-50'

        return (
          <div key={idx} className={cn('relative mb-4 last:mb-0', idx === 0 && 'font-medium')}>
            {/* Dot */}
            <div className={cn('absolute -left-3.5 rounded-full p-1', bgColor)}>
              <Icon className={cn('h-3.5 w-3.5', iconColor)} />
            </div>

            {/* Content */}
            <div className="ml-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-800">{entry.action}</span>
                <span className="text-xs text-gray-400">{formatDateTime(entry.date)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                por {entry.user}
              </p>
              {entry.justification && (
                <p className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 border border-gray-100">
                  {entry.justification}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
