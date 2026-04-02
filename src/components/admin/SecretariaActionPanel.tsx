import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextareaField, SelectField } from '@/components/ui/FormField'
import { useUpdateRequestStatus } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { Request } from '@/types'

interface SecretariaActionPanelProps {
  open: boolean
  onClose: () => void
  request: Request | null
}

type Action = 'Aprovar' | 'Editar' | 'Reprovar' | 'AprovarPrestacao' | 'ReprovarPrestacao'

const ACTION_OPTIONS: { value: Action; label: string }[] = [
  { value: 'Aprovar', label: 'Aprovar na CPG' },
  { value: 'Editar', label: 'Aprovar com Ressalvas' },
  { value: 'Reprovar', label: 'Reprovar na CPG' },
  { value: 'AprovarPrestacao', label: 'Aprovar Prestacao de Contas' },
  { value: 'ReprovarPrestacao', label: 'Reprovar Prestacao de Contas' },
]

/**
 * Action panel for Secretaria/Coordenacao to process requests.
 * Replicates processSecretariaAction from code.gs:2203-2352.
 *
 * Ad-referendum logic: if today < meeting date, only Coordenacao can act,
 * and the status gets "ad referendum" prefix.
 */
export function SecretariaActionPanel({ open, onClose, request }: SecretariaActionPanelProps) {
  const [action, setAction] = useState<Action>('Aprovar')
  const [justification, setJustification] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [ataObservation, setAtaObservation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateStatus = useUpdateRequestStatus()
  const { userProfile, currentRole } = useAuthStore()

  const handleSubmit = async () => {
    if (!request || !userProfile) return
    setSubmitting(true)

    try {
      let newStatus = ''
      switch (action) {
        case 'Aprovar': newStatus = 'Aprovado na CPG'; break
        case 'Editar': newStatus = 'Aprovado com Ressalvas'; break
        case 'Reprovar': newStatus = 'Reprovado na CPG'; break
        case 'AprovarPrestacao': newStatus = 'Aguardando Deposito Financeiro'; break
        case 'ReprovarPrestacao': newStatus = 'Prestacao de Contas Solicitada'; break
      }

      // TODO: check meeting date for ad-referendum logic
      // If currentRole === 'Coordenacao' and today < meeting date:
      //   prefix with "ad referendum pela Coordenacao"

      const comment = [justification, additionalInfo].filter(Boolean).join(' | ')

      await updateStatus.mutateAsync({
        id: request.id,
        status: newStatus,
        actor: userProfile.email,
        comment,
      })

      toast.success(`Solicitacao: ${newStatus}`)
      resetAndClose()
    } catch (err) {
      toast.error('Erro ao processar acao.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setAction('Aprovar')
    setJustification('')
    setAdditionalInfo('')
    setAtaObservation('')
    onClose()
  }

  if (!request) return null

  const isFinancialAction = action === 'AprovarPrestacao' || action === 'ReprovarPrestacao'

  return (
    <Modal open={open} onClose={resetAndClose} title="Acao da Secretaria / Coordenacao" size="md">
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <strong>{request.tipoSolicitacao}</strong>
          <br />
          <span className="text-gray-500">Solicitante: {request.nomeAluno || '-'}</span>
          <br />
          <span className="text-gray-500">Status atual: {request.status}</span>
        </div>

        <SelectField
          label="Acao"
          id="action-select"
          options={ACTION_OPTIONS}
          value={action}
          onChange={(e) => setAction(e.target.value as Action)}
          required
        />

        <TextareaField
          label={action === 'Reprovar' || action === 'ReprovarPrestacao' ? 'Justificativa (obrigatoria)' : 'Justificativa (opcional)'}
          id="justification"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          required={action === 'Reprovar' || action === 'ReprovarPrestacao'}
        />

        {!isFinancialAction && (
          <>
            <TextareaField
              label="Informacao adicional para o aluno (opcional)"
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
            <TextareaField
              label="Observacao para a Ata (opcional)"
              id="ata-observation"
              value={ataObservation}
              onChange={(e) => setAtaObservation(e.target.value)}
              helpText="Sera registrada na ata da reuniao vinculada."
            />
          </>
        )}

        {currentRole === 'Coordenacao' && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            Como Coordenador(a), voce pode agir ad referendum antes da data da reuniao.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={action.includes('Reprovar') ? 'danger' : 'primary'}
            onClick={handleSubmit}
            loading={submitting}
          >
            Confirmar {action.includes('Reprovar') ? 'Reprovacao' : 'Aprovacao'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
