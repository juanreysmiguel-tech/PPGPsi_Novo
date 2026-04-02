import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'
import { useAllRequests } from '@/hooks/useRequests'
import { useAllMeetings } from '@/hooks/useMeetings'
import { useAllUsers } from '@/hooks/useUser'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { SecretariaActionPanel } from '@/components/admin/SecretariaActionPanel'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import type { Request } from '@/types'
import { LayoutGrid, Calendar, Users, DollarSign, Archive } from 'lucide-react'

/**
 * Secretaria / Coordenacao Dashboard.
 * Full Kanban view, stats, quick actions.
 */
export function SecretariaDashboard() {
  const navigate = useNavigate()
  const { currentRole } = useRole()

  const { data: requests, isLoading: loadingReqs } = useAllRequests()
  const { data: meetings } = useAllMeetings()
  const { data: users } = useAllUsers()

  const [detailRequest, setDetailRequest] = useState<Request | null>(null)
  const [actionRequest, setActionRequest] = useState<Request | null>(null)

  // Stats
  const stats = useMemo(() => {
    const reqs = requests ?? []
    const pending = reqs.filter((r) => {
      const s = r.status.toLowerCase()
      return !s.includes('concluido') && !s.includes('arquivado') && !s.includes('indeferido') && !s.includes('excluido')
    })
    const financial = reqs.filter((r) => r.categoria === 'financial')
    return {
      pending: pending.length,
      meetings: (meetings ?? []).filter((m) => m.status === 'Aberto').length,
      users: (users ?? []).length,
      financial: financial.length,
    }
  }, [requests, meetings, users])

  const handleRequestClick = (request: Request) => {
    setDetailRequest(request)
  }

  const openAction = () => {
    if (detailRequest) {
      setActionRequest(detailRequest)
      setDetailRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
            Painel {currentRole === 'Coordenacao' ? 'da Coordenacao' : 'da Secretaria'}
          </h1>
          <p className="text-gray-500">Visao geral do sistema</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/reunioes')}>
            <Calendar className="h-4 w-4" /> Reunioes
          </Button>
          <Button variant="outline" onClick={() => navigate('/usuarios')}>
            <Users className="h-4 w-4" /> Usuarios
          </Button>
          <Button variant="outline" onClick={() => navigate('/arquivo')}>
            <Archive className="h-4 w-4" /> Arquivo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pendentes" value={stats.pending} icon={LayoutGrid} color="text-amber-500 bg-amber-50" />
        <StatCard label="Reunioes Abertas" value={stats.meetings} icon={Calendar} color="text-blue-500 bg-blue-50" />
        <StatCard label="Usuarios" value={stats.users} icon={Users} color="text-purple-500 bg-purple-50" />
        <StatCard label="Financeiro" value={stats.financial} icon={DollarSign} color="text-emerald-500 bg-emerald-50" />
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Quadro de Solicitacoes</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/financeiro')}>
              <DollarSign className="h-4 w-4" /> Painel Financeiro
            </Button>
          </div>
        </div>
        <KanbanBoard
          requests={requests ?? []}
          onRequestClick={handleRequestClick}
          isLoading={loadingReqs}
        />
      </div>

      {/* Request detail modal with Secretaria actions */}
      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
        actions={detailRequest ? [
          {
            label: 'Processar Acao',
            variant: 'primary',
            onClick: openAction,
          },
        ] : undefined}
      />

      {/* Action panel */}
      <SecretariaActionPanel
        open={!!actionRequest}
        onClose={() => setActionRequest(null)}
        request={actionRequest}
      />
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.FC<{ className?: string }>; color: string
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  )
}
