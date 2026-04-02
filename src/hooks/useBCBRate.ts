import { useState, useEffect } from 'react'

/**
 * Hook para buscar taxa BCB PTAX USD/BRL
 *
 * IMPORTANTE: A API do BCB tem inconsistências ao retornar datas.
 * Usamos qualquer taxa que ela retorna, sem validar a data retornada.
 * Para data exata, use o conversor manual: https://www.bcb.gov.br/conversao
 */
export function useBCBExchangeRate(eventDate?: string) {
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventDate) {
      setRate(null)
      return
    }

    const fetchRate = async () => {
      setLoading(true)
      setError(null)
      setRate(null)

      try {
        // Parse da data do evento (formato ISO: YYYY-MM-DD)
        const eventDateObj = new Date(eventDate)
        if (isNaN(eventDateObj.getTime())) {
          throw new Error('Data do evento inválida')
        }

        // Tenta buscar a taxa do dia do evento, se não houver tenta dias anteriores
        let taxa: number | null = null
        let tentativas = 0
        const maxTentativas = 7

        while (!taxa && tentativas < maxTentativas) {
          const data = new Date(eventDateObj)
          data.setDate(data.getDate() + (1 - tentativas))

          // Formata a data como MM/DD/YYYY (conforme esperado pela API BCB)
          const dia = String(data.getDate()).padStart(2, '0')
          const mes = String(data.getMonth() + 1).padStart(2, '0')
          const ano = data.getFullYear()
          const dataFormatada = `${mes}/${dia}/${ano}`

          try {
            // API BCB PTAX - pega ÚLTIMA cotação do dia (fechamento)
            const response = await fetch(
              `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${dataFormatada}'&@dataFinalCotacao='${dataFormatada}'&$orderby=dataHoraCotacao%20asc&$top=1000&$format=json`,
            )

            if (response.ok) {
              const jsonData = await response.json()

              if (jsonData.value && jsonData.value.length > 0) {
                // A API BCB retorna uma única cotação oficial por dia
                const cotacao = jsonData.value[0]
                taxa = cotacao.cotacaoVenda
                const dataRetornada = cotacao.dataHoraCotacao
                if (taxa) {
                  console.log(`✓ [BCB] Taxa VENDA obtida: R$ ${taxa.toFixed(4)}`)
                  console.log(`  Data/Hora: ${dataRetornada}`)
                  console.log(`  Cotação completa:`, { venda: cotacao.cotacaoVenda, compra: cotacao.cotacaoCompra })
                }
                setRate(taxa)
                return
              }
            }
          } catch (e) {
            console.error(`✗ [BCB] Erro na tentativa ${tentativas + 1}:`, e)
          }

          tentativas++
        }

        // Se chegou aqui, não encontrou nada
        console.warn(`✗ [BCB] Nenhuma cotação encontrada nos últimos 7 dias`)
        throw new Error('Nenhuma cotação BCB disponível')
      } catch (err) {
        const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(mensagem)
        // Fallback: taxa padrão
        console.log(`⚠ [BCB Fallback] Usando taxa padrão: R$ 5.0000`)
        setRate(5.0)
      } finally {
        setLoading(false)
      }
    }

    fetchRate()
  }, [eventDate])

  return { rate, loading, error }
}
