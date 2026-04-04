import { NavLink } from 'react-router-dom'
import {
  Home, FileText, Calendar, DollarSign, ClipboardCheck,
  Users, Archive, GraduationCap, BookOpen, MessageSquare,
  HelpCircle, Bell, LogOut, ChevronLeft, ChevronRight, Send
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useRole } from '@/hooks/useRole'
import { useAppStore } from '@/stores/appStore'
import { getRoutesForRole } from '@/config/routes'
import { logoutUser } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, FileText, Calendar, DollarSign, ClipboardCheck,
  Users, Archive, GraduationCap, BookOpen, MessageSquare,
  HelpCircle, Bell, Send
}

export function Sidebar() {
  const { currentRole } = useRole()
  const { userProfile } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const routes = getRoutesForRole(currentRole)

  return (
    <aside
      className={cn(
        'sidebar fixed top-0 left-0 h-screen z-40 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          P
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <div className="text-white font-heading font-bold text-sm">PPGPsi</div>
            <div className="text-gray-400 text-[10px]">UFSCar</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {routes.map((route) => {
          const Icon = ICON_MAP[route.icon] ?? Home
          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active')
              }
              title={route.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{route.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {sidebarOpen && userProfile && (
          <div className="px-2 py-1 animate-fade-in">
            <div className="text-white text-xs font-medium truncate">{userProfile.nome}</div>
            <div className="text-gray-400 text-[10px] truncate">{userProfile.email}</div>
          </div>
        )}
        <button
          onClick={() => logoutUser()}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title="Sair"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Sair</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 z-50"
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
