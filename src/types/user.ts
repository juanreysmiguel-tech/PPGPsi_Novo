import type { Timestamp } from 'firebase/firestore'

export const ROLES = [
  'Externo',
  'Discente',
  'Docente',
  'Secretaria',
  'Coordenacao',
  'CG',
] as const

export type Role = (typeof ROLES)[number]

export interface User {
  id: string
  email: string
  nome: string
  roles: Role[]
  status: 'Ativo' | 'Inativo' | 'Suspenso'
  telefone?: string
  celular?: string
  endereco?: string
  emergenciaNome?: string
  emergenciaTel?: string
  fotoUrl?: string

  // Student-specific
  dataIngresso?: Timestamp
  creditosTotais?: number
  dataDefesa?: Timestamp
  dataQualificacao?: Timestamp
  dataIntegralizacao?: Timestamp
  nomeOrientador?: string
  emailOrientador?: string
  nivel?: 'Mestrado' | 'Doutorado'
  creditosOptativas?: number
  creditosObrigatorias?: number
  dataDefesaRealizada?: Timestamp
  cpf?: string
  rg?: string
  rgOrgao?: string
  rgDataEmissao?: Timestamp
  dataNascimento?: Timestamp
  sexo?: string
  raca?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  prazoAcesso?: Timestamp

  // Faculty-specific
  docenteCredenciamentoReuniao?: string
  docenteCategoria?: string
  docentePodeOrientar?: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserProfile extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: Date
  updatedAt: Date
}
