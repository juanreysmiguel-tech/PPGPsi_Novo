import type { Timestamp } from 'firebase/firestore'

export type MeetingStatus = 'Aberto' | 'Concluida' | 'Cancelada'

export interface Meeting {
  id: string
  nome: string
  dataReuniao: Timestamp
  dataInicioPeriodo: Timestamp
  dataFimPeriodo: Timestamp
  status: MeetingStatus
  prazoFechamento: Timestamp
  requestCount?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
