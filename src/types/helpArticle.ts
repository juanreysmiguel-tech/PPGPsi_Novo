import type { Timestamp } from 'firebase/firestore'

export interface HelpArticle {
  id: string
  titulo: string
  tipoSolicitacao?: string
  perfil?: string
  quandoUsar?: string
  passoAPasso?: string
  prazo?: string
  contato?: string
  faq?: string
  baseLegal?: string
  ordem?: number
  ativo?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
