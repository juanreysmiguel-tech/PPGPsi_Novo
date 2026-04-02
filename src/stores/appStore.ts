import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  loadingMessage: string
  isGlobalLoading: boolean

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean, message?: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  loadingMessage: '',
  isGlobalLoading: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setGlobalLoading: (loading, message = '') =>
    set({ isGlobalLoading: loading, loadingMessage: message }),
}))
