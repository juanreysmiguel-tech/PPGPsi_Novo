import { CAPES_FIELDS } from '@/config/requestTypes'
import type { FormField } from '@/config/requestTypes'

interface CAPESChecklistProps {
  /** Existing CAPES responses from request details */
  values?: Record<string, boolean | string>
  /** If true, renders as editable (CG evaluation mode) */
  editable?: boolean
  onChange?: (key: string, value: boolean | string) => void
}

/**
 * CAPES Evaluation Checklist - 13 checkboxes in 3 quesitos + justificativa.
 * Replicated from js.html:5148-5168 (CAPES_FIELDS).
 * Used in both the request form (student) and CG parecer (CG member).
 */
export function CAPESChecklist({ values = {}, editable = false, onChange }: CAPESChecklistProps) {
  return (
    <div className="space-y-2">
      {CAPES_FIELDS.map((field: any, idx: number) => {
        const key = field.id ?? `capes-${idx}`

        if (field.type === 'heading') {
          return (
            <h4 key={key} className="mt-4 mb-1 text-sm font-semibold text-primary border-b border-gray-200 pb-1">
              {field.label}
            </h4>
          )
        }

        if (field.type === 'info') {
          return (
            <p key={key} className="text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              {field.label}
            </p>
          )
        }

        if (field.type === 'checkbox') {
          const checked = !!values[key]
          return (
            <label key={key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                disabled={!editable}
                onChange={(e) => onChange?.(key, e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          )
        }

        if (field.type === 'textarea') {
          return (
            <div key={key} className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <textarea
                value={String(values[key] ?? '')}
                disabled={!editable}
                onChange={(e) => onChange?.(key, e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-gray-100"
                placeholder={field.helpText}
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

/**
 * Read-only display of CAPES responses (for detail modals).
 */
export function CAPESDisplay({ values }: { values: Record<string, boolean | string> }) {
  const checked = Object.entries(values)
    .filter(([k, v]) => k.startsWith('capes-q') && v === true)
  const justificativa = values['capes-justificativa']

  if (checked.length === 0 && !justificativa) {
    return <p className="text-sm text-gray-500">Nenhuma avaliacao CAPES preenchida.</p>
  }

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm space-y-1">
      {checked.map(([k]) => (
        <div key={k} className="flex items-center gap-2 text-blue-700">
          <span className="text-emerald-500">&#10003;</span>
          {formatCAPESLabel(k)}
        </div>
      ))}
      {justificativa && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-gray-700">
          <strong>Justificativa:</strong> {String(justificativa)}
        </div>
      )}
    </div>
  )
}

function formatCAPESLabel(key: string): string {
  const field = CAPES_FIELDS.find((f: FormField) => f.id === key)
  return field?.label ?? key
}
