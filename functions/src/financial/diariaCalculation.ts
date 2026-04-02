import { onCall, HttpsError } from 'firebase-functions/v2/https'

/**
 * Diaria calculation Cloud Function.
 * Replicates js.html:6130-6268 setupDiariaCalculation.
 *
 * IMPORTANT: For exterior, it is ONE single fixed daily based on country group,
 * converted by BCB rate. Does NOT multiply by number of days.
 */

const DIARIA_SP = { perDay: 380, max: 760 }       // >=2 dias -> teto 760
const DIARIA_OTHER = { perDay: 380, max: 1140 }    // >=3 dias -> teto 1140
const DIARIA_EXTERIOR: Record<string, number> = {
  A: 180,
  B: 260,
  C: 310,
  D: 370,
}

export const calculateDiaria = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    const { localizacao, dias, grupoExterior, taxaCambio } = request.data as {
      localizacao: string
      dias: number
      grupoExterior?: string
      taxaCambio?: number
    }

    if (!localizacao) {
      throw new HttpsError('invalid-argument', 'Missing localizacao.')
    }

    if (localizacao === 'São Paulo (Estado)') {
      const valor = Math.min(DIARIA_SP.perDay * dias, DIARIA_SP.max)
      return {
        valor,
        descricao: `SP: R$ ${DIARIA_SP.perDay}/dia x ${dias} dia(s), teto R$ ${DIARIA_SP.max}`,
      }
    }

    if (localizacao === 'Outro Estado (Brasil)') {
      const valor = Math.min(DIARIA_OTHER.perDay * dias, DIARIA_OTHER.max)
      return {
        valor,
        descricao: `Outro Estado: R$ ${DIARIA_OTHER.perDay}/dia x ${dias} dia(s), teto R$ ${DIARIA_OTHER.max}`,
      }
    }

    if (localizacao === 'Exterior') {
      if (!grupoExterior || !taxaCambio) {
        throw new HttpsError('invalid-argument', 'Missing grupoExterior or taxaCambio for exterior.')
      }
      const usd = DIARIA_EXTERIOR[grupoExterior]
      if (!usd) {
        throw new HttpsError('invalid-argument', `Invalid grupo: ${grupoExterior}`)
      }
      // ONE single fixed daily, NOT multiplied by days
      const valor = usd * taxaCambio
      return {
        valor,
        descricao: `Exterior Grupo ${grupoExterior}: US$ ${usd} x ${taxaCambio.toFixed(4)} (taxa BCB) = diaria unica fixa`,
      }
    }

    throw new HttpsError('invalid-argument', `Invalid localizacao: ${localizacao}`)
  },
)
