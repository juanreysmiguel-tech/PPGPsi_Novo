import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { uploadFile } from '@/services/storage'
import { importProPGWebCsv } from '@/services/api'
import { toast } from 'sonner'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface CSVImportModalProps {
  open: boolean
  onClose: () => void
}

export function CSVImportModal({ open, onClose }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)

    try {
      // Upload CSV to storage
      const url = await uploadFile(`imports/propgweb_${Date.now()}.csv`, file)

      // Call Cloud Function to process
      const res = await importProPGWebCsv({ csvUrl: url })
      setResult(res.data)

      if (res.data.errors.length === 0) {
        toast.success(`${res.data.imported} registros importados com sucesso!`)
      } else {
        toast.warning(`${res.data.imported} importados, ${res.data.errors.length} erros.`)
      }
    } catch (err) {
      toast.error('Erro na importacao.')
      console.error(err)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Importar CSV ProPGWeb" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecione o arquivo CSV exportado do ProPGWeb para atualizar o cadastro de alunos.
        </p>

        <FileUpload
          label="Arquivo CSV"
          accept=".csv"
          onChange={(files) => setFile(files[0] ?? null)}
        />

        {result && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle className="h-4 w-4" />
              {result.imported} registros importados
            </div>
            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  {result.errors.length} erros:
                </div>
                <ul className="list-disc list-inside text-xs text-red-500 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose}>Fechar</Button>
          <Button variant="primary" onClick={handleImport} loading={importing} disabled={!file}>
            <Upload className="h-4 w-4" /> Importar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
