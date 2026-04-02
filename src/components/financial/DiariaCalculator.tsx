import { useState, useMemo } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { SelectField, InputField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { DIARIA_VALUES, COUNTRY_GROUPS } from '@/config/constants'
import { formatCurrency } from '@/lib/utils'
import { useBCBExchangeRate } from '@/hooks/useBCBRate'

interface DiariaCalculatorProps {
  onCalculated?: (valor: number, descricao: string) => void
}

/**
 * Diaria auto-calculator. Replicates js.html:6130-6268 setupDiariaCalculation.
 *
 * IMPORTANT: For exterior, it is ONE single fixed daily based on country group,
 * converted by BCB rate. It does NOT multiply by number of days.
 * The original code at js.html:6236 has a bug.
 */
export function DiariaCalculator({ onCalculated }: DiariaCalculatorProps) {
  const [localizacao, setLocalizacao] = useState('')
  const [dias, setDias] = useState(1)
  const [grupoExterior, setGrupoExterior] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [showCountryModal, setShowCountryModal] = useState(false)

  // Auto-fetch BCB exchange rate
  const { rate: taxaCambio, loading: loadingRate, error: errorRate } = useBCBExchangeRate()

  const resultado = useMemo(() => {
    if (!localizacao) return null

    if (localizacao === 'São Paulo (Estado)') {
      const valorDia = DIARIA_VALUES.SP.perDay
      const teto = DIARIA_VALUES.SP.maxValue
      const valor = Math.min(valorDia * dias, teto)
      return {
        valor,
        descricao: `SP: R$ ${valorDia}/dia x ${dias} dia(s) = ${formatCurrency(valorDia * dias)} (teto: ${formatCurrency(teto)})`,
      }
    }

    if (localizacao === 'Outro Estado (Brasil)') {
      const valorDia = DIARIA_VALUES.OTHER_STATE.perDay
      const teto = DIARIA_VALUES.OTHER_STATE.maxValue
      const valor = Math.min(valorDia * dias, teto)
      return {
        valor,
        descricao: `Outro Estado: R$ ${valorDia}/dia x ${dias} dia(s) = ${formatCurrency(valorDia * dias)} (teto: ${formatCurrency(teto)})`,
      }
    }

    if (localizacao === 'Exterior') {
      // ONE single fixed daily based on country group, converted by BCB rate
      // Does NOT multiply by number of days
      if (!taxaCambio || loadingRate) return null // Wait for rate to load

      const group = COUNTRY_GROUPS[grupoExterior]
      const valorUSD = group.valueUSD
      const valor = valorUSD * taxaCambio
      return {
        valor,
        descricao: `Exterior Grupo ${grupoExterior}: US$ ${valorUSD} x ${taxaCambio.toFixed(4)} (taxa BCB) = ${formatCurrency(valor)} (diaria unica fixa)`,
      }
    }

    return null
  }, [localizacao, dias, grupoExterior, taxaCambio, loadingRate])

  return (
    <Card>
      <CardBody className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">Calculadora de Diarias</h4>

        <SelectField
          label="Localizacao"
          id="diaria-loc"
          options={['Selecione...', 'São Paulo (Estado)', 'Outro Estado (Brasil)', 'Exterior']}
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
        />

        {localizacao && localizacao !== 'Selecione...' && localizacao !== 'Exterior' && (
          <InputField
            label="Quantidade de dias"
            id="diaria-dias"
            type="number"
            min={1}
            value={String(dias)}
            onChange={(e) => setDias(Math.max(1, parseInt(e.target.value) || 1))}
          />
        )}

        {localizacao === 'Exterior' && (
          <>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <SelectField
                  label="Grupo de Pais"
                  id="diaria-grupo"
                  options={['A', 'B', 'C', 'D']}
                  value={grupoExterior}
                  onChange={(e) => setGrupoExterior(e.target.value as 'A' | 'B' | 'C' | 'D')}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCountryModal(true)} className="mb-4">
                Ver paises
              </Button>
            </div>

            {/* BCB Exchange Rate Display */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-700 mb-1">Taxa BCB PTAX (Automatica)</div>
              {loadingRate ? (
                <div className="text-sm text-blue-600">Carregando taxa BCB...</div>
              ) : errorRate ? (
                <div className="text-sm text-red-600">Erro ao buscar taxa: {errorRate}</div>
              ) : (
                <div className="text-2xl font-bold text-blue-900">
                  US$ 1,00 = R$ {taxaCambio?.toFixed(4)}
                </div>
              )}
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              Para o exterior e aplicada apenas UMA diaria fixa do grupo de paises (nao multiplica por dias).
            </p>
          </>
        )}

        {resultado && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-xs text-emerald-600 mb-1">{resultado.descricao}</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(resultado.valor)}</p>
            {onCalculated && (
              <Button
                variant="success"
                size="sm"
                className="mt-2"
                onClick={() => onCalculated(resultado.valor, resultado.descricao)}
              >
                Usar este valor
              </Button>
            )}
          </div>
        )}

        {/* Country group modal */}
        {showCountryModal && (
          <CountryGroupModal onClose={() => setShowCountryModal(false)} />
        )}
      </CardBody>
    </Card>
  )
}

function CountryGroupModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'A' | 'B' | 'C' | 'D'>('A')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Grupos de Paises (Diaria Exterior)</h3>
        </div>
        <div className="flex border-b border-gray-200">
          {(['A', 'B', 'C', 'D'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setTab(g)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === g ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grupo {g} (US$ {COUNTRY_GROUPS[g].valueUSD})
            </button>
          ))}
        </div>
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {COUNTRY_GROUPS[tab].countries.split(', ').map((country) => (
              <span key={country} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {country}
              </span>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  )
}
