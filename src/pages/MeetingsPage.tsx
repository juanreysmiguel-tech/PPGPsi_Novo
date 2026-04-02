import { useState } from 'react'
import { useAllMeetings } from '@/hooks/useMeetings'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MeetingModal } from '@/components/meeting/MeetingModal'
import { formatDate } from '@/lib/utils'
import type { Meeting } from '@/types'
import { Plus } from 'lucide-react'

export function MeetingsPage() {
  const { data: meetings } = useAllMeetings()
  const [modalOpen, setModalOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null)

  const columns: Column<Meeting>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sortable: true,
      accessor: (m) => m.nome,
      render: (m) => <span className="font-medium text-gray-800">{m.nome}</span>,
    },
    {
      key: 'dataReuniao',
      header: 'Data',
      sortable: true,
      accessor: (m) => m.dataReuniao?.toDate?.().getTime?.() ?? 0,
      render: (m) => formatDate(m.dataReuniao),
    },
    {
      key: 'periodo',
      header: 'Periodo',
      render: (m) => `${formatDate(m.dataInicioPeriodo)} - ${formatDate(m.dataFimPeriodo)}`,
    },
    {
      key: 'prazo',
      header: 'Prazo',
      render: (m) => formatDate(m.prazoFechamento),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (m) => m.status,
      render: (m) => (
        <Badge
          variant={
            m.status === 'Aberto' ? 'success' : m.status === 'Concluida' ? 'default' : 'danger'
          }
        >
          {m.status}
        </Badge>
      ),
    },
    {
      key: 'requests',
      header: 'Solicitacoes',
      render: (m) => <span className="text-gray-600">{m.requestCount ?? 0}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <Button variant="ghost" size="sm" onClick={() => { setEditMeeting(m); setModalOpen(true) }}>
          Editar
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Reunioes</h1>
          <p className="text-gray-500">Gerenciar calendario de reunioes do colegiado</p>
        </div>
        <Button variant="primary" onClick={() => { setEditMeeting(null); setModalOpen(true) }}>
          <Plus className="h-4 w-4" /> Nova Reuniao
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={meetings ?? []}
        keyExtractor={(m) => m.id}
        searchFn={(m, q) => m.nome.toLowerCase().includes(q)}
        searchPlaceholder="Buscar reuniao..."
        emptyMessage="Nenhuma reuniao cadastrada."
      />

      <MeetingModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditMeeting(null) }}
        meeting={editMeeting}
      />
    </div>
  )
}
