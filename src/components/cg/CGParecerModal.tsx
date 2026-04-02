import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextareaField, InputField, SelectField } from '@/components/ui/FormField'
import { CAPESChecklist } from './CAPESChecklist'
import { useUpdateRequestStatus } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { Request } from '@/types'
import { FINANCIAL_STATUS } from '@/config/constants'

type CGAction = 'Aprovar' | 'Reprovar' | 'Elucidar'

interface CGParecerModalProps {
  open: boolean
  onClose: () => void
  request: Request | null
}

/**
 * CG Parecer Modal - Replicates submitCGAction from code.gs:2358-2514.
 * Allows CG members to approve (with optional value change), reject, or request clarification.
 * Includes CAPES evaluation checklist.
 */
export function CGParecerModal({ open, onClose, request }: CGParecerModalProps) {
  const [action, setAction] = useState<CGAction>('Aprovar')
  const [justification, setJustification] = useState('')
  const [approvedValue, setApprovedValue] = useState('')
  const [capesValues, setCapesValues] = useState<Record<string, boolean | string>>({})
  const [submitting, setSubmitting] = useState(false)

  const updateStatus = useUpdateRequestStatus()
  const { userProfile, currentRole } = useAuthStore()

  const handleCapesChange = (key: string, value: boolean | string) => {
    setCapesValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!request || !userProfile) return

    if ((action === 'Reprovar' || action === 'Elucidar') && !justification.trim()) {
      toast.error('Justificativa obrigatoria para esta acao.')
      return
    }

    setSubmitting(true)
    try {
      let newStatus = ''
      switch (action) {
        case 'Aprovar':
          newStatus = FINANCIAL_STATUS.APPROVED_CG
          break
        case 'Reprovar':
          newStatus = FINANCIAL_STATUS.REJECTED
          break
        case 'Elucidar':
          newStatus = FINANCIAL_STATUS.PENDING_INFO
          break
      }

      const comment = [
        justification,
        approvedValue ? `Valor aprovado: R$ ${approvedValue}` : '',
      ].filter(Boolean).join(' | ')

      await updateStatus.mutateAsync({
        id: request.id,
        status: newStatus,
        actor: `${userProfile.nome} (${currentRole})`,
        comment,
      })

      toast.success(`Parecer registrado: ${action}`)
      resetAndClose()
    } catch (err) {
      toast.error('Erro ao processar parecer.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setAction('Aprovar')
    setJustification('')
    setApprovedValue('')
    setCapesValues({})
    onClose()
  }

  if (!request) return null

  const currentValue = String(
    request.detalhes?.['diaria-valor-calculado'] ?? request.detalhes?.['fin-valor-original'] ?? '',
  )

  return (
    <Modal open={open} onClose={resetAndClose} title="Parecer do Conselho de Gestao (CG)" size="lg">
      <div className="space-y-5">
        {/* Request summary */}
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <strong>{request.tipoSolicitacao}</strong>
          <br />
          <span className="text-gray-500">
            Solicitante: {request.nomeAluno || '-'} | Status: {request.status}
          </span>
          {currentValue.trim() !== '' && (
            <div className="mt-1 text-emerald-700 font-medium">
              Valor solicitado: R$ {currentValue}
            </div>
          )}
        </div>

        {/* Action select */}
        <SelectField
          label="Acao"
          id="cg-action"
          options={[
            { value: 'Aprovar', label: 'Aprovar' },
            { value: 'Reprovar', label: 'Reprovar / Indeferir' },
            { value: 'Elucidar', label: 'Solicitar Elucidacao (retornar para ajustes)' },
          ]}
          value={action}
          onChange={(e) => setAction(e.target.value as CGAction)}
        />

        {/* Approved value (only on approve) */}
        {action === 'Aprovar' && (
          <InputField
            label="Valor Aprovado (R$)"
            id="approved-value"
            type="number"
            step="0.01"
            value={approvedValue}
            onChange={(e) => setApprovedValue(e.target.value)}
            helpText="Deixe em branco para manter o valor solicitado. Preencha para aprovar com valor diferente."
          />
        )}

        {/* Justification */}
        <TextareaField
          label={action === 'Aprovar' ? 'Justificativa / Observacao (opcional)' : 'Justificativa (obrigatoria)'}
          id="cg-justification"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          required={action !== 'Aprovar'}
        />

        {/* CAPES checklist (CG evaluation) */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Avaliacao CAPES (CG)</h4>
          <CAPESChecklist
            values={capesValues}
            editable
            onChange={handleCapesChange}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={action === 'Reprovar' ? 'danger' : action === 'Elucidar' ? 'secondary' : 'success'}
            onClick={handleSubmit}
            loading={submitting}
          >
            {action === 'Aprovar' ? 'Aprovar' : action === 'Reprovar' ? 'Indeferir' : 'Solicitar Elucidacao'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
