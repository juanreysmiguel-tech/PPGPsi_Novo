import { STATUS_COLORS, REQUEST_STEPS } from '@/config/constants'

/**
 * Returns Tailwind color classes for a given status string.
 */
export function getStatusColor(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }
}

/**
 * Maps a status string to a step index (0-4) for the progress stepper.
 * Replicated from the original ProgressStepper logic.
 */
export function getStatusStepIndex(status: string): number {
  const s = status.toLowerCase()
  if (s.includes('concluido') || s.includes('arquivado')) return 4
  if (s.includes('cpg') || s.includes('pauta') || s.includes('reuniao') || s.includes('deposito')) return 3
  if (s.includes('cg') || s.includes('secretaria') || s.includes('prestacao') || s.includes('aprovado pela cg')) return 2
  if (s.includes('orientador')) return 1
  if (s.includes('indeferido') || s.includes('recusado') || s.includes('reprovado')) return -1 // rejected
  return 0
}

/**
 * Checks if a status indicates rejection/denial.
 */
export function isRejectedStatus(status: string): boolean {
  return getStatusStepIndex(status) === -1
}

/**
 * Checks if a request type is financial.
 */
export function isFinancialType(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t.includes('auxilio') || t.includes('reembolso') || t.includes('fin_') || t.includes('financeiro')
}

/**
 * Returns the step labels.
 */
export function getRequestSteps() {
  return REQUEST_STEPS
}

/**
 * Returns days-based urgency level.
 */
export function getUrgencyLevel(daysLeft: number): 'critical' | 'warning' | 'normal' {
  if (daysLeft < 3) return 'critical'
  if (daysLeft < 7) return 'warning'
  return 'normal'
}
