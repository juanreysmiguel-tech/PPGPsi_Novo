import type { Role } from '@/types'

/**
 * Normalizes raw profile string to recognized role.
 * Replicated from code.gs:35-42
 */
export function normalizarPerfil(perfilRaw: string): Role {
  const p = String(perfilRaw).toLowerCase().trim()
  if (p.includes('solicitante') || p.includes('aluno') || p.includes('estudante') || p.includes('discente')) return 'Discente'
  if (p.includes('orientador') || p.includes('docente') || p.includes('professor')) return 'Docente'
  if (p.includes('secretaria') || p.includes('sec')) return 'Secretaria'
  if (p.includes('cg') || p.includes('comissao') || p.includes('conselho')) return 'CG'
  if (p.includes('coordenacao') || p.includes('coordenador')) return 'Coordenacao'
  return 'Externo'
}

/**
 * Normalizes raw roles to clean array.
 * Replicated from code.gs:45-60
 */
export function normalizeRolesArray(rolesRaw: unknown): Role[] {
  if (!rolesRaw) return []
  if (Array.isArray(rolesRaw)) {
    return rolesRaw.filter(Boolean).map((r) => String(r).trim()) as Role[]
  }
  const txt = String(rolesRaw).trim()
  if (!txt) return []
  try {
    if (txt.startsWith('[') && txt.endsWith(']')) {
      const parsed = JSON.parse(txt)
      if (Array.isArray(parsed)) return parsed.map((r: unknown) => String(r).trim()).filter(Boolean) as Role[]
    }
  } catch { /* ignore */ }
  if (txt.includes(',')) {
    return txt.split(',').map((r) => r.trim()).filter(Boolean) as Role[]
  }
  return [txt as Role]
}

/**
 * Check if user has any of the allowed roles.
 */
export function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
  if (!userRoles.length || !allowedRoles.length) return false
  return userRoles.some((r) => allowedRoles.includes(r))
}

/**
 * Check if user is admin (Secretaria or Coordenacao).
 */
export function isAdmin(roles: Role[]): boolean {
  return hasAnyRole(roles, ['Secretaria', 'Coordenacao'])
}

/**
 * Check if user can see financial requests (CG, Secretaria, Coordenacao).
 */
export function canManageFinancial(roles: Role[]): boolean {
  return hasAnyRole(roles, ['CG', 'Secretaria', 'Coordenacao'])
}
