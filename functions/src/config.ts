export const UFSCAR_DOMAINS = ['@ufscar.br', '@estudante.ufscar.br']

export function isUFSCarEmail(email: string): boolean {
  const lower = email.toLowerCase().trim()
  return UFSCAR_DOMAINS.some((d) => lower.endsWith(d))
}

export const FINANCIAL_STATUS = {
  PENDING_ADVISOR: 'Aguardando Avaliacao do Orientador',
  PENDING_CG: 'Em Analise pela Comissao de Gestao (CG)',
  PENDING_INFO: 'Aguardando Elucidacao (Retornado para Ajustes)',
  APPROVED_CG: 'Aprovado pela CG (Aguardando Tramite da Secretaria)',
  IN_MEETING: 'Em Pauta (Reuniao do Colegiado)',
  ACCOUNTABILITY_REQUESTED: 'Prestacao de Contas Solicitada',
  WAITING_CHECK: 'Prestacao de Contas em Analise',
  WAITING_DEPOSIT: 'Aguardando Deposito Financeiro',
  COMPLETED: 'Concluido / Arquivado',
  REJECTED: 'Indeferido / Recusado',
  DELETED: 'Excluido',
  UPDATED: 'Dados Atualizados',
} as const

export const EMAIL_SECRETARIA = 'ppgpsi@ufscar.br'

/** Conta institucional: sempre todos os perfis nativos (espelha `ROLES` no app). */
export const ALL_NATIVE_ROLES: readonly string[] = [
  'Externo',
  'Discente',
  'Docente',
  'Secretaria',
  'Coordenacao',
  'CG',
]

export function isPpgpsiInstitutionalEmail(email: string): boolean {
  return email.toLowerCase().trim() === EMAIL_SECRETARIA.toLowerCase()
}

export function hasAllNativeRoles(roles: unknown): boolean {
  if (!Array.isArray(roles) || roles.length !== ALL_NATIVE_ROLES.length) return false
  const set = new Set(roles)
  return ALL_NATIVE_ROLES.every((r) => set.has(r))
}
