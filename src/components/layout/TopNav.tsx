import { useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, Menu } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useRole } from '@/hooks/useRole'
import { RoleSwitcher } from './RoleSwitcher'

export function TopNav() {
  const navigate = useNavigate()
  const { toggleSidebar } = useAppStore()
  const { userProfile } = useAuthStore()
  const { currentRole } = useRole()

  const shortName = userProfile?.nome?.split(' ')[0] || 'Usuario'

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-light">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left: Mobile menu toggle + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h5 className="hidden md:block text-sm font-semibold text-gray-700">
            Sistema de Gestao Academica
          </h5>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <RoleSwitcher />

          <button
            onClick={() => navigate('/ajuda')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/notificacoes')}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Notificacoes"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* User name badge */}
          <span className="hidden sm:inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full shadow-sm">
            {shortName}
          </span>

          {/* Role badge */}
          <span className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-sm">
            {currentRole}
          </span>
        </div>
      </div>
    </header>
  )
}
