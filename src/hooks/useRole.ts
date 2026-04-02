import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types'
import { hasAnyRole as checkRoles } from '@/lib/roleUtils'

export function useRole() {
  const { roles, currentRole, switchRole } = useAuthStore()

  const hasAnyRole = (allowedRoles: Role[]) => checkRoles(roles, allowedRoles)

  const isAdmin = hasAnyRole(['Secretaria', 'Coordenacao'])
  const isStudent = hasAnyRole(['Discente'])
  const isProfessor = hasAnyRole(['Docente'])
  const isCG = hasAnyRole(['CG'])
  const isExternal = currentRole === 'Externo'

  return {
    roles,
    currentRole,
    switchRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    isProfessor,
    isCG,
    isExternal,
  }
}
