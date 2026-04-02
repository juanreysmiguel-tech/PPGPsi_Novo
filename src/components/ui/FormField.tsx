import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------ */
/*  Shared label + error wrapper                                       */
/* ------------------------------------------------------------------ */

interface FieldWrapperProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  helpText?: string
  children: React.ReactNode
  className?: string
}

export function FieldWrapper({ label, htmlFor, required, error, helpText, children, className }: FieldWrapperProps) {
  return (
    <div className={cn('mb-4', className)}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Text / Number / Date Input                                         */
/* ------------------------------------------------------------------ */

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helpText, required, className, id, ...rest }, ref) => (
    <FieldWrapper label={label} htmlFor={id} required={required} error={error} helpText={helpText}>
      <input
        ref={ref}
        id={id}
        required={required}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
          'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          rest.readOnly && 'cursor-not-allowed bg-gray-100',
          className,
        )}
        {...rest}
      />
    </FieldWrapper>
  ),
)
InputField.displayName = 'InputField'

/* ------------------------------------------------------------------ */
/*  Textarea                                                           */
/* ------------------------------------------------------------------ */

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helpText?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helpText, required, className, id, ...rest }, ref) => (
    <FieldWrapper label={label} htmlFor={id} required={required} error={error} helpText={helpText}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        rows={4}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors resize-y',
          'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          className,
        )}
        {...rest}
      />
    </FieldWrapper>
  ),
)
TextareaField.displayName = 'TextareaField'

/* ------------------------------------------------------------------ */
/*  Select                                                             */
/* ------------------------------------------------------------------ */

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[] | string[]
  error?: string
  helpText?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, helpText, required, className, id, ...rest }, ref) => (
    <FieldWrapper label={label} htmlFor={id} required={required} error={error} helpText={helpText}>
      <select
        ref={ref}
        id={id}
        required={required}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
          'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          className,
        )}
        {...rest}
      >
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          const lbl = typeof opt === 'string' ? opt : opt.label
          return <option key={value} value={value}>{lbl}</option>
        })}
      </select>
    </FieldWrapper>
  ),
)
SelectField.displayName = 'SelectField'

/* ------------------------------------------------------------------ */
/*  Checkbox                                                           */
/* ------------------------------------------------------------------ */

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, className, id, ...rest }, ref) => (
    <div className={cn('mb-2 flex items-start gap-2', className)}>
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
        {...rest}
      />
      <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  ),
)
CheckboxField.displayName = 'CheckboxField'

/* ------------------------------------------------------------------ */
/*  Radio group                                                        */
/* ------------------------------------------------------------------ */

interface RadioGroupFieldProps {
  label: string
  name: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  error?: string
  helpText?: string
}

export function RadioGroupField({ label, name, options, value, onChange, required, error, helpText }: RadioGroupFieldProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText}>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange?.(opt)}
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary/20"
            />
            {opt}
          </label>
        ))}
      </div>
    </FieldWrapper>
  )
}
