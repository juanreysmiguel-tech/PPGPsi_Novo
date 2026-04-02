import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, orderBy, type DocumentData } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { formatDate } from '@/lib/utils'
import type { Request } from '@/types'
import { Timestamp } from 'firebase/firestore'

function toArchivedRequest(id: string, data: DocumentData): Request {
  return {
    id,
    dataCriacao: data.dataCriacao ?? Timestamp.now(),
    idUsuario: data.idUsuario ?? '',
    tipoSolicitacao: data.tipoSolicitacao ?? '',
    categoria: data.categoria ?? 'academic',
    detalhes: data.detalhes ?? {},
    status: data.status ?? '',
    historicoAprovacao: data.historicoAprovacao ?? [],
    comentarios: data.comentarios ?? '',
    emailOrientador: data.emailOrientador ?? '',
    nomeAluno: data.nomeAluno ?? '',
    arquivos: data.arquivos ?? [],
    createdAt: data.createdAt ?? data.dataCriacao ?? Timestamp.now(),
    updatedAt: data.updatedAt ?? data.dataCriacao ?? Timestamp.now(),
  }
}

async function getArchivedRequests(): Promise<Request[]> {
  const q = query(collection(db, 'archivedRequests'), orderBy('dataCriacao', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toArchivedRequest(d.id, d.data()))
}

export function ArchivePage() {
  const { data: archived } = useQuery({
    queryKey: ['archivedRequests'],
    queryFn: getArchivedRequests,
    staleTime: 5 * 60 * 1000,
  })

  const [detailRequest, setDetailRequest] = useState<Request | null>(null)

  const columns: Column<Request>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      accessor: (r) => r.tipoSolicitacao,
      render: (r) => <span className="text-sm font-medium text-gray-800">{r.tipoSolicitacao}</span>,
    },
    {
      key: 'aluno',
      header: 'Solicitante',
      sortable: true,
      accessor: (r) => r.nomeAluno ?? '',
      render: (r) => <span className="text-sm text-gray-600">{r.nomeAluno || '-'}</span>,
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
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (r) => (
        <Badge variant={r.categoria === 'financial' ? 'success' : 'primary'}>
          {r.categoria === 'financial' ? 'Financeiro' : 'Academico'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800">Arquivo</h1>
        <p className="text-gray-500">Solicitacoes concluidas e arquivadas</p>
      </div>

      <DataTable
        columns={columns}
        data={archived ?? []}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => setDetailRequest(r)}
        searchFn={(r, q) =>
          (r.tipoSolicitacao?.toLowerCase().includes(q) ?? false) ||
          (r.nomeAluno?.toLowerCase().includes(q) ?? false) ||
          (r.status?.toLowerCase().includes(q) ?? false)
        }
        searchPlaceholder="Buscar no arquivo..."
        emptyMessage="Nenhuma solicitacao arquivada."
      />

      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
      />
    </div>
  )
}
