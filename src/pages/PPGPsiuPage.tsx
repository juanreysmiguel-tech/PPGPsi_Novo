import { useState } from 'react'
import { searchQualis, type QualisResult } from '@/services/api'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, BookOpen } from 'lucide-react'

const ESTRATO_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'default'> = {
  A1: 'success',
  A2: 'success',
  A3: 'primary',
  A4: 'primary',
  B1: 'warning',
  B2: 'warning',
  B3: 'danger',
  B4: 'danger',
}

export function PPGPsiuPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QualisResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)
    try {
      const res = await searchQualis({ query: query.trim() })
      setResults(res.data.results)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          PPGPsiu - Busca Qualis
        </h1>
        <p className="text-gray-500">Consulte a classificacao Qualis dos periodicos.</p>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Digite o nome do periodico ou ISSN..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <Button variant="primary" onClick={handleSearch} loading={searching}>
              Buscar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {searched && !searching && results.length === 0 && (
        <EmptyState title="Nenhum resultado" description="Tente buscar com outro termo ou ISSN." />
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{results.length} resultado(s) encontrado(s)</p>
          {results.map((r, idx) => (
            <Card key={`${r.issn}-${idx}`}>
              <CardBody className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800">{r.titulo}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>ISSN: {r.issn}</span>
                    <span>Area: {r.areaAvaliacao}</span>
                  </div>
                </div>
                <Badge variant={ESTRATO_COLORS[r.estrato] ?? 'default'} className="text-base px-4 py-1">
                  {r.estrato}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
