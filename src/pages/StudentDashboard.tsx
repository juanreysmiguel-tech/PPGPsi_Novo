import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useMyRequests } from '@/hooks/useRequests'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { MeetingAlert } from '@/components/request/MeetingAlert'
import { RequestAccordion } from '@/components/request/RequestAccordion'
import { NewRequestModal } from '@/components/request/NewRequestModal'
import { RequestDetailModal } from '@/components/request/RequestDetailModal'
import { formatDate } from '@/lib/utils'
import type { Request } from '@/types'
import { FileText, GraduationCap, HelpCircle, User, Edit, Megaphone } from 'lucide-react'

/**
 * Student Dashboard - Full replication of js.html renderStudent (line 556-817).
 * Profile card, meeting alert, request accordions, mural preview.
 */
export function StudentDashboard() {
  const navigate = useNavigate()
  const { userProfile: user } = useAuthStore()
  const { data: requests, isLoading } = useMyRequests()

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newModalCategory, setNewModalCategory] = useState<'academic' | 'financial' | undefined>()
  const [detailRequest, setDetailRequest] = useState<Request | null>(null)

  if (!user) return null
  const firstName = user.nome?.split(' ')[0] || 'Aluno'

  const openNewRequest = (category?: 'academic' | 'financial') => {
    setNewModalCategory(category)
    setNewModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
          Ola, {firstName}
        </h1>
        <p className="text-gray-500">Painel do Discente</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardBody className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => openNewRequest()}>
            <FileText className="h-4 w-4" /> Nova Solicitacao
          </Button>
          <Button variant="outline" onClick={() => navigate('/defesa')}>
            <GraduationCap className="h-4 w-4" /> Agendar Defesa
          </Button>
          <Button variant="ghost" onClick={() => navigate('/ajuda')}>
            <HelpCircle className="h-4 w-4" /> Central de Ajuda
          </Button>
        </CardBody>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {user.fotoUrl ? (
                <img src={user.fotoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{user.nome || 'Usuario'}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="h-3.5 w-3.5" /> Editar Contatos
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
            <ProfileField label="Orientador(a)" value={user.nomeOrientador || '-'} />
            <ProfileField label="Data Defesa" value={formatDate(user.dataDefesa)} />
            <ProfileField label="Creditos" value={String(user.creditosTotais ?? 0)} highlight />
            <ProfileField label="Nivel" value={user.nivel || '-'} />
          </div>
        </CardBody>
      </Card>

      {/* Meeting Alert */}
      <MeetingAlert onNewRequest={() => openNewRequest()} />

      {/* Request Accordions */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <RequestAccordion
          requests={requests ?? []}
          onRequestClick={(r) => setDetailRequest(r)}
          onNewFinancial={() => openNewRequest('financial')}
        />
      )}

      {/* Mural Preview */}
      <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardBody className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-indigo-500" />
                Mural da Comunidade PPGPsi
              </h5>
              <p className="text-xs text-gray-500">Publicize sua pesquisa, artigos e produtos tecnicos.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/mural')}
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver todas as publicacoes &rarr;
          </button>
        </CardBody>
      </Card>

      {/* Modals */}
      <NewRequestModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        defaultCategory={newModalCategory}
      />

      <RequestDetailModal
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
      />
    </div>
  )
}

/* Helper */
function ProfileField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">{label}</p>
      <p className={highlight ? 'text-xl font-bold text-primary' : 'text-sm font-medium text-gray-700'}>
        {value}
      </p>
    </div>
  )
}
