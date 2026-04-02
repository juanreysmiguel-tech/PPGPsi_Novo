import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRequestsByStatus } from '@/services/firestore/requests'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { CGParecerModal } from '@/components/cg/CGParecerModal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/request/StatusBadge'
import { REQUEST_TYPES } from '@/config/requestTypes'
import { CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react'
import type { Request } from '@/types'

export function CGDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [parecerMode, setParecerMode] = useState(false)
  const [view, setView] = useState<'pending' | 'approved' | 'rejected'>('pending')

  // Fetch financial requests awaiting CG analysis
  const { data: pending = [], isLoading: loadingPending } = useQuery({
    queryKey: ['requests', 'status', 'Em Analise pela Comissao de Gestao (CG)'],
    queryFn: () => getRequestsByStatus('Em Analise pela Comissao de Gestao (CG)'),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch approved by CG
  const { data: approved = [] } = useQuery({
    queryKey: ['requests', 'status', 'Aprovado pela CG'],
    queryFn: () => getRequestsByStatus('Aprovado pela CG (Aguardando Tramite da Secretaria)'),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch rejected
  const { data: rejected = [] } = useQuery({
    queryKey: ['requests', 'status', 'Indeferido / Recusado'],
    queryFn: () => getRequestsByStatus('Indeferido / Recusado'),
    staleTime: 5 * 60 * 1000,
  })
  const displayed = view === 'pending' ? pending : view === 'approved' ? approved : rejected

  const getRequestTypeTitle = (tipoSolicitacao: string): string => {
    const config = REQUEST_TYPES[tipoSolicitacao]
    return config?.title ?? tipoSolicitacao
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
          Dashboard do CG (Conselho de Gestao)
        </h1>
        <p className="text-gray-500">Avaliar solicitacoes financeiras e emitir parecer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-amber-600">Aguardando Parecer</div>
              <div className="text-3xl font-bold text-amber-900 mt-2">{pending.length}</div>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-600 opacity-20" />
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
              <div className="text-sm font-medium text-red-600">Indeferidas</div>
              <div className="text-3xl font-bold text-red-900 mt-2">{rejected.length}</div>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={view === 'pending' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('pending')}
          className="text-sm"
        >
          Aguardando ({pending.length})
        </Button>
        <Button
          variant={view === 'approved' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('approved')}
          className="text-sm"
        >
          Aprovadas ({approved.length})
        </Button>
        <Button
          variant={view === 'rejected' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('rejected')}
          className="text-sm"
        >
          Indeferidas ({rejected.length})
        </Button>
      </div>

      {/* Request List */}
      {loadingPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Nenhuma solicitacao"
          description={
            view === 'pending'
              ? 'Nao ha solicitacoes aguardando parecer do CG'
              : view === 'approved'
                ? 'Nao ha solicitacoes aprovadas'
                : 'Nao ha solicitacoes indeferidas'
          }
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {getRequestTypeTitle(request.tipoSolicitacao)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Solicitante: <strong>{request.nomeAluno}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">
                      Financeira
                    </Badge>
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3 p-3 bg-gray-50 rounded">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Solicitado</div>
                    <div className="font-medium text-gray-900">
                      R$ {request.detalhes?.valor ? parseFloat(String(request.detalhes.valor)).toFixed(2) : '0,00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Orientador</div>
                    <div className="font-medium text-gray-900">
                      {request.emailOrientador || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">ID Solicitacao</div>
                    <div className="font-medium text-gray-900">
                      {request.id.substring(0, 8)}...
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Ultima Atualizacao</div>
                    <div className="font-medium text-gray-900">
                      {request.historicoAprovacao?.[0]?.date || '-'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {request.historicoAprovacao?.length || 0} eventos no historico
                  </div>
                  <div className="flex gap-2">
                    {view === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setParecerMode(true)
                        }}
                      >
                        Emitir Parecer
                      </Button>
                    )}
                    <Button
                      variant="outline"
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
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && !parecerMode && (
        <RequestDetailModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Parecer Modal */}
      {selectedRequest && parecerMode && (
        <CGParecerModal
          request={selectedRequest}
          open={parecerMode}
          onClose={() => {
            setParecerMode(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </div>
  )
}
