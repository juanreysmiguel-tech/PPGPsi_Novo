import { useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, Menu } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { RoleSwitcher } from './RoleSwitcher'

export function TopNav() {
  const navigate = useNavigate()
  const { toggleSidebar } = useAppStore()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-light">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left: Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu className="h-5 w-5" />
        </button>

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
            {/* TODO: Add unread count badge with real-time listener */}
          </button>
        </div>
      </div>
    </header>
  )
}
