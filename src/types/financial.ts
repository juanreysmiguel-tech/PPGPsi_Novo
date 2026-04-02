import type { Timestamp } from 'firebase/firestore'

export interface BankDetails {
  cpf: string
  banco: string
  agencia: string
  conta: string
  pix?: string
}

export interface FinancialRecord {
  id: string
  idSolicitacao: string
  valor: number
  rubrica: string
  descricao: string
  dataAutorizacao?: Timestamp
  comprovanteUrl?: string
  dadosBancarios?: BankDetails
  createdAt: Timestamp
}
