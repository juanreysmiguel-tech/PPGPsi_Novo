import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePareceristaRequests, useAllRequests } from '@/hooks/useRequests'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RequestCard } from '@/components/request/RequestCard'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { CGParecerModal } from '@/components/cg/CGParecerModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { isFinancialType } from '@/lib/statusUtils'
import type { Request } from '@/types'
import { ClipboardCheck, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react'

/**
 * CG Parecer Page - Full replication of renderConselhoFinanceiro.
 * Shows pending pareceres assigned to the logged-in CG member,
 * with stats and a parecer submission modal.
 */
export function CGParecerPage() {
  const { userProfile } = useAuthStore()
  const { data: myRequests, isLoading } = usePareceristaRequests(userProfile?.id ?? '')
  const { data: allRequests } = useAllRequests()

  const [detailRequest, setDetailRequest] = useState<Request | null>(null)
  const [parecerRequest, setParecerRequest] = useState<Request | null>(null)

  // Split into pending vs completed
  const { pending, completed, rejected } = useMemo(() => {
    const reqs = (myRequests ?? []).filter((r) => isFinancialType(r.tipoSolicitacao))
    return {
      pending: reqs.filter((r) => {
        const s = r.status.toLowerCase()
        return s.includes('cg') || s.includes('orientador') || s.includes('elucidacao')
      }),
      completed: reqs.filter((r) => {
        const s = r.status.toLowerCase()
        return s.includes('aprovado') && !s.includes('cg')
      }),
      rejected: reqs.filter((r) => {
        const s = r.status.toLowerCase()
        return s.includes('indeferido') || s.includes('recusado')
      }),
    }
  }, [myRequests])

  // Global stats
  const globalStats = useMemo(() => {
    const fin = (allRequests ?? []).filter((r) => isFinancialType(r.tipoSolicitacao))
    return {
      total: fin.length,
      pendingCG: fin.filter((r) => r.status.toLowerCase().includes('cg')).length,
      approved: fin.filter((r) => r.status.toLowerCase().includes('aprovado')).length,
    }
  }, [allRequests])

  const openParecer = () => {
    if (detailRequest) {
      setParecerRequest(detailRequest)
      setDetailRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
          Painel do Conselho / CG
        </h1>
        <p className="text-gray-500">Gestao de pareceres financeiros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="h-5 w-5" />} label="Meus Pendentes" value={pending.length} color="bg-amber-50 text-amber-600" />
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="Meus Aprovados" value={completed.length} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Indeferidos" value={rejected.length} color="bg-red-50 text-red-600" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Total Financeiro" value={globalStats.total} color="bg-blue-50 text-blue-600" />
      </div>

      {/* Pending pareceres */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Pareceres Pendentes
          <Badge variant="warning">{pending.length}</Badge>
        </h2>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            title="Nenhum parecer pendente"
            description="Voce nao tem solicitacoes financeiras aguardando avaliacao."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pending.map((r) => (
              <RequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />
            ))}
          </div>
        )}
      </div>

      {/* Completed pareceres */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Pareceres Emitidos</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((r) => (
              <RequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />
            ))}
          </div>
        </div>
      )}

      {/* Detail modal with CG action */}
      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
        actions={detailRequest && pending.some((p) => p.id === detailRequest.id) ? [
          { label: 'Emitir Parecer', variant: 'primary', onClick: openParecer },
        ] : undefined}
      />

      {/* CG Parecer modal */}
      <CGParecerModal
        open={!!parecerRequest}
        onClose={() => setParecerRequest(null)}
        request={parecerRequest}
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  )
}
