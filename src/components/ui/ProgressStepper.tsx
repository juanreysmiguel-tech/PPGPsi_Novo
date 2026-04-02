import { cn } from '@/lib/cn'
import { Send, UserCheck, ClipboardCheck, Users, CheckCircle, XCircle } from 'lucide-react'
import { getStatusStepIndex, isRejectedStatus } from '@/lib/statusUtils'

const ICONS = [Send, UserCheck, ClipboardCheck, Users, CheckCircle]

const ACADEMIC_STEPS = [
  { label: 'Enviado', key: 'enviado' },
  { label: 'Orientador', key: 'orientador' },
  { label: 'Secretaria', key: 'secretaria' },
  { label: 'CPG', key: 'cpg' },
  { label: 'Concluido', key: 'concluido' },
]

const FINANCIAL_STEPS = [
  { label: 'Enviado', key: 'enviado' },
  { label: 'Orientador', key: 'orientador' },
  { label: 'CG', key: 'cg' },
  { label: 'CPG', key: 'cpg' },
  { label: 'Concluido', key: 'concluido' },
]

interface ProgressStepperProps {
  status: string
  isFinancial?: boolean
  compact?: boolean
  className?: string
}

export function ProgressStepper({ status, isFinancial = false, compact = false, className }: ProgressStepperProps) {
  const steps = isFinancial ? FINANCIAL_STEPS : ACADEMIC_STEPS
  const currentStep = getStatusStepIndex(status)
  const rejected = isRejectedStatus(status)

  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4'
  const circleSize = compact ? 'w-6 h-6' : 'w-9 h-9'
  const labelSize = compact ? 'text-[8px]' : 'text-[10px]'
  const lineMargin = compact ? 'mt-[-10px]' : 'mt-[-16px]'

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, i) => {
        const Icon = rejected && i === currentStep ? XCircle : ICONS[i]
        const isActive = !rejected && i === currentStep
        const isCompleted = !rejected && i < currentStep
        const isRejected = rejected && i <= 1

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  circleSize,
                  'rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-success text-white',
                  isActive && 'bg-primary-500 text-white animate-pulse-soft',
                  isRejected && 'bg-danger text-white',
                  !isCompleted && !isActive && !isRejected && 'bg-gray-200 text-gray-400',
                )}
              >
                <Icon className={iconSize} />
              </div>
              {!compact && (
                <span
                  className={cn(
                    labelSize,
                    'mt-1 font-medium text-center',
                    (isCompleted || isActive) ? 'text-gray-700' : 'text-gray-400',
                    isRejected && 'text-danger',
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-1',
                  compact ? 'mx-0.5' : 'mx-2',
                  compact ? '' : lineMargin,
                  isCompleted ? 'bg-success' : 'bg-gray-200',
                  isRejected ? 'bg-danger' : '',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
