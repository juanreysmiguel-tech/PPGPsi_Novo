import { useState, useMemo, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/cn'
import { RequestCard } from '@/components/request/RequestCard'
import { Badge } from '@/components/ui/Badge'
import { useUpdateRequestStatus } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { FINANCIAL_STATUS } from '@/config/constants'
import type { Request } from '@/types'

/* ------------------------------------------------------------------ */
/*  Column definitions – each column maps to one or more statuses.    */
/*  The first status in the array is the "default" target when a card */
/*  is dropped into that column.                                      */
/* ------------------------------------------------------------------ */

interface KanbanColumn {
  id: string
  title: string
  color: string
  statuses: string[]
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pendente',
    title: 'Pendente',
    color: 'border-t-amber-400',
    statuses: [
      FINANCIAL_STATUS.PENDING_ADVISOR,               // Aguardando Avaliacao do Orientador
    ],
  },
  {
    id: 'analise',
    title: 'Em Analise',
    color: 'border-t-blue-400',
    statuses: [
      FINANCIAL_STATUS.PENDING_CG,                    // Em Analise pela Comissao de Gestao (CG)
      FINANCIAL_STATUS.PENDING_INFO,                   // Aguardando Elucidacao (Retornado para Ajustes)
    ],
  },
  {
    id: 'aprovado-cg',
    title: 'Aprovado CG',
    color: 'border-t-emerald-400',
    statuses: [
      FINANCIAL_STATUS.APPROVED_CG,                   // Aprovado pela CG (Aguardando Tramite da Secretaria)
    ],
  },
  {
    id: 'pauta',
    title: 'Em Pauta',
    color: 'border-t-purple-400',
    statuses: [
      FINANCIAL_STATUS.IN_MEETING,                    // Em Pauta (Reuniao do Colegiado)
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    color: 'border-t-cyan-400',
    statuses: [
      FINANCIAL_STATUS.ACCOUNTABILITY_REQUESTED,      // Prestacao de Contas Solicitada
      FINANCIAL_STATUS.WAITING_CHECK,                 // Prestacao de Contas em Analise
      FINANCIAL_STATUS.WAITING_DEPOSIT,               // Aguardando Deposito Financeiro
    ],
  },
  {
    id: 'concluido',
    title: 'Concluido',
    color: 'border-t-gray-400',
    statuses: [
      FINANCIAL_STATUS.COMPLETED,                     // Concluido / Arquivado
      FINANCIAL_STATUS.REJECTED,                      // Indeferido / Recusado
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Helper: find which column a status string belongs to              */
/* ------------------------------------------------------------------ */

function findColumnForStatus(status: string): KanbanColumn | undefined {
  return KANBAN_COLUMNS.find((col) =>
    col.statuses.some((cs) => status === cs || status.includes(cs) || cs.includes(status)),
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface KanbanBoardProps {
  requests: Request[]
  onRequestClick?: (request: Request) => void
  isLoading?: boolean
}

export function KanbanBoard({ requests, onRequestClick, isLoading }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  // Optimistic local overrides: requestId -> newStatus
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({})

  const updateStatus = useUpdateRequestStatus()
  const queryClient = useQueryClient()
  const { userProfile } = useAuthStore()

  // We store the dragged request id in a ref so the onDrop handler always
  // has the latest value even if the state hasn't re-rendered yet.
  const draggedIdRef = useRef<string | null>(null)

  /* ---------- Build effective requests with optimistic overrides ---------- */

  const effectiveRequests = useMemo(() => {
    return requests.map((r) => {
      const override = optimisticStatuses[r.id]
      if (override) {
        return { ...r, status: override }
      }
      return r
    })
  }, [requests, optimisticStatuses])

  /* ---------- Distribute requests into columns ---------- */

  const columns = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      requests: effectiveRequests.filter((r) =>
        col.statuses.some((cs) => r.status === cs || r.status.includes(cs) || cs.includes(r.status)),
      ),
    }))
  }, [effectiveRequests])

  // Collect any that don't match any column
  const unmapped = useMemo(() => {
    const allMapped = new Set(columns.flatMap((c) => c.requests.map((r) => r.id)))
    return effectiveRequests.filter((r) => !allMapped.has(r.id))
  }, [effectiveRequests, columns])

  /* ---------- Drag handlers ---------- */

  const handleDragStart = useCallback((e: React.DragEvent, requestId: string) => {
    setDraggedId(requestId)
    draggedIdRef.current = requestId
    e.dataTransfer.effectAllowed = 'move'
    // Store the id in dataTransfer as well for safety
    e.dataTransfer.setData('text/plain', requestId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColId(columnId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent, columnId: string) => {
    // Only clear if we're actually leaving this column (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDragOverColId((prev) => (prev === columnId ? null : prev))
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetColumn: KanbanColumn) => {
      e.preventDefault()
      setDragOverColId(null)

      const reqId = draggedIdRef.current ?? e.dataTransfer.getData('text/plain')
      setDraggedId(null)
      draggedIdRef.current = null

      if (!reqId) return

      // Find the request
      const request = requests.find((r) => r.id === reqId)
      if (!request) return

      // Determine what column the request currently lives in
      const currentColumn = findColumnForStatus(
        optimisticStatuses[reqId] ?? request.status,
      )

      // If dropped in the same column, do nothing
      if (currentColumn?.id === targetColumn.id) return

      // The new status is the first status in the target column
      const newStatus = targetColumn.statuses[0]
      const actor = userProfile?.email ?? 'unknown'

      // 1) Optimistic UI update
      setOptimisticStatuses((prev) => ({ ...prev, [reqId]: newStatus }))

      // 2) Persist to Firestore
      try {
        await updateStatus.mutateAsync({
          id: reqId,
          status: newStatus,
          actor,
          comment: `Status alterado via Kanban: ${request.status} -> ${newStatus}`,
        })

        // 3) Invalidate queries so fresh data comes in
        queryClient.invalidateQueries({ queryKey: ['requests'] })

        // 4) Toast confirmation
        toast.success(
          `Solicitacao movida para "${targetColumn.title}"`,
          { description: `${request.nomeAluno ?? 'Solicitacao'} — ${newStatus}` },
        )

        // Clear the optimistic override now that the server state is current
        setOptimisticStatuses((prev) => {
          const next = { ...prev }
          delete next[reqId]
          return next
        })
      } catch (err) {
        console.error('Failed to update request status via Kanban:', err)

        // Roll back optimistic update
        setOptimisticStatuses((prev) => {
          const next = { ...prev }
          delete next[reqId]
          return next
        })

        toast.error('Erro ao atualizar status da solicitacao.', {
          description: 'A alteracao foi revertida. Tente novamente.',
        })
      }
    },
    [requests, optimisticStatuses, userProfile, updateStatus, queryClient],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragOverColId(null)
    draggedIdRef.current = null
  }, [])

  /* ---------- Loading skeleton ---------- */

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div
            key={col.id}
            className="min-w-[280px] flex-1 rounded-xl bg-gray-100 p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-24 bg-gray-200 rounded mb-3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  /* ---------- Render ---------- */

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const isOver = dragOverColId === col.id
        return (
          <div
            key={col.id}
            className={cn(
              'min-w-[280px] flex-1 rounded-xl border border-gray-200 border-t-4 transition-colors duration-150',
              col.color,
              isOver
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                : 'bg-gray-50',
            )}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700">{col.title}</h3>
              <Badge variant="default">{col.requests.length}</Badge>
            </div>

            {/* Drop zone indicator */}
            {isOver && draggedId && (
              <div className="mx-3 mb-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-center text-xs text-blue-500">
                Soltar aqui para mover para &quot;{col.title}&quot;
              </div>
            )}

            {/* Cards */}
            <div className="space-y-2 px-3 pb-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {col.requests.length === 0 && !isOver ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  Nenhuma solicitacao
                </p>
              ) : (
                col.requests.map((req) => (
                  <div
                    key={req.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, req.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-grab active:cursor-grabbing transition-opacity duration-150',
                      draggedId === req.id && 'opacity-40',
                    )}
                  >
                    <RequestCard
                      request={req}
                      onClick={() => onRequestClick?.(req)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}

      {/* Unmapped requests (should not normally exist) */}
      {unmapped.length > 0 && (
        <div className="min-w-[280px] flex-1 rounded-xl bg-red-50 border border-red-200 border-t-4 border-t-red-400">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-semibold text-red-700">Outros</h3>
            <Badge variant="danger">{unmapped.length}</Badge>
          </div>
          <div className="space-y-2 px-3 pb-3">
            {unmapped.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onClick={() => onRequestClick?.(req)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
