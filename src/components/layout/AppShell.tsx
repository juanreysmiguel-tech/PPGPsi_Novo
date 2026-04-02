import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/stores/appStore'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppShell() {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16',
        )}
      >
        <TopNav />
        <main className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
