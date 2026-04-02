import type { Timestamp } from 'firebase/firestore'

export interface Notification {
  id: string
  idUsuario: string
  tipo: string
  titulo: string
  mensagem: string
  data: Timestamp
  lido: boolean
  idSolicitacao?: string
}
