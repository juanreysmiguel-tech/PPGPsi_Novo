import type { Timestamp } from 'firebase/firestore'

export interface BankDetails {
  cpf: string
  banco: string
  agencia: string
  conta: string
  pix?: string
}

export const FINANCIAL_STATUS = {
  PENDING_ADVISOR: 'Aguardando Avaliação do Orientador',
  PENDING_CG: 'Em Análise pela Comissão de Gestão (CG)',
  PENDING_INFO: 'Aguardando Elucidação (Retornado para Ajustes)',
  APPROVED_CG: 'Aprovado pela CG (Aguardando Trâmite da Secretaria)',
  IN_MEETING: 'Em Pauta (Reunião do Colegiado)',
  ACCOUNTABILITY_REQUESTED: 'Prestação de Contas Solicitada',
  WAITING_CHECK: 'Prestação de Contas em Análise',
  WAITING_DEPOSIT: 'Aguardando Depósito Financeiro',
  COMPLETED: 'Concluído / Arquivado',
  REJECTED: 'Indeferido / Recusado',
  DELETED: 'Excluído',
  UPDATED: 'Dados Atualizados'
} as const;

export type FinancialStatusKey = keyof typeof FINANCIAL_STATUS;

export interface FinancialRecord {
  id: string
  idSolicitacao: string
  valor: number
  rubrica: string
  descricao: string
  status: FinancialStatusKey
  dataAutorizacao?: Timestamp
  comprovanteUrl?: string
  dadosBancarios?: BankDetails
  createdAt: Timestamp
}
