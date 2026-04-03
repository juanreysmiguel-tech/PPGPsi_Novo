/**
 * Lattes Import Diff Component
 * Shows diff between new Lattes data and existing profile publications
 * User can selectively merge changes
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Publication {
  title: string
  year: number
  venue: string
  type: 'artigo' | 'livro' | 'capitulo' | 'evento'
  doi?: string
}

interface LattesImportDiffProps {
  newPublications: Publication[]
  newOrcid?: string
  newLattesId?: string
  existingCount: number
  onMerge: (selected: Publication[]) => Promise<void>
  onCancel: () => void
}

const typeLabels: Record<string, string> = {
  artigo: '📄 Artigo',
  livro: '📚 Livro',
  capitulo: '📖 Capítulo',
  evento: '🎤 Evento',
}

export function LattesImportDiff({
  newPublications,
  newOrcid,
  newLattesId,
  existingCount,
  onMerge,
  onCancel,
}: LattesImportDiffProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(newPublications.map(p => p.title)))
  const [isMerging, setIsMerging] = useState(false)

  const handleToggle = (title: string) => {
    const newSet = new Set(selected)
    if (newSet.has(title)) {
      newSet.delete(title)
    } else {
      newSet.add(title)
    }
    setSelected(newSet)
  }

  const handleSelectAll = () => {
    if (selected.size === newPublications.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(newPublications.map(p => p.title)))
    }
  }

  const handleMerge = async () => {
    if (selected.size === 0) {
      toast.error('Selecione pelo menos uma publicação')
      return
    }

    setIsMerging(true)
    try {
      const toMerge = newPublications.filter(p => selected.has(p.title))
      await onMerge(toMerge)
      toast.success(`${toMerge.length} publicação(ões) importada(s)!`)
    } catch (error) {
      toast.error('Erro ao importar publicações')
      console.error(error)
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-blue-900">Resumo da Importação</h3>
          <div className="grid gap-4 text-sm text-blue-800 md:grid-cols-3">
            <div>
              <p className="font-medium">Publicações encontradas</p>
              <p className="text-lg font-bold">{newPublications.length}</p>
            </div>
            <div>
              <p className="font-medium">Publicações existentes</p>
              <p className="text-lg font-bold">{existingCount}</p>
            </div>
            <div>
              <p className="font-medium">Selecionadas</p>
              <p className="text-lg font-bold">{selected.size}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* IDs Update */}
      {(newOrcid || newLattesId) && (
        <Card className="border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">IDs Identificados</h4>
              <div className="mt-2 space-y-1 text-sm text-green-800">
                {newOrcid && <p>✓ ORCID: <code className="font-mono">{newOrcid}</code></p>}
                {newLattesId && <p>✓ ID Lattes: <code className="font-mono">{newLattesId}</code></p>}
              </div>
              <p className="mt-2 text-xs text-green-700">Estes serão atualizados automaticamente</p>
            </div>
          </div>
        </Card>
      )}

      {/* Publications List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Publicações Novas</h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-500 hover:underline"
          >
            {selected.size === newPublications.length ? 'Desselecionar todas' : 'Selecionar todas'}
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {newPublications.map(pub => (
            <Card
              key={pub.title}
              className={`cursor-pointer border-2 p-4 transition-all ${
                selected.has(pub.title)
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleToggle(pub.title)}
            >
              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selected.has(pub.title)}
                  onChange={() => handleToggle(pub.title)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 font-medium text-gray-900">{pub.title}</p>
                    <Badge>{typeLabels[pub.type]}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>{pub.year}</span>
                    <span>•</span>
                    <span className="italic">{pub.venue}</span>
                    {pub.doi && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:underline"
                        >
                          DOI: {pub.doi}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Warning */}
      {selected.size === 0 && newPublications.length > 0 && (
        <div className="flex gap-3 rounded border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Nenhuma publicação selecionada</p>
            <p className="mt-1">Selecione as publicações que deseja importar</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button onClick={onCancel} variant="secondary" disabled={isMerging} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleMerge} disabled={isMerging || selected.size === 0} className="flex-1">
          {isMerging ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            `Importar ${selected.size > 0 ? `(${selected.size})` : ''}`
          )}
        </Button>
      </div>
    </div>
  )
}
