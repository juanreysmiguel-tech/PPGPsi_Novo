import { useRole } from '@/hooks/useRole'
import { StudentDashboard } from './StudentDashboard'
import { ProfessorDashboard } from './ProfessorDashboard'
import { SecretariaDashboard } from './SecretariaDashboard'
import { CGParecerPage } from './CGParecerPage'

/**
 * Routes to the appropriate dashboard based on the user's current role.
 * Replicated from the original App.currentRole -> UI.renderView() logic.
 */
export function HomePage() {
  const { currentRole } = useRole()

  switch (currentRole) {
    case 'Discente':
      return <StudentDashboard />
    case 'Docente':
      return <ProfessorDashboard />
    case 'Secretaria':
    case 'Coordenacao':
      return <SecretariaDashboard />
    case 'CG':
      return <CGParecerPage />
    case 'Externo':
      return (
        <div className="max-w-lg mx-auto mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-gray-800">Perfil Externo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua conta ainda nao tem um perfil operacional (Discente, Docente, etc.). Solicite o cadastro
            a secretaria do programa ou aguarde a liberacao apos importacao ProPGWeb.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Use o seletor de perfil no topo se voce tiver mais de um papel atribuido.
          </p>
        </div>
      )
    default:
      return <StudentDashboard />
  }
}
