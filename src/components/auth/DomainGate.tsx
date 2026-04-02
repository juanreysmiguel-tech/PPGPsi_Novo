import { type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { isUFSCarEmail } from '@/config/constants'

interface DomainGateProps {
  children: ReactNode
  fallback: ReactNode
}

/**
 * Shows the fallback (ExternalPage) if the user is not from a UFSCar domain.
 * E-mails @ufscar.br / @estudante.ufscar.br entram no app; rotas sensíveis usam ProtectedRoute.
 */
export function DomainGate({ children, fallback }: DomainGateProps) {
  const { firebaseUser } = useAuthStore()

  if (!firebaseUser) return null

  const email = firebaseUser.email ?? ''
  if (!isUFSCarEmail(email)) return <>{fallback}</>

  return <>{children}</>
}
