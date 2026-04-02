import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCreateRequest } from '@/hooks/useRequests'
import { uploadFile } from '@/services/storage'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InputField, TextareaField, SelectField } from '@/components/ui/FormField'
import { FileUpload, UploadProgressBar } from '@/components/ui/FileUpload'
import { cn } from '@/lib/cn'
import { toast } from 'sonner'
import { FINANCIAL_STATUS } from '@/config/constants'
import { GraduationCap, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import type { FileReference } from '@/types'

const STEPS = [
  { label: 'Dados da Defesa', key: 'dados' },
  { label: 'Banca Examinadora', key: 'banca' },
  { label: 'Documentos', key: 'docs' },
  { label: 'Revisao', key: 'review' },
]

interface UploadEntry {
  file: File
  label: string
  percent: number
}

/**
 * Multi-step defense scheduling wizard.
 * Replicates the defesa scheduling flow from the original system.
 * Submits to Firestore with tipoSolicitacao = "Defesa de Dissertacao/Tese"
 * and uploads files to Firebase Storage.
 */
export function DefesaPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()
  const createRequest = useCreateRequest()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 0 - Defense data
  const [titulo, setTitulo] = useState('')
  const [dataDefesa, setDataDefesa] = useState('')
  const [horaDefesa, setHoraDefesa] = useState('')
  const [local, setLocal] = useState('')
  const [nivel, setNivel] = useState(userProfile?.nivel ?? 'Mestrado')
  const [resumo, setResumo] = useState('')

  // Step 1 - Committee
  const [presidente, setPresidente] = useState('')
  const [membros, setMembros] = useState('')
  const [suplentes, setSuplentes] = useState('')

  // Step 2 - Files
  const [dissertacaoFile, setDissertacaoFile] = useState<File | null>(null)
  const [cartaOrientadorFile, setCartaOrientadorFile] = useState<File | null>(null)
  const [outrosFiles, setOutrosFiles] = useState<File[]>([])

  // Upload progress tracking
  const [uploads, setUploads] = useState<UploadEntry[]>([])

  const canNext = (() => {
    if (step === 0) return titulo && dataDefesa && local
    if (step === 1) return presidente
    if (step === 2) return !!dissertacaoFile
    return true
  })()

  const updateUploadProgress = (index: number, percent: number) => {
    setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, percent } : u)))
  }

  const handleSubmit = async () => {
    if (!userProfile) {
      toast.error('Voce precisa estar logado para enviar a solicitacao.')
      return
    }

    setSubmitting(true)

    try {
      // 1. Collect all files to upload
      const filesToUpload: { file: File; label: string }[] = []

      if (dissertacaoFile) {
        filesToUpload.push({ file: dissertacaoFile, label: 'Dissertacao/Tese' })
      }
      if (cartaOrientadorFile) {
        filesToUpload.push({ file: cartaOrientadorFile, label: 'Carta do Orientador' })
      }
      for (const f of outrosFiles) {
        filesToUpload.push({ file: f, label: `Documento: ${f.name}` })
      }

      // Initialize upload progress entries
      setUploads(filesToUpload.map(({ file, label }) => ({ file, label, percent: 0 })))

      // 2. Upload files to Firebase Storage
      const uploadedFiles: FileReference[] = []
      const tempId = `defesa_${userProfile.id}_${Date.now()}`

      for (let i = 0; i < filesToUpload.length; i++) {
        const { file, label } = filesToUpload[i]
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const storagePath = `requests/${tempId}/${safeName}`

        const url = await uploadFile(storagePath, file, (progress) => {
          updateUploadProgress(i, progress.percent)
        })

        uploadedFiles.push({
          name: label,
          path: storagePath,
          url,
          uploadedAt: new Date().toISOString(),
        })
      }

      // 3. Build the detalhes object with all form data
      const detalhes: Record<string, unknown> = {
        titulo,
        dataDefesa,
        horaDefesa,
        local,
        nivel,
        resumo,
        presidente,
        membros: membros
          .split('\n')
          .map((m) => m.trim())
          .filter(Boolean),
        suplentes: suplentes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      }

      // 4. Create the request in Firestore
      await createRequest.mutateAsync({
        idUsuario: userProfile.id,
        tipoSolicitacao: 'Defesa de Dissertacao/Tese',
        categoria: 'academic',
        detalhes,
        nomeAluno: userProfile.nome,
        emailOrientador: userProfile.emailOrientador ?? '',
        status: FINANCIAL_STATUS.PENDING_ADVISOR,
        arquivos: uploadedFiles,
      })

      toast.success('Solicitacao de defesa enviada com sucesso! A secretaria revisara os dados.')

      // Reset form
      setStep(0)
      setTitulo('')
      setDataDefesa('')
      setHoraDefesa('')
      setLocal('')
      setNivel(userProfile?.nivel ?? 'Mestrado')
      setResumo('')
      setPresidente('')
      setMembros('')
      setSuplentes('')
      setDissertacaoFile(null)
      setCartaOrientadorFile(null)
      setOutrosFiles([])
      setUploads([])

      // Navigate back to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Erro ao enviar solicitacao de defesa:', err)
      toast.error('Erro ao enviar solicitacao. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Agendamento de Defesa
        </h1>
        <p className="text-gray-500">Preencha os dados para solicitar o agendamento.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500',
              )}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 font-medium text-gray-500">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 flex-1 mx-2', i < step ? 'bg-emerald-500' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardBody className="space-y-4">
          {step === 0 && (
            <>
              <InputField label="Titulo do Trabalho" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Data da Defesa" id="data-defesa" type="date" value={dataDefesa} onChange={(e) => setDataDefesa(e.target.value)} required />
                <InputField label="Horario" id="hora-defesa" type="time" value={horaDefesa} onChange={(e) => setHoraDefesa(e.target.value)} />
              </div>
              <InputField label="Local (sala/link)" id="local" value={local} onChange={(e) => setLocal(e.target.value)} required />
              <SelectField
                label="Nivel"
                id="nivel"
                options={['Mestrado', 'Doutorado']}
                value={nivel}
                onChange={(e) => setNivel(e.target.value as 'Mestrado' | 'Doutorado')}
              />
              <TextareaField label="Resumo (opcional)" id="resumo" value={resumo} onChange={(e) => setResumo(e.target.value)} />
            </>
          )}

          {step === 1 && (
            <>
              <InputField label="Presidente da Banca" id="presidente" value={presidente} onChange={(e) => setPresidente(e.target.value)} required />
              <TextareaField label="Membros Titulares (um por linha)" id="membros" value={membros} onChange={(e) => setMembros(e.target.value)} helpText="Nome completo - Instituicao" />
              <TextareaField label="Membros Suplentes (um por linha)" id="suplentes" value={suplentes} onChange={(e) => setSuplentes(e.target.value)} />
            </>
          )}

          {step === 2 && (
            <>
              <FileUpload
                label="Versao final da tese/dissertacao (PDF)"
                accept=".pdf"
                onChange={(files) => setDissertacaoFile(files[0] ?? null)}
                required
              />
              <FileUpload
                label="Carta do orientador"
                accept=".pdf"
                onChange={(files) => setCartaOrientadorFile(files[0] ?? null)}
              />
              <FileUpload
                label="Outros documentos (opcional)"
                multiple
                onChange={(files) => setOutrosFiles(files)}
              />
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <h4 className="font-semibold text-gray-800">Revisao dos dados</h4>
              <ReviewRow label="Titulo" value={titulo} />
              <ReviewRow label="Data" value={`${dataDefesa} ${horaDefesa}`} />
              <ReviewRow label="Local" value={local} />
              <ReviewRow label="Nivel" value={nivel} />
              <ReviewRow label="Presidente" value={presidente} />
              <ReviewRow label="Membros" value={membros || '-'} />
              <ReviewRow label="Suplentes" value={suplentes || '-'} />
              <ReviewRow label="Resumo" value={resumo || '-'} />
              <ReviewRow
                label="Arquivos"
                value={[
                  dissertacaoFile?.name,
                  cartaOrientadorFile?.name,
                  ...outrosFiles.map((f) => f.name),
                ].filter(Boolean).join(', ') || 'Nenhum'}
              />

              {/* Upload progress indicators (shown during submission) */}
              {uploads.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-gray-800">Upload de arquivos</h4>
                  {uploads.map((u, i) => (
                    <UploadProgressBar key={i} fileName={u.label} percent={u.percent} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || submitting}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Proximo <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} loading={submitting} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Solicitacao'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-gray-500 min-w-[100px]">{label}:</span>
      <span className="text-gray-800 font-medium whitespace-pre-line">{value || '-'}</span>
    </div>
  )
}
