import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { formatDate, truncate } from '@/lib/utils'
import { isFinancialType } from '@/lib/statusUtils'
import type { Request } from '@/types'
import { FileText, DollarSign, Clock } from 'lucide-react'

interface RequestCardProps {
  request: Request
  onClick?: (request: Request) => void
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const isFin = isFinancialType(request.tipoSolicitacao)

  return (
    <Card
      className="cursor-pointer hover:shadow-card-hover transition-all duration-200"
      onClick={() => onClick?.(request)}
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${isFin ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'}`}>
              {isFin ? <DollarSign className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 leading-tight">
                {truncate(request.tipoSolicitacao, 50)}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {request.nomeAluno || 'Solicitante'}
              </p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Stepper */}
        <ProgressStepper
          status={request.status}
          isFinancial={isFin}
          compact
        />

        {/* Footer info */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(request.dataCriacao)}
          </span>
          {request.idReuniao && (
            <span className="text-primary-500 font-medium">
              Reuniao vinculada
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
