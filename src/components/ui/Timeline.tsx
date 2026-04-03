/**
 * Timeline Component
 * Visual timeline for student academic milestones
 */

import clsx from 'clsx'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export interface TimelineStep {
  id: string
  label: string
  date?: string
  status: 'completed' | 'current' | 'pending' | 'warning'
  description?: string
}

interface TimelineProps {
  steps: TimelineStep[]
  className?: string
}

const statusColors = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  current: 'bg-blue-100 text-blue-700 border-blue-300',
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  warning: 'bg-amber-100 text-amber-700 border-amber-300',
}

const statusIcons = {
  completed: <CheckCircle2 className="h-5 w-5" />,
  current: <Clock className="h-5 w-5" />,
  pending: <div className="h-5 w-5 rounded-full border-2 border-current" />,
  warning: <AlertCircle className="h-5 w-5" />,
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={clsx('relative', className)}>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex gap-6">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[20px] top-12 -bottom-6 w-0.5 bg-gray-200" />
            )}

            {/* Node */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  statusColors[step.status]
                )}
              >
                {statusIcons[step.status]}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-gray-900">{step.label}</h3>
              {step.date && (
                <p className="text-sm text-gray-500">{step.date}</p>
              )}
              {step.description && (
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
