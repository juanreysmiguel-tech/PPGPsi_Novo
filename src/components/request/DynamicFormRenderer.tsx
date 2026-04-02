import { useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { REQUEST_TYPES, type FormField } from '@/config/requestTypes'
import { InputField, TextareaField, SelectField, CheckboxField, RadioGroupField } from '@/components/ui/FormField'
import { FileUpload } from '@/components/ui/FileUpload'
import { CountryGroupSelector } from '@/components/financial/CountryGroupSelector'
import { useBCBExchangeRate } from '@/hooks/useBCBRate'
import { DIARIA_VALUES } from '@/config/constants'

/* ------------------------------------------------------------------ */
/*  DynamicFormRenderer                                                */
/*  Reads the RequestConfig for a given type and renders all fields    */
/*  using React Hook Form's Controller for controlled inputs.          */
/* ------------------------------------------------------------------ */

interface DynamicFormRendererProps {
  requestType: string
  /** Called when a file field receives files */
  onFileSelect?: (fieldLabel: string, files: File[]) => void
}

export function DynamicFormRenderer({ requestType, onFileSelect }: DynamicFormRendererProps) {
  const config = REQUEST_TYPES[requestType]
  const { watch, setValue } = useFormContext()

  if (!config) return <p className="text-red-500 text-sm">Tipo de solicitacao desconhecido: {requestType}</p>

  // Watch relevant fields for diaria calculation
  const dataInicio = watch('diaria-data-inicio')
  const dataFim = watch('diaria-data-fim')
  const localizacao = watch('diaria-localizacao')
  const grupoExterior = watch('diaria-grupo-display')

  // Fetch BCB rate for the event start date (only if exterior and has date)
  const { rate: taxaBCB, loading: loadingBCB } = useBCBExchangeRate(
    localizacao === 'Exterior' && dataInicio ? dataInicio : undefined
  )

  // Auto-calculate diaria value when dependencies change
  useEffect(() => {
    if (!config.hasDiariaCalculation || !localizacao || localizacao === 'Selecione...') {
      return
    }

    try {
      let valor = 0

      if (localizacao === 'São Paulo (Estado)') {
        const dias = dataInicio && dataFim ? calculateDays(dataInicio, dataFim) : 0
        const diasValidos = Math.min(dias, DIARIA_VALUES.SP.maxDays)
        valor = diasValidos * DIARIA_VALUES.SP.perDay
        valor = Math.min(valor, DIARIA_VALUES.SP.maxValue)
      } else if (localizacao === 'Outro Estado (Brasil)') {
        const dias = dataInicio && dataFim ? calculateDays(dataInicio, dataFim) : 0
        const diasValidos = Math.min(dias, DIARIA_VALUES.OTHER_STATE.maxDays)
        valor = diasValidos * DIARIA_VALUES.OTHER_STATE.perDay
        valor = Math.min(valor, DIARIA_VALUES.OTHER_STATE.maxValue)
      } else if (localizacao === 'Exterior') {
        // Exterior: always 1 fixed diaria, converted by BCB rate for the event start date
        if (taxaBCB && grupoExterior) {
          const COUNTRY_GROUPS: Record<string, number> = {
            A: 180,
            B: 260,
            C: 310,
            D: 370,
          }
          const valorUSD = COUNTRY_GROUPS[grupoExterior] || 180
          valor = valorUSD * taxaBCB
        }
      }

      if (valor > 0) {
        setValue('diaria-valor-calculado', valor.toFixed(2))
      }
    } catch (err) {
      console.error('Erro ao calcular diaria:', err)
    }
  }, [dataInicio, dataFim, localizacao, grupoExterior, taxaBCB, loadingBCB, config.hasDiariaCalculation, setValue])

  return (
    <div className="space-y-1">
      {config.fields.map((field, idx) => (
        <DynamicField
          key={field.id ?? `${field.label}-${idx}`}
          field={field}
          index={idx}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  )
}

/**
 * Calculate number of days between two dates
 */
function calculateDays(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays) // At least 1 day
  } catch {
    return 0
  }
}

/* ------------------------------------------------------------------ */
/*  Single field renderer                                              */
/* ------------------------------------------------------------------ */

interface DynamicFieldProps {
  field: FormField
  index: number
  onFileSelect?: (fieldLabel: string, files: File[]) => void
}

function DynamicField({ field, index, onFileSelect }: DynamicFieldProps) {
  const { control, watch, setValue } = useFormContext()
  const fieldName = field.id ?? `field_${index}`

  // Handle conditional visibility
  if (field.conditional && field.showWhen) {
    const controllerValue = watch(field.showWhen.field)
    if (controllerValue !== field.showWhen.value) return null
  }

  // Heading / Info (non-input)
  if (field.type === 'heading') {
    return (
      <h4 className="mt-6 mb-2 text-sm font-semibold text-primary border-b border-gray-200 pb-1">
        {field.label}
      </h4>
    )
  }
  if (field.type === 'info') {
    return (
      <p
        className="mb-3 text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100"
        dangerouslySetInnerHTML={{ __html: field.label }}
      />
    )
  }

  // File upload (uncontrolled — handled via callback)
  if (field.type === 'file') {
    return (
      <FileUpload
        label={field.label}
        required={field.required}
        multiple
        onChange={(files) => onFileSelect?.(field.label, files)}
      />
    )
  }

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue={false}
        render={({ field: f }) => (
          <CheckboxField
            label={field.label}
            id={fieldName}
            checked={f.value}
            onChange={f.onChange}
          />
        )}
      />
    )
  }

  // Radio group
  if (field.type === 'radio') {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        rules={{ required: field.required ? 'Obrigatorio' : undefined }}
        render={({ field: f, fieldState }) => (
          <RadioGroupField
            label={field.label}
            name={fieldName}
            options={field.options ?? []}
            value={f.value}
            onChange={f.onChange}
            required={field.required}
            error={fieldState.error?.message}
          />
        )}
      />
    )
  }

  // Select
  if (field.type === 'select') {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue={field.options?.[0] ?? ''}
        rules={{ required: field.required ? 'Obrigatorio' : undefined }}
        render={({ field: f, fieldState }) => (
          <SelectField
            label={field.label}
            id={fieldName}
            options={field.options ?? []}
            value={f.value}
            onChange={f.onChange}
            required={field.required}
            error={fieldState.error?.message}
          />
        )}
      />
    )
  }

  // Textarea
  if (field.type === 'textarea') {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        rules={{ required: field.required ? 'Obrigatorio' : undefined }}
        render={({ field: f, fieldState }) => (
          <TextareaField
            label={field.label}
            id={fieldName}
            value={f.value}
            onChange={f.onChange}
            required={field.required}
            error={fieldState.error?.message}
            helpText={field.helpText}
          />
        )}
      />
    )
  }

  // Country group selector (special case for exterior diaria)
  if (field.id === 'diaria-grupo-display') {
    const currentValue = watch(fieldName)
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
        <CountryGroupSelector
          selectedGroup={currentValue}
          onSelect={(group) => setValue(fieldName, group)}
        />
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
      </div>
    )
  }

  // Text / Number / Date (InputField)
  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue=""
      rules={{ required: field.required ? 'Obrigatorio' : undefined }}
      render={({ field: f, fieldState }) => (
        <InputField
          label={field.label}
          id={fieldName}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={f.value}
          onChange={f.onChange}
          required={field.required}
          readOnly={field.readonly}
          step={field.step}
          error={fieldState.error?.message}
          helpText={field.helpText}
        />
      )}
    />
  )
}
