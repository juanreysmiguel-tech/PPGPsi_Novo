import { useState, useMemo } from 'react'
import { useAllRequests } from '@/hooks/useRequests'
import { useAllFinancialRecords } from '@/hooks/useFinancial'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DiariaCalculator } from '@/components/financial/DiariaCalculator'
import { CurrencyConverter } from '@/components/financial/CurrencyConverter'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { formatDate, formatCurrency } from '@/lib/utils'
import { isFinancialType } from '@/lib/statusUtils'
import { FINANCIAL_STATUS } from '@/config/constants'
import type { Request } from '@/types'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export function FinancialPage() {
  const { data: allRequests } = useAllRequests()
  const { data: financialRecords } = useAllFinancialRecords()

  const [detailRequest, setDetailRequest] = useState<Request | null>(null)

  const financial = useMemo(
    () => (allRequests ?? []).filter((r) => isFinancialType(r.tipoSolicitacao)),
    [allRequests],
  )

  // Stats
  const stats = useMemo(() => {
    const pending = financial.filter((r) => {
      const s = r.status
      return s !== FINANCIAL_STATUS.COMPLETED && s !== FINANCIAL_STATUS.REJECTED && s !== FINANCIAL_STATUS.DELETED
    })
    const approved = financial.filter((r) => r.status.toLowerCase().includes('aprovado'))
    const totalValue = (financialRecords ?? []).reduce((sum, f) => sum + (f.valor ?? 0), 0)
    return { total: financial.length, pending: pending.length, approved: approved.length, totalValue }
  }, [financial, financialRecords])

  const columns: Column<Request>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      accessor: (r) => r.tipoSolicitacao,
      render: (r) => <span className="text-sm font-medium">{r.tipoSolicitacao}</span>,
    },
    {
      key: 'aluno',
      header: 'Solicitante',
      sortable: true,
      accessor: (r) => r.nomeAluno ?? '',
    },
    {
      key: 'data',
      header: 'Data',
      sortable: true,
      accessor: (r) => r.dataCriacao?.toDate?.().getTime?.() ?? 0,
      render: (r) => formatDate(r.dataCriacao),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={r.status.includes('Aprovado') ? 'success' : r.status.includes('Indeferido') ? 'danger' : 'warning'}>{r.status}</Badge>,
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (r) => {
        const val = r.detalhes?.['diaria-valor-calculado'] ?? r.detalhes?.['fin-valor-original']
        return val ? formatCurrency(Number(val)) : '-'
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800">Painel Financeiro</h1>
        <p className="text-gray-500">Visao geral de todos os auxilios financeiros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign />} label="Total" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<Clock />} label="Pendentes" value={stats.pending} color="bg-amber-50 text-amber-600" />
        <StatCard icon={<CheckCircle />} label="Aprovados" value={stats.approved} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<TrendingUp />} label="Valor Total" value={formatCurrency(stats.totalValue)} color="bg-purple-50 text-purple-600" isText />
      </div>

      {/* Tools */}
      <div className="grid md:grid-cols-2 gap-6">
        <DiariaCalculator />
        <CurrencyConverter />
      </div>

      {/* Financial requests table */}
      <DataTable
        columns={columns}
        data={financial}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => setDetailRequest(r)}
        searchFn={(r, q) =>
          (r.tipoSolicitacao?.toLowerCase().includes(q) ?? false) ||
          (r.nomeAluno?.toLowerCase().includes(q) ?? false)
        }
        searchPlaceholder="Buscar solicitacao financeira..."
        emptyMessage="Nenhuma solicitacao financeira."
      />

      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
      />
    </div>
  )
}

function StatCard({ icon, label, value, color, isText }: {
  icon: React.ReactNode; label: string; value: number | string; color: string; isText?: boolean
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className={isText ? 'text-lg font-bold text-gray-800' : 'text-2xl font-bold text-gray-800'}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  )
}
