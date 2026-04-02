import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRequestsByAdvisorEmail } from '@/services/firestore/requests'
import { useAuthStore } from '@/stores/authStore'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/request/StatusBadge'
import { REQUEST_TYPES } from '@/config/requestTypes'
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import type { Request } from '@/types'

export function AdvisorDashboard() {
  const { userProfile } = useAuthStore()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>('Aguardando Avaliacao do Orientador')

  // Fetch requests for user's students
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'byAdvisor', userProfile?.email],
    queryFn: () => getRequestsByAdvisorEmail(userProfile!.email),
    enabled: !!userProfile?.email,
    staleTime: 5 * 60 * 1000,
  })

  // Filter
  const filtered = filterStatus
    ? requests.filter((r) => r.status === filterStatus)
    : requests

  // Stats
  const pending = requests.filter((r) => r.status === 'Aguardando Avaliacao do Orientador')
  const approved = requests.filter((r) => r.status === 'Aprovado pela CG (Aguardando Tramite da Secretaria)' || r.status.includes('Aprovado'))
  const rejected = requests.filter((r) => r.status.includes('Reprovado') || r.status.includes('Indeferido'))

  // Group by student
  const byStudent = requests.reduce(
    (acc, req) => {
      if (!acc[req.nomeAluno]) {
        acc[req.nomeAluno] = []
      }
      acc[req.nomeAluno].push(req)
      return acc
    },
    {} as Record<string, Request[]>,
  )

  const getRequestTypeTitle = (tipoSolicitacao: string): string => {
    const config = REQUEST_TYPES[tipoSolicitacao]
    return config?.title ?? tipoSolicitacao
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
          Dashboard do Orientador
        </h1>
        <p className="text-gray-500">Avalie solicitacoes de seus orientandos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="p-6">
            <div className="text-sm font-medium text-blue-600">Total de Solicitacoes</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{requests.length}</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-amber-600">Aguardando Avaliacao</div>
              <div className="text-3xl font-bold text-amber-900 mt-2">{pending.length}</div>
            </div>
            <Clock className="h-8 w-8 text-amber-600 opacity-20" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-green-600">Aprovadas</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{approved.length}</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-red-600">Reprovadas</div>
              <div className="text-3xl font-bold text-red-900 mt-2">{rejected.length}</div>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      {requests.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Mostrar:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === null ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(null)}
              className="text-xs"
            >
              Todas ({requests.length})
            </Button>
            <Button
              variant={filterStatus === 'Aguardando Avaliacao do Orientador' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('Aguardando Avaliacao do Orientador')}
              className="text-xs"
            >
              Pendentes ({pending.length})
            </Button>
            <Button
              variant={filterStatus?.includes('Aprovado') ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('Aprovado pela CG (Aguardando Tramite da Secretaria)')}
              className="text-xs"
            >
              Aprovadas ({approved.length})
            </Button>
            <Button
              variant={filterStatus?.includes('Reprovado') ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('Indeferido / Recusado')}
              className="text-xs"
            >
              Reprovadas ({rejected.length})
            </Button>
          </div>
        </div>
      )}

      {/* Requests by Student */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitacao para avaliar"
          description={
            filterStatus
              ? `Nao ha solicitacoes com status "${filterStatus}"`
              : 'Nao ha solicitacoes dos seus orientandos no momento.'
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(byStudent).map(([studentName, studentRequests]) => {
            const filteredStudentRequests = filterStatus
              ? studentRequests.filter((r) => r.status === filterStatus)
              : studentRequests

            if (filteredStudentRequests.length === 0) return null

            return (
              <Card key={studentName}>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{studentName}</h3>
                  <div className="space-y-2">
                    {filteredStudentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {getRequestTypeTitle(request.tipoSolicitacao)}
                              </h4>
                              <Badge
                                variant={request.categoria === 'financial' ? 'primary' : 'success'}
                                className="text-xs"
                              >
                                {request.categoria === 'financial' ? 'Financeira' : 'Academica'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {request.id.substring(0, 12)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={request.status} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRequest(request)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
}
