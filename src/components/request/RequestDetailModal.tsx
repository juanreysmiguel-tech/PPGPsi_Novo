import { Modal } from '@/components/ui/Modal'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { RequestTimeline } from './RequestTimeline'
import { Button } from '@/components/ui/Button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { isFinancialType } from '@/lib/statusUtils'
import type { Request } from '@/types'
import { FileText, Download, Calendar, User, Clock } from 'lucide-react'

interface RequestDetailModalProps {
  open: boolean
  onClose: () => void
  request: Request | null
  /** Actions available for the current user role */
  actions?: {
    label: string
    variant: 'primary' | 'success' | 'danger' | 'outline'
    onClick: () => void
  }[]
}

/**
 * Detailed view of a request. Replicated from Forms.openRequestDetailModal().
 * Shows profile info, stepper, details, files, and approval timeline.
 */
export function RequestDetailModal({ open, onClose, request, actions }: RequestDetailModalProps) {
  if (!request) return null

  const isFin = isFinancialType(request.tipoSolicitacao)
  const detalhes = request.detalhes ?? {}
  const diariaCalculado = detalhes['diaria-valor-calculado']
  const showDiariaValor =
    isFin && diariaCalculado != null && String(diariaCalculado).trim() !== ''

  return (
    <Modal open={open} onClose={onClose} title={request.tipoSolicitacao} size="lg">
      <div className="space-y-6">
        {/* Header with status */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={isFin ? 'success' : 'primary'}>
              {isFin ? 'Financeiro' : 'Academico'}
            </Badge>
            <StatusBadge status={request.status} />
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Criado em {formatDate(request.dataCriacao)}
          </span>
        </div>

        {/* Progress stepper */}
        <ProgressStepper status={request.status} isFinancial={isFin} />

        {/* Request info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg bg-gray-50 p-4">
          <InfoItem icon={<User className="h-4 w-4" />} label="Solicitante" value={request.nomeAluno || '-'} />
          <InfoItem icon={<FileText className="h-4 w-4" />} label="Tipo" value={request.tipoSolicitacao} />
          <InfoItem icon={<Calendar className="h-4 w-4" />} label="Reuniao" value={request.idReuniao || 'Nao vinculado'} />
          {showDiariaValor ? (
            <InfoItem
              icon={<FileText className="h-4 w-4" />}
              label="Valor"
              value={formatCurrency(Number(diariaCalculado) || 0)}
            />
          ) : null}
        </div>

        {/* Detail fields */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalhes da Solicitacao</h4>
          <div className="space-y-2">
            {Object.entries(detalhes).map(([key, value]) => {
              if (!value || key.startsWith('capes-q') || key === 'capes-justificativa') return null
              return (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="text-gray-500 min-w-[140px] shrink-0">{formatFieldLabel(key)}:</span>
                  <span className="text-gray-800">{String(value)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CAPES checklist if financial */}
        {isFin &&
        detalhes['capes-justificativa'] != null &&
        String(detalhes['capes-justificativa']).trim() !== '' ? (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Diretrizes CAPES</h4>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm">
              {Object.entries(detalhes)
                .filter(([k, v]) => k.startsWith('capes-q') && v === true)
                .map(([k]) => (
                  <div key={k} className="flex items-center gap-2 text-blue-700 mb-1">
                    <span className="text-emerald-500">&#10003;</span>
                    {formatFieldLabel(k)}
                  </div>
                ))}
              <div className="mt-2 pt-2 border-t border-blue-200 text-gray-700">
                <strong>Justificativa:</strong> {String(detalhes['capes-justificativa'])}
              </div>
            </div>
          </div>
        ) : null}

        {/* Attached files */}
        {request.arquivos && request.arquivos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Anexos</h4>
            <div className="space-y-1">
              {request.arquivos.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-primary-600 hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {file.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Historico de Aprovacao</h4>
          <RequestTimeline history={request.historicoAprovacao ?? []} />
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {actions.map((action, idx) => (
              <Button key={idx} variant={action.variant} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* Helpers */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  )
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/^field \d+$/, '')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim()
}
