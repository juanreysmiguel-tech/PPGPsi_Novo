import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField, TextareaField, SelectField, CheckboxField } from '@/components/ui/FormField'
import { FileUpload } from '@/components/ui/FileUpload'
import { useUpdateRequestStatus } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { uploadFile } from '@/services/storage'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { toast } from 'sonner'
import { FINANCIAL_STATUS, ACCOUNTABILITY_CHECKLISTS, INVOICE_DATA_TEXT } from '@/config/constants'
import type { Request } from '@/types'

interface AccountabilityModalProps {
  open: boolean
  onClose: () => void
  request: Request | null
}

/**
 * Modal for student to submit accountability (Prestação de Contas).
 * Replicates openStudentAccountabilityModal + submitStudentAccountability from GAS.
 * Includes: checklist items, bank details, file uploads, invoice data.
 */
export function AccountabilityModal({ open, onClose, request }: AccountabilityModalProps) {
  const [checklistType, setChecklistType] = useState<'A' | 'B' | 'C' | 'D'>('B')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [observations, setObservations] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Bank details
  const [banco, setBanco] = useState('')
  const [agencia, setAgencia] = useState('')
  const [conta, setConta] = useState('')
  const [tipoConta, setTipoConta] = useState('Corrente')
  const [cpfTitular, setCpfTitular] = useState('')
  const [pixKey, setPixKey] = useState('')

  const updateStatus = useUpdateRequestStatus()
  const { userProfile } = useAuthStore()

  const checklist = ACCOUNTABILITY_CHECKLISTS[checklistType]

  const handleToggleItem = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  const handleSubmit = async () => {
    if (!request || !userProfile) return

    // Validate bank details
    if (!banco.trim() || !agencia.trim() || !conta.trim() || !cpfTitular.trim()) {
      toast.error('Preencha todos os dados bancarios obrigatorios.')
      return
    }

    if (files.length === 0) {
      toast.error('Anexe pelo menos um documento comprobatorio.')
      return
    }

    setSubmitting(true)
    try {
      // Upload files
      const uploadedFiles = []
      for (const file of files) {
        const path = `requests/${request.id}/prestacao/${file.name}`
        const url = await uploadFile(path, file)
        uploadedFiles.push({ name: file.name, path, url, uploadedAt: new Date().toISOString() })
      }

      // Save accountability data to request
      const prestacaoData = {
        checklistType,
        checkedItems,
        observations,
        dadosBancarios: {
          banco,
          agencia,
          conta,
          tipoConta,
          cpfTitular,
          pixKey: pixKey || null,
        },
        arquivosPrestacao: uploadedFiles,
        dataPrestacao: new Date().toISOString(),
      }

      // Update Firestore document with accountability data
      const docRef = doc(db, 'requests', request.id)
      await updateDoc(docRef, {
        prestacaoContas: prestacaoData,
        updatedAt: serverTimestamp(),
      })

      // Update status to "Prestacao de Contas em Analise"
      await updateStatus.mutateAsync({
        id: request.id,
        status: FINANCIAL_STATUS.WAITING_CHECK,
        actor: userProfile.email,
        comment: `Prestacao de contas enviada (Checklist ${checklistType})`,
      })

      toast.success('Prestacao de contas enviada com sucesso!')
      handleClose()
    } catch (err) {
      toast.error('Erro ao enviar prestacao de contas.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setCheckedItems({})
    setObservations('')
    setFiles([])
    setBanco('')
    setAgencia('')
    setConta('')
    setTipoConta('Corrente')
    setCpfTitular('')
    setPixKey('')
    onClose()
  }

  if (!request) return null

  return (
    <Modal open={open} onClose={handleClose} title="Prestacao de Contas" size="lg">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Request summary */}
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <strong>{request.tipoSolicitacao}</strong>
          <span className="text-gray-500 ml-2">#{request.id.slice(0, 8)}</span>
        </div>

        {/* Invoice data alert */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">Dados para Nota Fiscal</h4>
          <pre className="text-xs text-amber-700 whitespace-pre-wrap font-mono">{INVOICE_DATA_TEXT}</pre>
        </div>

        {/* Checklist type selector */}
        <SelectField
          label="Tipo de Checklist"
          id="checklist-type"
          options={[
            { value: 'A', label: 'A. Servicos de Traducao, Revisao e Publicacao' },
            { value: 'B', label: 'B. Participacao em Eventos e Congressos' },
            { value: 'C', label: 'C. Diarias e Viagens' },
            { value: 'D', label: 'D. Material de Consumo e Laboratorio' },
          ]}
          value={checklistType}
          onChange={(e) => {
            setChecklistType(e.target.value as 'A' | 'B' | 'C' | 'D')
            setCheckedItems({})
          }}
        />

        {/* Checklist items */}
        <div className="rounded-lg border border-gray-200 p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{checklist.title}</h4>
          <div className="space-y-2">
            {checklist.items.map((item) => (
              <CheckboxField
                key={item}
                label={item}
                id={`check-${item}`}
                checked={!!checkedItems[item]}
                onChange={() => handleToggleItem(item)}
              />
            ))}
          </div>
        </div>

        {/* Bank details */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Dados Bancarios para Deposito</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Banco" id="banco" value={banco} onChange={(e) => setBanco(e.target.value)} required />
            <InputField label="Agencia" id="agencia" value={agencia} onChange={(e) => setAgencia(e.target.value)} required />
            <InputField label="Conta" id="conta" value={conta} onChange={(e) => setConta(e.target.value)} required />
            <SelectField
              label="Tipo de Conta"
              id="tipo-conta"
              options={[
                { value: 'Corrente', label: 'Corrente' },
                { value: 'Poupanca', label: 'Poupanca' },
              ]}
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
            />
            <InputField label="CPF do Titular" id="cpf" value={cpfTitular} onChange={(e) => setCpfTitular(e.target.value)} required />
            <InputField label="Chave PIX (opcional)" id="pix" value={pixKey} onChange={(e) => setPixKey(e.target.value)} helpText="CPF, email, telefone ou chave aleatoria" />
          </div>
        </div>

        {/* File upload */}
        <FileUpload
          label="Documentos Comprobatorios (notas fiscais, recibos, comprovantes)"
          required
          multiple
          onChange={(f) => setFiles(f)}
        />

        {/* Observations */}
        <TextareaField
          label="Observacoes (opcional)"
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          helpText="Informacoes adicionais sobre a prestacao de contas."
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Enviar Prestacao de Contas
          </Button>
        </div>
      </div>
    </Modal>
  )
}
