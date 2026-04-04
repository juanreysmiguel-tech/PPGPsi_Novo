import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllRequests } from '@/hooks/useRequests'
import { useAllMeetings } from '@/hooks/useMeetings'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { SecretariaActionPanel } from '@/components/admin/SecretariaActionPanel'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { CSVImportModal } from '@/components/admin/CSVImportModal'
import { formatDate } from '@/lib/utils'
import type { Request, Meeting } from '@/types'
import {
  LayoutGrid, Calendar, Users,
  UserPlus, FolderArchive, FileDown, AlertTriangle,
} from 'lucide-react'

/**
 * Secretaria / Coordenacao Dashboard.
 * Replicates GAS renderSecretariaDashboard: stats, pending actions list,
 * quick actions sidebar, upcoming meetings, recent approvals, and Kanban.
 */
export function SecretariaDashboard() {
  const navigate = useNavigate()
  const { data: requests, isLoading: loadingReqs } = useAllRequests()
  const { data: meetings } = useAllMeetings()

  const [detailRequest, setDetailRequest] = useState<Request | null>(null)
  const [actionRequest, setActionRequest] = useState<Request | null>(null)
  const [showKanban, setShowKanban] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)

  // Stats - matching GAS: aguardandoOrientador, pautadosCPG, aprovadosHoje, totalPendentes
  const stats = useMemo(() => {
    const reqs = requests ?? []
    const aguardando = reqs.filter((r) => r.status.toLowerCase().includes('orientador')).length
    const pautados = reqs.filter((r) => {
      const s = r.status.toLowerCase()
      return s.includes('pauta') || s.includes('reuniao')
    }).length
    const today = new Date().toDateString()
    const aprovadosHoje = reqs.filter((r) => {
      const s = r.status.toLowerCase()
      const date = r.updatedAt?.toDate?.()
      return s.includes('aprovado') && date && date.toDateString() === today
    }).length
    const totalPendentes = reqs.filter((r) => {
      const s = r.status.toLowerCase()
      return !s.includes('concluido') && !s.includes('arquivado') && !s.includes('indeferido') && !s.includes('excluido')
    }).length
    return { aguardando, pautados, aprovadosHoje, totalPendentes }
  }, [requests])

  // Pending actions - requests needing Secretaria action
  const pendingActions = useMemo(() => {
    const reqs = requests ?? []
    return reqs.filter((r) => {
      const s = r.status.toLowerCase()
      return s.includes('pendente') || s.includes('aprovado pela cg') || s.includes('prestacao de contas')
    }).slice(0, 15)
  }, [requests])

  // Recent approvals
  const recentApprovals = useMemo(() => {
    const reqs = requests ?? []
    return reqs
      .filter((r) => r.status.toLowerCase().includes('aprovado'))
      .sort((a, b) => {
        const da = a.updatedAt?.toDate?.()?.getTime() ?? 0
        const db = b.updatedAt?.toDate?.()?.getTime() ?? 0
        return db - da
      })
      .slice(0, 5)
  }, [requests])

  // Upcoming meetings
  const upcomingMeetings = useMemo(() => {
    const mts = meetings ?? []
    const now = new Date()
    return mts
      .filter((m) => {
        const d = m.dataReuniao?.toDate?.()
        return d && d >= now && m.status === 'Aberto'
      })
      .sort((a, b) => {
        const da = a.dataReuniao?.toDate?.()?.getTime() ?? 0
        const db = b.dataReuniao?.toDate?.()?.getTime() ?? 0
        return da - db
      })
      .slice(0, 5)
  }, [meetings])

  const handleRequestClick = (request: Request) => {
    setDetailRequest(request)
  }

  const openAction = () => {
    if (detailRequest) {
      setActionRequest(detailRequest)
      setDetailRequest(null)
    }
  }

  const daysUntil = (meeting: Meeting) => {
    const d = meeting.dataReuniao?.toDate?.()
    if (!d) return 999
    return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  if (showKanban) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowKanban(false)}>
            &larr; Voltar ao Dashboard
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Quadro de Solicitacoes</h2>
        </div>
        <KanbanBoard
          requests={requests ?? []}
          onRequestClick={handleRequestClick}
          isLoading={loadingReqs}
        />
        <RequestDetailModal
          open={!!detailRequest}
          onClose={() => setDetailRequest(null)}
          request={detailRequest}
          actions={detailRequest ? [{ label: 'Processar Acao', variant: 'primary', onClick: openAction }] : undefined}
        />
        <SecretariaActionPanel open={!!actionRequest} onClose={() => setActionRequest(null)} request={actionRequest} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
            Gestao de Pedidos
          </h1>
          <p className="text-gray-500">Acompanhe e gerencie todas as solicitacoes</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setShowKanban(true)}>
            <LayoutGrid className="h-4 w-4" /> Kanban
          </Button>
          <Button variant="outline" onClick={() => navigate('/reunioes')}>
            <Calendar className="h-4 w-4" /> Calendario
          </Button>
          <Button variant="ghost" onClick={() => navigate('/ajuda')}>
            Ajuda
          </Button>
        </div>
      </div>

      {/* Stats Row - Compact, Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setShowKanban(true)} className="text-left">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="text-center py-4">
              <p className="text-3xl font-bold text-amber-500">{stats.aguardando}</p>
              <p className="text-xs text-gray-500 mt-1">Aguardando Orientador</p>
            </CardBody>
          </Card>
        </button>
        <button onClick={() => setShowKanban(true)} className="text-left">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="text-center py-4">
              <p className="text-3xl font-bold text-blue-500">{stats.pautados}</p>
              <p className="text-xs text-gray-500 mt-1">Pautados CPG</p>
            </CardBody>
          </Card>
        </button>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-500">{stats.aprovadosHoje}</p>
            <p className="text-xs text-gray-500 mt-1">Aprovados Hoje</p>
          </CardBody>
        </Card>
        <button onClick={() => setShowKanban(true)} className="text-left">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="text-center py-4">
              <p className="text-3xl font-bold text-primary">{stats.totalPendentes}</p>
              <p className="text-xs text-gray-500 mt-1">Total Pendentes</p>
            </CardBody>
          </Card>
        </button>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Pending Actions (Larger) */}
        <div className="lg:col-span-8">
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-gray-800">Acoes Pendentes</span>
                <Badge variant="warning">{pendingActions.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowKanban(true)}>
                Ver Tudo &rarr;
              </Button>
            </div>
            <CardBody className="p-0">
              {pendingActions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🎉</span>
                  Nenhuma acao pendente!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingActions.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                      onClick={() => setDetailRequest(item)}
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{item.tipoSolicitacao}</p>
                        <p className="text-xs text-gray-500">
                          {item.nomeAluno} &bull; {formatDate(item.dataCriacao)}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 ${item.status.includes('Aprovado') ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.status}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">Ver &rarr;</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Quick Actions + Meetings + Approvals */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions */}
          <Card>
            <div className="px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acoes Rapidas</span>
            </div>
            <CardBody className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/usuarios')}>
                <UserPlus className="h-4 w-4" /> Novo Usuario
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/reunioes')}>
                <Calendar className="h-4 w-4" /> Nova Reuniao
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/usuarios')}>
                <Users className="h-4 w-4" /> Gerenciar Usuarios
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/arquivo')}>
                <FolderArchive className="h-4 w-4" /> Acessar Arquivo Morto
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setCsvOpen(true)}>
                <FileDown className="h-4 w-4" /> Importar ProPGWeb (CSV)
              </Button>
            </CardBody>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <div className="px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proximas Reunioes</span>
            </div>
            <CardBody className="p-0">
              {upcomingMeetings.length === 0 ? (
                <p className="text-center py-4 text-xs text-gray-400">Nenhuma reuniao agendada</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingMeetings.map((m) => {
                    const days = daysUntil(m)
                    const countdownText = days <= 0 ? 'Hoje!' : days === 1 ? 'Amanha' : `Em ${days} dias`
                    const variant = days <= 1 ? 'danger' : days <= 7 ? 'warning' : 'primary'
                    return (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{m.nome}</p>
                          <p className="text-xs text-gray-500">{formatDate(m.dataReuniao)}</p>
                        </div>
                        <Badge variant={variant}>{countdownText}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Approvals */}
          <Card>
            <div className="px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ultimas Aprovacoes</span>
            </div>
            <CardBody className="p-0">
              {recentApprovals.length === 0 ? (
                <p className="text-center py-4 text-xs text-gray-400">Nenhuma aprovacao recente</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentApprovals.map((r) => (
                    <div key={r.id} className="px-4 py-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.tipoSolicitacao}</p>
                      <p className="text-xs text-gray-500">{r.nomeAluno}</p>
                      <Badge variant="success" className="mt-1">{r.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
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

      <CSVImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </div>
  )
}

