import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/FormField'
import { DynamicFormRenderer } from './DynamicFormRenderer'
import { getRequestTypesByCategory, CATEGORY_LABELS, REQUEST_CONFIG } from '@/config/requestTypes'
import { useCreateRequest } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { FINANCIAL_STATUS } from '@/config/constants'

interface NewRequestModalProps {
  open: boolean
  onClose: () => void
  defaultCategory?: 'academic' | 'financial' | 'administrative' | 'outro'
}

/**
 * Modal for creating a new request. Replicated from Forms.openNewRequestModal().
 * Shows type selector first, then renders DynamicFormRenderer for the selected type.
 */
export function NewRequestModal({ open, onClose, defaultCategory }: NewRequestModalProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm()
  const createRequest = useCreateRequest()
  const { userProfile } = useAuthStore()

  const grouped = getRequestTypesByCategory()

  const handleSubmit = methods.handleSubmit(async (formData) => {
    if (!selectedType || !userProfile) return

    setSubmitting(true)
    try {
      const config = REQUEST_CONFIG[selectedType]

      // Create request
      await createRequest.mutateAsync({
        idUsuario: userProfile.id,
        tipoSolicitacao: config.title,
        categoria: config.category,
        detalhes: formData,
        nomeAluno: userProfile.nome,
        emailOrientador: userProfile.emailOrientador ?? '',
        status: FINANCIAL_STATUS.PENDING_ADVISOR,
      })

      toast.success('Solicitacao criada com sucesso!')
      handleClose()
    } catch (err) {
      toast.error('Erro ao criar solicitacao. Tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  })

  const handleClose = () => {
    setSelectedType('')
    methods.reset()
    onClose()
  }

  // Build type options filtered by default category
  const typeOptions = (() => {
    const cats = defaultCategory ? [defaultCategory] : ['academic', 'financial', 'outro']
    const opts: { value: string; label: string }[] = [{ value: '', label: 'Selecione o tipo de solicitacao...' }]
    for (const cat of cats) {
      const items = grouped[cat] ?? []
      for (const item of items) {
        opts.push({ value: item.value, label: `${CATEGORY_LABELS[cat]} - ${item.label}` })
      }
    }
    return opts
  })()

  return (
    <Modal open={open} onClose={handleClose} title="Nova Solicitacao" size="lg">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <SelectField
            label="Tipo de Solicitacao"
            id="request-type"
            options={typeOptions}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              methods.reset()
            }}
            required
          />

          {/* Dynamic fields for selected type */}
          {selectedType && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-primary mb-3">
                  {REQUEST_CONFIG[selectedType]?.title}
                </h3>
                <DynamicFormRenderer requestType={selectedType} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" type="button" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" loading={submitting}>
                  Enviar Solicitacao
                </Button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </Modal>
  )
}
