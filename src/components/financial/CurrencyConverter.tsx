import { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { SelectField, InputField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { getExchangeRate } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface CurrencyConverterProps {
  onConverted?: (valorBRL: number, rate: number, currency: string) => void
}

/**
 * Currency converter using BCB PTAX API.
 * Replicates js.html:6274-6350 setupCurrencyLogic + code.gs:4821-4902 getBCBExchangeRate.
 */
export function CurrencyConverter({ onConverted }: CurrencyConverterProps) {
  const [currency, setCurrency] = useState('USD')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRate = async () => {
    setLoading(true)
    try {
      const result = await getExchangeRate({ currency: currency as 'USD' | 'EUR' | 'GBP', date })
      setRate(result.data.rate)
      toast.success(`Taxa ${currency}/BRL: ${result.data.rate.toFixed(4)} (ref: ${result.data.date})`)
    } catch (err) {
      toast.error('Erro ao buscar cotacao BCB. Tente outra data.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const convertedValue = rate && amount ? parseFloat(amount) * rate : null

  return (
    <Card>
      <CardBody className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">Conversao de Moeda (BCB PTAX)</h4>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Moeda"
            id="conv-currency"
            options={[
              { value: 'USD', label: 'Dolar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'GBP', label: 'Libra (GBP)' },
            ]}
            value={currency}
            onChange={(e) => { setCurrency(e.target.value); setRate(null) }}
          />
          <InputField
            label="Data de Referencia"
            id="conv-date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setRate(null) }}
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <InputField
              label={`Valor em ${currency}`}
              id="conv-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchRate} loading={loading} className="mb-4">
            <RefreshCw className="h-4 w-4" /> Buscar Taxa
          </Button>
        </div>

        {rate !== null && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
            <p className="text-blue-600">
              Taxa {currency}/BRL: <strong>{rate.toFixed(4)}</strong> (data ref: {date})
            </p>
            {convertedValue !== null && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {amount} {currency} x {rate.toFixed(4)} =
                </p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(convertedValue)}</p>
                {onConverted && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => onConverted(convertedValue, rate, currency)}
                  >
                    Usar este valor
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
