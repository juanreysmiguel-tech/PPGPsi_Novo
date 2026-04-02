/**
 * Funções utilitárias extraídas do código legado (js.html)
 * Migração de Google Apps Script para React + Firebase
 */

/**
 * Parse monetary values from various formats (Brazilian or US)
 * Handles: "R$ 1.234,56", "1,234.56", "1234.56", etc.
 */
export function parseMoneyValue(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val

  // Convert to string and clean up
  let str = String(val).trim()

  // Remove currency symbols and text
  str = str.replace(/R\$\s*/gi, '').replace(/[^\d.,\-]/g, '').trim()

  if (!str) return 0

  // Handle Brazilian format: 1.234,56 -> 1234.56
  // If has both dot and comma, determine format
  if (str.includes(',') && str.includes('.')) {
    // If comma comes after dot, it's Brazilian: 1.234,56
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.')
    } else {
      // Otherwise US format: 1,234.56
      str = str.replace(/,/g, '')
    }
  } else if (str.includes(',')) {
    // Only comma: could be 1234,56 (Brazilian decimal)
    str = str.replace(',', '.')
  } else if (str.includes('.')) {
    // Only dot: could be 1234.56 (US decimal) or 1.234 (BR thousands)
    // If dot is followed by exactly 3 digits and nothing else, assume thousands
    const parts = str.split('.')
    if (parts.length === 2 && parts[1].length === 3) {
      str = str.replace(/\./g, '')
    }
  }

  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/**
 * Format number as Brazilian currency
 * 1234.56 -> "R$ 1.234,56"
 */
export function formatBRCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Parse Brazilian date string (DD/MM/YYYY or YYYY-MM-DD)
 */
export function parseBRDate(dateStr: string): Date | null {
  if (!dateStr) return null

  const parts = dateStr.trim().split(/[-/]/)
  if (parts.length !== 3) return null

  let day, month, year
  if (parts[0].length === 4) {
    // YYYY-MM-DD
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
    day = parseInt(parts[2], 10)
  } else {
    // DD/MM/YYYY
    day = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
    year = parseInt(parts[2], 10)
  }

  const date = new Date(year, month - 1, day)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format date as Brazilian string (DD/MM/YYYY)
 */
export function formatBRDate(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(
    date instanceof Date ? date : new Date(date),
  )
}

/**
 * Normalize user object from legacy format
 */
export interface LegacyUser {
  roles?: string | string[]
  Roles?: string | string[]
  nome?: string
  Nome?: string
  name?: string
  email?: string
  Email?: string
  telefone?: string
  Telefone?: string
  celular?: string
  Celular?: string
  endereco?: string
  Endereco?: string
  emergencia_nome?: string
  EmergenciaNome?: string
  emergencia_tel?: string
  EmergenciaTel?: string
  photo?: string
  FotoUrl?: string
  Status?: string
  Data_Ingresso?: string
  Creditos_Totais?: string
  Creditos_Optativas?: string
  Data_Qualificacao?: string
  Data_Defesa?: string
  Data_Integralizacao?: string
  Nome_Orientador?: string
  Email_Orientador?: string
  [key: string]: any
}

export function normalizeUserFromLegacy(rawUser: LegacyUser = {}) {
  // Parse roles
  let roles: string[] = []
  const rolesRaw = rawUser.roles ?? rawUser.Roles ?? []
  if (typeof rolesRaw === 'string') {
    try {
      roles = rolesRaw.trim().startsWith('[')
        ? JSON.parse(rolesRaw)
        : rolesRaw.split(',').map((r) => r.trim())
    } catch {
      roles = [rolesRaw]
    }
  } else if (Array.isArray(rolesRaw)) {
    roles = rolesRaw
  }
  if (!Array.isArray(roles)) roles = ['Externo']

  // Build normalized user
  const user: any = {
    ...rawUser,
    roles,
    nome: rawUser.nome ?? rawUser.Nome ?? '',
    name: rawUser.name ?? rawUser.nome ?? rawUser.Nome ?? '',
    email: rawUser.email ?? rawUser.Email ?? '',
    telefone: rawUser.telefone ?? rawUser.Telefone ?? '',
    celular: rawUser.celular ?? rawUser.Celular ?? '',
    endereco: rawUser.endereco ?? rawUser.Endereco ?? '',
    emergencia_nome: rawUser.emergencia_nome ?? rawUser.EmergenciaNome ?? '',
    emergencia_tel: rawUser.emergencia_tel ?? rawUser.EmergenciaTel ?? '',
    photo: rawUser.photo ?? rawUser.FotoUrl ?? '',
  }

  // Build propg object if Discente
  if (!user.propg && roles.includes('Discente')) {
    user.propg = {
      nome: user.nome,
      situacao:
        (rawUser.Status ?? '').toLowerCase() === 'inativo'
          ? 'Inativo'
          : 'Regularmente Matriculado',
      email_institucional: user.email,
      data_ingresso: rawUser.Data_Ingresso ?? '',
      creditos_obtidos: rawUser.Creditos_Totais ?? rawUser.Creditos_Optativas ?? '',
      prazo_qualificacao: rawUser.Data_Qualificacao ?? '',
      prazo_defesa: rawUser.Data_Defesa ?? '',
      prazo_integralizacao: rawUser.Data_Integralizacao ?? '',
      orientador_nome: rawUser.Nome_Orientador ?? '',
      orientador_email: rawUser.Email_Orientador ?? '',
    }
  }

  return user
}

/**
 * Debounce function for search/filter inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  return function (...args: Parameters<T>) {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Check if user has any of the given roles
 */
export function userHasRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role))
}

/**
 * Flatten nested object keys for search (e.g., { a: { b: 'value' } } -> matches 'value')
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = '',
): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (value === null || value === undefined) {
      flattened[newKey] = ''
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join(', ')
    } else {
      flattened[newKey] = String(value)
    }
  }

  return flattened
}

/**
 * Search across multiple fields with multiple terms
 */
export function searchObjects<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
): T[] {
  if (!searchTerm) return items

  const terms = searchTerm.toLowerCase().split(/\s+/)
  return items.filter((item) =>
    terms.every((term) =>
      searchFields.some((field) =>
        String(item[field] ?? '')
          .toLowerCase()
          .includes(term),
      ),
    ),
  )
}
