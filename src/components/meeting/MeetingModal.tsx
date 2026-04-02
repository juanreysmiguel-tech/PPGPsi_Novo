import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField, SelectField } from '@/components/ui/FormField'
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeetings'
import { toast } from 'sonner'
import type { Meeting, MeetingStatus } from '@/types'

interface MeetingModalProps {
  open: boolean
  onClose: () => void
  meeting?: Meeting | null
}

export function MeetingModal({ open, onClose, meeting }: MeetingModalProps) {
  const isEdit = !!meeting
  const [nome, setNome] = useState(meeting?.nome ?? '')
  const [dataReuniao, setDataReuniao] = useState(meeting ? toDateStr(meeting.dataReuniao) : '')
  const [dataInicio, setDataInicio] = useState(meeting ? toDateStr(meeting.dataInicioPeriodo) : '')
  const [dataFim, setDataFim] = useState(meeting ? toDateStr(meeting.dataFimPeriodo) : '')
  const [prazo, setPrazo] = useState(meeting ? toDateStr(meeting.prazoFechamento) : '')
  const [status, setStatus] = useState<MeetingStatus>(meeting?.status ?? 'Aberto')
  const [submitting, setSubmitting] = useState(false)

  const createMeeting = useCreateMeeting()
  const updateMeeting = useUpdateMeeting()

  const handleSubmit = async () => {
    if (!nome || !dataReuniao || !dataInicio || !dataFim || !prazo) {
      toast.error('Preencha todos os campos.')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit && meeting) {
        await updateMeeting.mutateAsync({
          id: meeting.id,
          data: {
            nome,
            dataReuniao: new Date(dataReuniao),
            dataInicioPeriodo: new Date(dataInicio),
            dataFimPeriodo: new Date(dataFim),
            prazoFechamento: new Date(prazo),
            status,
          },
        })
        toast.success('Reuniao atualizada.')
      } else {
        await createMeeting.mutateAsync({
          nome,
          dataReuniao: new Date(dataReuniao),
          dataInicioPeriodo: new Date(dataInicio),
          dataFimPeriodo: new Date(dataFim),
          prazoFechamento: new Date(prazo),
        })
        toast.success('Reuniao criada.')
      }
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar reuniao.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Reuniao' : 'Nova Reuniao'} size="md">
      <div className="space-y-4">
        <InputField label="Nome da Reuniao" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <InputField label="Data da Reuniao" id="dataReuniao" type="date" value={dataReuniao} onChange={(e) => setDataReuniao(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Inicio do Periodo" id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
          <InputField label="Fim do Periodo" id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
        </div>
        <InputField label="Prazo de Fechamento" id="prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} required />

        {isEdit && (
          <SelectField
            label="Status"
            id="status"
            options={['Aberto', 'Fechado', 'Cancelado']}
            value={status}
            onChange={(e) => setStatus(e.target.value as MeetingStatus)}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Salvar' : 'Criar Reuniao'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function toDateStr(ts: unknown): string {
  try {
    const d = (ts as { toDate: () => Date }).toDate?.() ?? new Date(ts as string)
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}
