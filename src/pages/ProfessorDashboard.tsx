import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAdvisorRequests, useMyRequests } from '@/hooks/useRequests'
import { useStudentsByAdvisor } from '@/hooks/useUser'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AccordionItem } from '@/components/ui/Accordion'
import { RequestCard } from '@/components/request/RequestCard'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { isFinancialType } from '@/lib/statusUtils'
import type { Request, User } from '@/types'
import { Users, Megaphone, BookOpen, DollarSign, Clock, CheckCircle, XCircle, Pause } from 'lucide-react'

type Category = 'academico' | 'financeiro'
type StatusFilter = 'pendentes' | 'aceitos' | 'pautados' | 'recusados'

/**
 * Professor Dashboard - Full replication of js.html renderProfessor (line 1037-1167).
 * Orientandos list, student requests with category tabs + status filters, own financial requests.
 */
export function ProfessorDashboard() {
  const navigate = useNavigate()
  const { userProfile: user } = useAuthStore()
  const firstName = user?.nome?.split(' ')[0] || 'Professor(a)'

  const { data: orientandos, isLoading: loadingOrientandos } = useStudentsByAdvisor()
  const { data: studentRequests, isLoading: loadingStudentReqs } = useAdvisorRequests(user?.email)
  const { data: myRequests, isLoading: loadingMyReqs } = useMyRequests()

  const [category, setCategory] = useState<Category>('academico')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pendentes')
  const [detailRequest, setDetailRequest] = useState<Request | null>(null)

  // Split student requests by category
  const categorized = useMemo(() => {
    const reqs = studentRequests ?? []
    return {
      academico: reqs.filter((r) => !isFinancialType(r.tipoSolicitacao)),
      financeiro: reqs.filter((r) => isFinancialType(r.tipoSolicitacao)),
    }
  }, [studentRequests])

  // Filter by status
  const filtered = useMemo(() => {
    const list = categorized[category]
    return list.filter((r) => {
      const s = r.status.toLowerCase()
      switch (statusFilter) {
        case 'pendentes': return s.includes('orientador') || s.includes('aguardando')
        case 'aceitos': return s.includes('pendente') && !s.includes('orientador')
        case 'pautados': return s.includes('pauta') || s.includes('reuniao')
        case 'recusados': return s.includes('indeferido') || s.includes('reprovado') || s.includes('recusado')
        default: return true
      }
    })
  }, [categorized, category, statusFilter])

  // Counts
  const statusCounts = useMemo(() => {
    const list = categorized[category]
    return {
      pendentes: list.filter((r) => { const s = r.status.toLowerCase(); return s.includes('orientador') || s.includes('aguardando') }).length,
      aceitos: list.filter((r) => { const s = r.status.toLowerCase(); return s.includes('pendente') && !s.includes('orientador') }).length,
      pautados: list.filter((r) => { const s = r.status.toLowerCase(); return s.includes('pauta') || s.includes('reuniao') }).length,
      recusados: list.filter((r) => { const s = r.status.toLowerCase(); return s.includes('indeferido') || s.includes('reprovado') || s.includes('recusado') }).length,
    }
  }, [categorized, category])

  // Own financial requests
  const myFinancial = useMemo(
    () => (myRequests ?? []).filter((r) => isFinancialType(r.tipoSolicitacao)),
    [myRequests],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
          Ola, Prof. {firstName}
        </h1>
        <p className="text-gray-500">Gerencie seus orientandos e solicitacoes</p>
      </div>

      {/* Quick actions */}
      <Card>
        <CardBody className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => navigate('/financeiro')}>
            Pendencias de Orientandos
          </Button>
          <Button variant="outline" onClick={() => navigate('/mural')}>
            <Megaphone className="h-4 w-4" /> Mural da Comunidade
          </Button>
          <Button variant="ghost" onClick={() => navigate('/ajuda')}>
            Central de Ajuda
          </Button>
        </CardBody>
      </Card>

      {/* Mural preview */}
      <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardBody className="p-4">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            Mural da Comunidade PPGPsi
          </h5>
          <p className="text-xs text-gray-500 mb-2">
            Publicize sua pesquisa, publicacao de artigos, livros, capitulos de livros, coleta de dados, Produtos Tecnicos e Tecnologicos.
          </p>
          <button onClick={() => navigate('/mural')} className="text-sm text-primary font-medium hover:underline">
            Ver todas as publicacoes &rarr;
          </button>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Orientandos column */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <h6 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Orientandos Ativos
              </h6>
            </CardHeader>
            <CardBody className="p-0">
              {loadingOrientandos ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !orientandos || orientandos.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">Nenhum orientando ativo</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orientandos.map((student: User) => (
                    <div key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {student.nome?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{student.nome}</p>
                        <p className="text-xs text-gray-500">{student.nivel || 'Discente'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Student requests column */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <h6 className="font-semibold text-gray-800 mb-3">Pedidos de Alunos</h6>

              {/* Category tabs */}
              <div className="flex gap-1 mb-3">
                <CategoryTab
                  active={category === 'academico'}
                  onClick={() => { setCategory('academico'); setStatusFilter('pendentes') }}
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label="Academico"
                  count={categorized.academico.length}
                  variant="primary"
                />
                <CategoryTab
                  active={category === 'financeiro'}
                  onClick={() => { setCategory('financeiro'); setStatusFilter('pendentes') }}
                  icon={<DollarSign className="h-3.5 w-3.5" />}
                  label="Financeiro"
                  count={categorized.financeiro.length}
                  variant="success"
                />
              </div>

              {/* Status sub-filters */}
              <div className="flex gap-1 flex-wrap">
                <FilterButton active={statusFilter === 'pendentes'} onClick={() => setStatusFilter('pendentes')} icon={<Clock className="h-3 w-3" />} label="Aguardando" count={statusCounts.pendentes} color="amber" />
                <FilterButton active={statusFilter === 'aceitos'} onClick={() => setStatusFilter('aceitos')} icon={<Pause className="h-3 w-3" />} label="Pendente" count={statusCounts.aceitos} color="blue" />
                <FilterButton active={statusFilter === 'pautados'} onClick={() => setStatusFilter('pautados')} icon={<CheckCircle className="h-3 w-3" />} label="Em Pauta" count={statusCounts.pautados} color="purple" />
                <FilterButton active={statusFilter === 'recusados'} onClick={() => setStatusFilter('recusados')} icon={<XCircle className="h-3 w-3" />} label="Rejeitado" count={statusCounts.recusados} color="red" />
              </div>
            </CardHeader>
            <CardBody className="p-3">
              {loadingStudentReqs ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState title="Nenhuma solicitacao" description="Nenhum pedido com este filtro." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filtered.map((r) => (
                    <RequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Own financial requests accordion */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <AccordionItem
          title="Meus Pedidos Financeiros"
          badge={<Badge variant="success">{myFinancial.length}</Badge>}
        >
          {loadingMyReqs ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : myFinancial.length === 0 ? (
            <EmptyState title="Sem pedidos" description="Voce nao tem pedidos financeiros proprios." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {myFinancial.map((r) => (
                <RequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />
              ))}
            </div>
          )}
        </AccordionItem>
      </div>

      {/* Detail modal */}
      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
      />
    </div>
  )
}

/* Helpers */

function CategoryTab({ active, onClick, icon, label, count, variant }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number; variant: 'primary' | 'success'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        active
          ? variant === 'primary' ? 'bg-primary text-white' : 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      )}
    >
      {icon}
      {label}
      <span className={cn(
        'ml-1 rounded-full px-2 py-0.5 text-xs',
        active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
      )}>
        {count}
      </span>
    </button>
  )
}

function FilterButton({ active, onClick, icon, label, count, color }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number; color: string
}) {
  const colors: Record<string, string> = {
    amber: active ? 'bg-amber-100 text-amber-700 border-amber-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
    blue: active ? 'bg-blue-100 text-blue-700 border-blue-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
    purple: active ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
    red: active ? 'bg-red-100 text-red-700 border-red-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        colors[color],
      )}
    >
      {icon}
      {label}
      <span className="ml-1">{count}</span>
    </button>
  )
}
