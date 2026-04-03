/**
 * PublicationStats Component
 * Displays publication statistics with charts
 */

import { usePublicationStats } from '@/hooks/usePublications'
import { StatCard } from '@/components/ui/StatCard'
import { Loader2 } from 'lucide-react'

interface PublicationStatsProps {
  authorIds: string[]
  startYear: number
  endYear: number
}

export function PublicationStats({
  authorIds,
  startYear,
  endYear,
}: PublicationStatsProps) {
  const { data: stats, isLoading } = usePublicationStats(authorIds, startYear, endYear)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">Resumo de Produção</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            color="primary"
          />
          <StatCard
            label="Artigos"
            value={stats.byType.artigo || 0}
            color="secondary"
          />
          <StatCard
            label="Livros/Capítulos"
            value={(stats.byType.livro || 0) + (stats.byType.capitulo || 0)}
            color="secondary"
          />
          <StatCard
            label="Eventos"
            value={stats.byType.evento || 0}
            color="secondary"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-gray-900">Distribuição Qualis</h3>
        <div className="grid gap-2 rounded-lg border border-gray-200 bg-white p-6">
          {Object.entries(stats.byQualis || {}).map(([strata, count]) => (
            <div key={strata} className="flex justify-between">
              <span className="text-sm text-gray-600">{strata}</span>
              <span className="font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
