import { useMemo } from 'react'
import { useAllRequests } from '@/hooks/useRequests'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Request } from '@/types'
import { DollarSign, Clock } from 'lucide-react'

/**
 * Pending Deposits Page - Secretaria/Coordenacao only.
 * Replicates GAS renderPendingDepositsView: shows all requests with
 * status "Aguardando Deposito Financeiro" for financial tracking.
 */
export function PendingDepositsPage() {
  const { data: allRequests } = useAllRequests()

  const deposits = useMemo(() => {
    return (allRequests ?? []).filter((r) => {
      const s = r.status.toLowerCase()
      return s.includes('deposito') || s.includes('aguardando deposito')
    })
  }, [allRequests])

  const totalValue = useMemo(() => {
    return deposits.reduce((sum, r) => {
      const val = r.detalhes?.['diaria-valor-calculado'] ?? r.detalhes?.['fin-valor-original'] ?? 0
      return sum + Number(val)
    }, 0)
  }, [deposits])

  const columns: Column<Request>[] = [
    {
      key: 'aluno',
      header: 'Solicitante',
      sortable: true,
      accessor: (r) => r.nomeAluno ?? '',
      render: (r) => <span className="font-medium text-gray-800">{r.nomeAluno}</span>,
    },
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      accessor: (r) => r.tipoSolicitacao,
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (r) => {
        const val = r.detalhes?.['diaria-valor-calculado'] ?? r.detalhes?.['fin-valor-original']
        return val ? formatCurrency(Number(val)) : '-'
      },
    },
    {
      key: 'data',
      header: 'Data Solicitacao',
      sortable: true,
      accessor: (r) => r.dataCriacao?.toDate?.().getTime?.() ?? 0,
      render: (r) => formatDate(r.dataCriacao),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant="warning">{r.status}</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800">Depositos Pendentes</h1>
        <p className="text-gray-500">Solicitacoes aguardando deposito financeiro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{deposits.length}</p>
              <p className="text-xs text-gray-500">Depositos Pendentes</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-gray-500">Valor Total</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={deposits}
        keyExtractor={(r) => r.id}
        searchFn={(r, q) =>
          (r.nomeAluno?.toLowerCase().includes(q) ?? false) ||
          (r.tipoSolicitacao?.toLowerCase().includes(q) ?? false)
        }
        searchPlaceholder="Buscar por nome ou tipo..."
        emptyMessage="Nenhum deposito pendente."
      />
    </div>
  )
}
