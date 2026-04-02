import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'
import { RequestCard } from './RequestCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { isFinancialType } from '@/lib/statusUtils'
import type { Request } from '@/types'
import { BookOpen, DollarSign } from 'lucide-react'

interface RequestAccordionProps {
  requests: Request[]
  onRequestClick?: (request: Request) => void
  onNewFinancial?: () => void
}

/**
 * Accordion splitting requests into Academic (CPG) and Financial sections.
 * Replicates the student dashboard accordion from js.html:637-698.
 */
export function RequestAccordion({ requests, onRequestClick, onNewFinancial }: RequestAccordionProps) {
  const [openSection, setOpenSection] = useState<'academic' | 'financial' | null>(null)

  const academic = requests.filter((r) => !isFinancialType(r.tipoSolicitacao))
  const financial = requests.filter((r) => isFinancialType(r.tipoSolicitacao))

  const toggle = (section: 'academic' | 'financial') => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <div className="space-y-3">
      {/* Academic */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggle('academic')}
          className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-800">Solicitacoes Academicas (CPG)</h5>
            <p className="text-xs text-gray-500">Aproveitamento, coorientacao, banca...</p>
          </div>
          <Badge variant="primary">{academic.length}</Badge>
          <svg
            className={cn('h-4 w-4 text-gray-400 transition-transform', openSection === 'academic' && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'academic' && (
          <div className="bg-gray-50 px-4 pb-4 animate-fade-in">
            {academic.length === 0 ? (
              <EmptyState
                title="Nenhuma solicitacao academica"
                description="Suas solicitacoes ao CPG aparecerao aqui."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {academic.map((r) => (
                  <RequestCard key={r.id} request={r} onClick={onRequestClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financial */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggle('financial')}
          className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-800">Solicitacoes Financeiras</h5>
            <p className="text-xs text-gray-500">Auxilios, Verbas PROEX, Bolsas, reembolsos...</p>
          </div>
          <Badge variant="success">{financial.length}</Badge>
          <svg
            className={cn('h-4 w-4 text-gray-400 transition-transform', openSection === 'financial' && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'financial' && (
          <div className="bg-gray-50 px-4 pb-4 animate-fade-in">
            {onNewFinancial && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={onNewFinancial}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  + Novo Auxilio Financeiro
                </button>
              </div>
            )}
            {financial.length === 0 ? (
              <EmptyState
                title="Nenhuma solicitacao financeira"
                description="Seus pedidos de auxilio financeiro aparecerao aqui."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {financial.map((r) => (
                  <RequestCard key={r.id} request={r} onClick={onRequestClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
