import { onCall, HttpsError } from 'firebase-functions/v2/https'

/**
 * BCB PTAX Exchange Rate API wrapper.
 * Replicates code.gs:4821-4902 getBCBExchangeRate.
 *
 * API: olinda.bcb.gov.br/olinda/servico/PTAX/...
 * Retry with up to 7 previous days if no quote for given date.
 */
export const getExchangeRate = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    const { currency, date } = request.data as { currency: 'USD' | 'EUR' | 'GBP'; date: string }

    if (!currency || !date) {
      throw new HttpsError('invalid-argument', 'Missing currency or date.')
    }

    const moedaMap: Record<string, string> = {
      USD: 'USD',
      EUR: 'EUR',
      GBP: 'GBP',
    }

    const moeda = moedaMap[currency]
    if (!moeda) {
      throw new HttpsError('invalid-argument', `Unsupported currency: ${currency}`)
    }

    // Try up to 7 days back
    const baseDate = new Date(date + 'T12:00:00')
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() - i)
      const formatted = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`

      const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moeda}'&@dataCotacao='${formatted}'&$top=1&$orderby=dataHoraCotacao%20desc&$format=json`

      try {
        const response = await fetch(url)
        if (!response.ok) continue

        const data = await response.json()
        const values = data?.value
        if (values && values.length > 0) {
          const rate = values[0].cotacaoVenda ?? values[0].cotacaoCompra
          if (rate) {
            return {
              rate: Number(rate),
              date: formatted,
              currency,
            }
          }
        }
      } catch {
        continue
      }
    }

    throw new HttpsError('not-found', `No exchange rate found for ${currency} within 7 days of ${date}.`)
  },
)
