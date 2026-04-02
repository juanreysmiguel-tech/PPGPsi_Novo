import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextareaField, SelectField, InputField } from '@/components/ui/FormField'
import { useUpdateRequestStatus, useUndoLastAction } from '@/hooks/useRequests'
import { useMeeting } from '@/hooks/useMeetings'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { FINANCIAL_STATUS } from '@/config/constants'
import type { Request } from '@/types'

interface SecretariaActionPanelProps {
  open: boolean
  onClose: () => void
  request: Request | null
}

type Action =
  | 'Aprovar'
  | 'Editar'
  | 'Reprovar'
  | 'Pautar'
  | 'SolicitarPrestacao'
  | 'AprovarPrestacao'
  | 'ReprovarPrestacao'
  | 'ConfirmarDeposito'
  | 'Desfazer'

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
  const [depositReceipt, setDepositReceipt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateStatus = useUpdateRequestStatus()
  const undoAction = useUndoLastAction()
  const { userProfile, currentRole } = useAuthStore()

  // Fetch the meeting linked to this request (for ad-referendum check)
  const { data: meeting } = useMeeting(request?.idReuniao ?? '')

  // Determine available actions based on current request status
  const getAvailableActions = (): { value: Action; label: string }[] => {
    if (!request) return []
    const s = request.status
    const actions: { value: Action; label: string }[] = []

    // CPG approval actions (when request is approved by CG or pending meeting)
    if (
      s === FINANCIAL_STATUS.APPROVED_CG ||
      s === FINANCIAL_STATUS.IN_MEETING ||
      s === FINANCIAL_STATUS.PENDING_CG ||
      s === FINANCIAL_STATUS.PENDING_ADVISOR
    ) {
      actions.push(
        { value: 'Aprovar', label: 'Aprovar na CPG' },
        { value: 'Editar', label: 'Aprovar com Ressalvas' },
        { value: 'Reprovar', label: 'Reprovar na CPG' },
        { value: 'Pautar', label: 'Colocar em Pauta (Reuniao)' },
      )
    }

    // Accountability actions
    if (s === 'Aprovado na CPG' || s === FINANCIAL_STATUS.APPROVED_CG) {
      actions.push({ value: 'SolicitarPrestacao', label: 'Solicitar Prestacao de Contas' })
    }

    if (s === FINANCIAL_STATUS.WAITING_CHECK) {
      actions.push(
        { value: 'AprovarPrestacao', label: 'Aprovar Prestacao de Contas' },
        { value: 'ReprovarPrestacao', label: 'Reprovar Prestacao (Solicitar Ajustes)' },
      )
    }

    // Deposit confirmation
    if (s === FINANCIAL_STATUS.WAITING_DEPOSIT) {
      actions.push({ value: 'ConfirmarDeposito', label: 'Confirmar Deposito Financeiro' })
    }

    // Undo is always available (if there's history)
    if (request.historicoAprovacao && request.historicoAprovacao.length > 1) {
      actions.push({ value: 'Desfazer', label: 'Desfazer Ultima Acao' })
    }

    return actions.length > 0
      ? actions
      : [
          { value: 'Aprovar', label: 'Aprovar na CPG' },
          { value: 'Editar', label: 'Aprovar com Ressalvas' },
          { value: 'Reprovar', label: 'Reprovar na CPG' },
        ]
  }

  // Check if this is an ad-referendum action
  const isAdReferendum = (): boolean => {
    if (currentRole !== 'Coordenacao') return false
    if (!meeting?.dataReuniao) return false
    const meetingDate = typeof meeting.dataReuniao === 'object' && 'toDate' in meeting.dataReuniao
      ? meeting.dataReuniao.toDate()
      : new Date(meeting.dataReuniao as any)
    const today = new Date()
    return today < meetingDate
  }

  const formatMeetingDate = () => {
    if (!meeting?.dataReuniao) return ''
    if (typeof meeting.dataReuniao === 'object' && 'toDate' in meeting.dataReuniao) {
      return meeting.dataReuniao.toDate().toLocaleDateString('pt-BR')
    }
    return new Date(meeting.dataReuniao as any).toLocaleDateString('pt-BR')
  }

  const handleSubmit = async () => {
    if (!request || !userProfile) return

    // Validate justification for rejections
    if ((action === 'Reprovar' || action === 'ReprovarPrestacao') && !justification.trim()) {
      toast.error('Justificativa obrigatoria para reprovacao.')
      return
    }

    setSubmitting(true)

    try {
      // Handle Undo separately
      if (action === 'Desfazer') {
        const previousStatus = await undoAction.mutateAsync({
          id: request.id,
          actor: userProfile.email,
        })
        toast.success(`Acao desfeita. Status revertido para: ${previousStatus}`)
        resetAndClose()
        return
      }

      let newStatus = ''
      const adRef = isAdReferendum()

      switch (action) {
        case 'Aprovar':
          newStatus = adRef
            ? 'Aprovado ad referendum pela Coordenacao'
            : 'Aprovado na CPG'
          break
        case 'Editar':
          newStatus = 'Aprovado com Ressalvas'
          break
        case 'Reprovar':
          newStatus = 'Reprovado na CPG'
          break
        case 'Pautar':
          newStatus = FINANCIAL_STATUS.IN_MEETING
          break
        case 'SolicitarPrestacao':
          newStatus = FINANCIAL_STATUS.ACCOUNTABILITY_REQUESTED
          break
        case 'AprovarPrestacao':
          newStatus = FINANCIAL_STATUS.WAITING_DEPOSIT
          break
        case 'ReprovarPrestacao':
          newStatus = FINANCIAL_STATUS.ACCOUNTABILITY_REQUESTED
          break
        case 'ConfirmarDeposito':
          newStatus = FINANCIAL_STATUS.COMPLETED
          break
      }

      const comment = [justification, additionalInfo].filter(Boolean).join(' | ')

      await updateStatus.mutateAsync({
        id: request.id,
        status: newStatus,
        actor: userProfile.email,
        comment,
        observation: ataObservation || undefined,
      })

      if (adRef) {
        toast.success(`Acao ad referendum pela Coordenacao: ${newStatus}`)
      } else {
        toast.success(`Solicitacao: ${newStatus}`)
      }

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
    setDepositReceipt('')
    onClose()
  }

  if (!request) return null

  const availableActions = getAvailableActions()
  const isFinancialAction = action === 'AprovarPrestacao' || action === 'ReprovarPrestacao' || action === 'ConfirmarDeposito' || action === 'SolicitarPrestacao'
  const isUndo = action === 'Desfazer'
  const adRef = isAdReferendum()

  return (
    <Modal open={open} onClose={resetAndClose} title="Acao da Secretaria / Coordenacao" size="md">
      <div className="space-y-4">
        {/* Request summary */}
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <strong>{request.tipoSolicitacao}</strong>
          <br />
          <span className="text-gray-500">Solicitante: {request.nomeAluno || '-'}</span>
          <br />
          <span className="text-gray-500">Status atual: {request.status}</span>
        </div>

        {/* Ad-referendum warning */}
        {adRef && !isUndo && (
          <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
            <strong>Ad referendum:</strong> A reuniao ainda nao ocorreu ({formatMeetingDate()}).
            Esta acao sera registrada como &quot;ad referendum pela Coordenacao&quot;.
          </div>
        )}

        {/* Action selector */}
        <SelectField
          label="Acao"
          id="action-select"
          options={availableActions}
          value={action}
          onChange={(e) => setAction(e.target.value as Action)}
          required
        />

        {/* Undo confirmation */}
        {isUndo && (
          <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            Esta acao ira reverter para o status anterior.
            Ultima acao: <strong>{request.historicoAprovacao?.at(-1)?.action || '-'}</strong>
          </div>
        )}

        {/* Justification */}
        {!isUndo && (
          <TextareaField
            label={action === 'Reprovar' || action === 'ReprovarPrestacao' ? 'Justificativa (obrigatoria)' : 'Justificativa (opcional)'}
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            required={action === 'Reprovar' || action === 'ReprovarPrestacao'}
          />
        )}

        {/* Additional info and Ata observation for CPG actions */}
        {!isFinancialAction && !isUndo && (
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

        {/* Deposit receipt field */}
        {action === 'ConfirmarDeposito' && (
          <InputField
            label="Numero do comprovante de deposito"
            id="deposit-receipt"
            value={depositReceipt}
            onChange={(e) => setDepositReceipt(e.target.value)}
            helpText="Informe o numero do comprovante ou protocolo do deposito."
          />
        )}

        {/* Solicitar Prestacao info */}
        {action === 'SolicitarPrestacao' && (
          <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
            O aluno sera notificado para enviar a prestacao de contas com notas fiscais,
            recibos e dados bancarios para deposito.
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={action.includes('Reprovar') || isUndo ? 'danger' : 'primary'}
            onClick={handleSubmit}
            loading={submitting}
          >
            {isUndo
              ? 'Confirmar Desfazer'
              : action === 'ConfirmarDeposito'
                ? 'Confirmar Deposito'
                : action === 'SolicitarPrestacao'
                  ? 'Solicitar Prestacao'
                  : action.includes('Reprovar')
                    ? 'Confirmar Reprovacao'
                    : 'Confirmar Aprovacao'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
