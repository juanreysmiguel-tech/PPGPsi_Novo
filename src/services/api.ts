import { httpsCallable } from 'firebase/functions'
import { functions } from '@/config/firebase'

/* ------------------------------------------------------------------ */
/*  Cloud Functions callable wrappers                                  */
/*  Each wraps a 2nd-gen callable deployed in southamerica-east1       */
/* ------------------------------------------------------------------ */

/** Currency conversion via BCB PTAX API */
export interface ExchangeRateRequest {
  currency: 'USD' | 'EUR' | 'GBP'
  date: string // YYYY-MM-DD
}
export interface ExchangeRateResponse {
  rate: number
  date: string
  currency: string
}
export const getExchangeRate = httpsCallable<ExchangeRateRequest, ExchangeRateResponse>(
  functions, 'getExchangeRate',
)

/** Diaria calculation */
export interface DiariaRequest {
  localizacao: 'São Paulo (Estado)' | 'Outro Estado (Brasil)' | 'Exterior'
  dias: number
  grupoExterior?: 'A' | 'B' | 'C' | 'D'
  taxaCambio?: number
}
export interface DiariaResponse {
  valor: number
  descricao: string
}
export const calculateDiaria = httpsCallable<DiariaRequest, DiariaResponse>(
  functions, 'calculateDiaria',
)

/** Auto-assign CG (round-robin) */
export interface AssignCGRequest {
  requestId: string
}
export interface AssignCGResponse {
  cgUserId: string
  cgUserName: string
}
export const autoAssignCG = httpsCallable<AssignCGRequest, AssignCGResponse>(
  functions, 'autoAssignCG',
)

/** Send notification email */
export interface SendEmailRequest {
  to: string
  subject: string
  templateId: string
  data: Record<string, unknown>
}
export const sendNotificationEmail = httpsCallable<SendEmailRequest, void>(
  functions, 'sendNotificationEmail',
)

/** Generate PDF summary */
export interface GeneratePdfRequest {
  requestId: string
  type: 'summary' | 'defesaDeclaration'
}
export interface GeneratePdfResponse {
  url: string
}
export const generatePdf = httpsCallable<GeneratePdfRequest, GeneratePdfResponse>(
  functions, 'generatePdf',
)

/** Import CSV from ProPGWeb */
export interface ImportCsvRequest {
  csvUrl: string
}
export interface ImportCsvResponse {
  imported: number
  errors: string[]
}
export const importProPGWebCsv = httpsCallable<ImportCsvRequest, ImportCsvResponse>(
  functions, 'importProPGWebCsv',
)

/** Search Qualis periodicals */
export interface QualisSearchRequest {
  query: string
  area?: string
}
export interface QualisResult {
  issn: string
  titulo: string
  areaAvaliacao: string
  estrato: string
}
export const searchQualis = httpsCallable<QualisSearchRequest, { results: QualisResult[] }>(
  functions, 'searchQualis',
)

/** Update user roles (admin only) */
export interface UpdateRolesRequest {
  userId: string
  roles: string[]
}
export const updateUserRoles = httpsCallable<UpdateRolesRequest, void>(
  functions, 'updateUserRoles',
)
