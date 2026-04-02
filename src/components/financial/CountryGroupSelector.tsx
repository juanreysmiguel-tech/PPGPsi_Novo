import { useState } from 'react'
import { COUNTRY_GROUPS } from '@/config/constants'
import { Button } from '@/components/ui/Button'

interface CountryGroupSelectorProps {
  onSelect: (group: 'A' | 'B' | 'C' | 'D') => void
  selectedGroup?: string
}

/**
 * Modal to view and select country groups for international daily allowances
 */
export function CountryGroupSelector({ onSelect, selectedGroup }: CountryGroupSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'A' | 'B' | 'C' | 'D'>('A')

  const handleSelect = (group: 'A' | 'B' | 'C' | 'D') => {
    onSelect(group)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full text-left"
      >
        {selectedGroup ? `Grupo ${selectedGroup}` : 'Selecionar grupo de país...'}
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Selecione o Grupo de País (Diária no Exterior)</h3>
              <p className="text-xs text-gray-500 mt-1">Cada grupo tem uma diária fixa diferente</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(['A', 'B', 'C', 'D'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setTab(g)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    tab === g ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Grupo {g}
                  <br />
                  <span className="text-xs font-normal">US$ {COUNTRY_GROUPS[g].valueUSD}</span>
                </button>
              ))}
            </div>

            {/* Countries list */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-2">
                {COUNTRY_GROUPS[tab].countries.split(', ').map((country) => (
                  <span key={country} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800 border border-blue-200">
                    {country}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer with selection button */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleSelect(tab)}>
                Selecionar Grupo {tab}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
