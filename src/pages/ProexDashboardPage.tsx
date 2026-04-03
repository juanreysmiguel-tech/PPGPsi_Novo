import { useState, useMemo } from 'react'
import { useMyRequests } from '@/hooks/useRequests'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequestCard } from '@/components/request/RequestCard'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { NewRequestModal } from '@/components/request/NewRequestModal'
import { isFinancialType } from '@/lib/statusUtils'
import { formatCurrency } from '@/lib/utils'
import type { Request } from '@/types'
import { DollarSign, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'

/**
 * PROEX Resources Dashboard - Docente only.
 * Replicates GAS renderProexDashboard: shows the professor's own
 * financial/PROEX requests with stats and quick creation.
 */
export function ProexDashboardPage() {
  const { data: myRequests, isLoading } = useMyRequests()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState<Request | null>(null)

  const financialRequests = useMemo(
    () => (myRequests ?? []).filter((r) => isFinancialType(r.tipoSolicitacao)),
    [myRequests],
  )

  const stats = useMemo(() => {
    const pending = financialRequests.filter((r) => {
      const s = r.status.toLowerCase()
      return !s.includes('concluido') && !s.includes('arquivado') && !s.includes('indeferido')
    })
    const approved = financialRequests.filter((r) => r.status.toLowerCase().includes('aprovado'))
    const totalValue = financialRequests.reduce((sum, r) => {
      const val = r.detalhes?.['diaria-valor-calculado'] ?? r.detalhes?.['fin-valor-original'] ?? 0
      return sum + Number(val)
    }, 0)
    return { total: financialRequests.length, pending: pending.length, approved: approved.length, totalValue }
  }, [financialRequests])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Recursos PROEX</h1>
          <p className="text-gray-500">Solicitar e acompanhar auxilios financeiros PROEX</p>
        </div>
        <Button variant="primary" onClick={() => setNewModalOpen(true)}>
          <Plus className="h-4 w-4" /> Solicitar Recurso PROEX
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
              <p className="text-xs text-gray-500">Aprovados</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500">Valor Total</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Request cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : financialRequests.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-12 w-12" />}
          title="Sem solicitacoes PROEX"
          description="Voce ainda nao possui solicitacoes de recursos PROEX."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {financialRequests.map((r) => (
            <RequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />
          ))}
        </div>
      )}

      <NewRequestModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        defaultCategory="financial"
      />

      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
      />
    </div>
  )
}
