import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

interface FileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  required?: boolean
  error?: string
  helpText?: string
  onChange: (files: File[]) => void
  disabled?: boolean
  className?: string
}

export function FileUpload({
  label, accept, multiple = false, required, error, helpText,
  onChange, disabled, className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    setFileNames(arr.map((f) => f.name))
    onChange(arr)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <div className={cn('mb-4', className)}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:border-gray-400',
          error && 'border-red-300 bg-red-50',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
        </svg>
        <p className="text-sm text-gray-600">
          Arraste arquivos ou <span className="font-medium text-primary">clique para selecionar</span>
        </p>
        {fileNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {fileNames.map((name) => (
              <span key={name} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Upload progress bar                                                */
/* ------------------------------------------------------------------ */

interface UploadProgressBarProps {
  fileName: string
  percent: number
}

export function UploadProgressBar({ fileName, percent }: UploadProgressBarProps) {
  return (
    <div className="mb-2 rounded-lg bg-gray-50 p-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="truncate font-medium text-gray-700">{fileName}</span>
        <span className="text-gray-500">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
