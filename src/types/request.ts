import type { Timestamp } from 'firebase/firestore'

export type RequestCategory = 'academic' | 'financial' | 'administrative' | 'outro'

export interface HistoryEntry {
  date: string
  action: string
  user: string
  justification?: string
}

export interface FileReference {
  name: string
  path: string
  url: string
  uploadedAt: string
}

export interface Request {
  id: string
  dataCriacao: Timestamp
  idUsuario: string
  tipoSolicitacao: string
  categoria: RequestCategory
  detalhes: Record<string, unknown>
  status: string
  historicoAprovacao: HistoryEntry[]
  comentarios?: string
  nomeOrientador?: string
  emailOrientador?: string
  idParecerista?: string
  idReuniao?: string
  nomeAluno: string
  arquivos: FileReference[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface RequestFormData {
  tipoSolicitacao: string
  categoria: RequestCategory
  detalhes: Record<string, unknown>
  arquivos?: File[]
}
