import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { hasAnyRole } from '@/lib/roleUtils'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

/**
 * Protects a route to only allow users with specific roles.
 * Redirects to home if the user doesn't have the required role.
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { roles } = useAuthStore()

  if (!hasAnyRole(roles, allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
