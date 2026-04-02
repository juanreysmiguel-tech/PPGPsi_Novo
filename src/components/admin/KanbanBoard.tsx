import { useState, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { RequestCard } from '@/components/request/RequestCard'
import { Badge } from '@/components/ui/Badge'
import type { Request } from '@/types'

interface KanbanColumn {
  id: string
  title: string
  color: string
  statuses: string[]
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pendente',
    title: 'Pendentes',
    color: 'border-t-amber-400',
    statuses: [
      'Aguardando Avaliacao do Orientador',
      'Aguardando Elucidacao (Retornado para Ajustes)',
      'Dados Atualizados',
    ],
  },
  {
    id: 'analise',
    title: 'Em Analise',
    color: 'border-t-blue-400',
    statuses: [
      'Em Analise pela Comissao de Gestao (CG)',
      'Aprovado pela CG (Aguardando Tramite da Secretaria)',
    ],
  },
  {
    id: 'pauta',
    title: 'Em Pauta / CPG',
    color: 'border-t-purple-400',
    statuses: [
      'Em Pauta (Reuniao do Colegiado)',
      'Aprovado na CPG',
      'Aprovado com Ressalvas',
      'Aprovado ad referendum pela Coordenacao',
    ],
  },
  {
    id: 'financeiro',
    title: 'Prestacao / Deposito',
    color: 'border-t-emerald-400',
    statuses: [
      'Prestacao de Contas Solicitada',
      'Prestacao de Contas em Analise',
      'Aguardando Deposito Financeiro',
    ],
  },
  {
    id: 'concluido',
    title: 'Concluidos',
    color: 'border-t-gray-400',
    statuses: [
      'Concluido / Arquivado',
      'Indeferido / Recusado',
      'Reprovado na CPG',
    ],
  },
]

interface KanbanBoardProps {
  requests: Request[]
  onRequestClick?: (request: Request) => void
  isLoading?: boolean
}

export function KanbanBoard({ requests, onRequestClick, isLoading }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const columns = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      requests: requests.filter((r) => {
        const s = r.status
        return col.statuses.some((cs) => s.includes(cs) || cs.includes(s))
      }),
    }))
  }, [requests])

  // Also collect any that don't match any column
  const unmapped = useMemo(() => {
    const allMapped = new Set(columns.flatMap((c) => c.requests.map((r) => r.id)))
    return requests.filter((r) => !allMapped.has(r.id))
  }, [requests, columns])

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[280px] flex-1 rounded-xl bg-gray-100 p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-24 bg-gray-200 rounded mb-3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn(
            'min-w-[280px] flex-1 rounded-xl bg-gray-50 border border-gray-200 border-t-4',
            col.color,
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => setDraggedId(null)}
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">{col.title}</h3>
            <Badge variant="default">{col.requests.length}</Badge>
          </div>

          {/* Cards */}
          <div className="space-y-2 px-3 pb-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {col.requests.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Nenhuma solicitacao</p>
            ) : (
              col.requests.map((req) => (
                <div
                  key={req.id}
                  draggable
                  onDragStart={() => setDraggedId(req.id)}
                  className={cn(draggedId === req.id && 'opacity-50')}
                >
                  <RequestCard request={req} onClick={() => onRequestClick?.(req)} />
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Unmapped requests (should not normally exist) */}
      {unmapped.length > 0 && (
        <div className="min-w-[280px] flex-1 rounded-xl bg-red-50 border border-red-200 border-t-4 border-t-red-400">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-semibold text-red-700">Outros</h3>
            <Badge variant="danger">{unmapped.length}</Badge>
          </div>
          <div className="space-y-2 px-3 pb-3">
            {unmapped.map((req) => (
              <RequestCard key={req.id} request={req} onClick={() => onRequestClick?.(req)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
