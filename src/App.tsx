import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { ensureCollectionsExist } from '@/lib/initializeFirestore'
import { AppShell } from '@/components/layout/AppShell'
import { LoginModal } from '@/components/auth/LoginModal'
import { DomainGate } from '@/components/auth/DomainGate'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ToastProvider } from '@/components/ui/Toast'
import { Loader2 } from 'lucide-react'

// Pages
import { HomePage } from '@/pages/HomePage'
import { ExternalPage } from '@/pages/ExternalPage'
import { FinancialPage } from '@/pages/FinancialPage'
import { MeetingsPage } from '@/pages/MeetingsPage'
import { UsersPage } from '@/pages/UsersPage'
import { CGParecerPage } from '@/pages/CGParecerPage'
import { ArchivePage } from '@/pages/ArchivePage'
import { DefesaPage } from '@/pages/DefesaPage'
import { PPGPsiuPage } from '@/pages/PPGPsiuPage'
import { MuralPage } from '@/pages/MuralPage'
import { HelpPage } from '@/pages/HelpPage'
import { HelpAdminPage } from '@/pages/HelpAdminPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PTTsPage } from '@/pages/PTTsPage'
import { LaboratoriesPage } from '@/pages/LaboratoriesPage'
import { ProjectsPage } from '@/pages/ProjectsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (matches original CacheManager.defaultTTL)
      retry: 1,
    },
  },
})

function AppContent() {
  useAuth()
  const { firebaseUser, isLoading, isInitialized } = useAuthStore()

  // Initialize Firestore collections on first load
  useEffect(() => {
    ensureCollectionsExist()
  }, [])

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!firebaseUser) {
    return (
      <LoginModal
        onContinueAsVisitor={() => {
          window.location.hash = '#external'
        }}
      />
    )
  }

  // Authenticated - check domain
  return (
    <DomainGate fallback={<ExternalPage />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/financeiro" element={
            <ProtectedRoute allowedRoles={['Secretaria', 'Coordenacao', 'CG']}>
              <FinancialPage />
            </ProtectedRoute>
          } />
          <Route path="/reunioes" element={
            <ProtectedRoute allowedRoles={['Secretaria', 'Coordenacao']}>
              <MeetingsPage />
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute allowedRoles={['Secretaria', 'Coordenacao']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/parecer" element={
            <ProtectedRoute allowedRoles={['CG']}>
              <CGParecerPage />
            </ProtectedRoute>
          } />
          <Route path="/arquivo" element={
            <ProtectedRoute allowedRoles={['Secretaria', 'Coordenacao']}>
              <ArchivePage />
            </ProtectedRoute>
          } />
          <Route path="/defesa" element={
            <ProtectedRoute allowedRoles={['Discente']}>
              <DefesaPage />
            </ProtectedRoute>
          } />
          <Route path="/ppgpsiu" element={
            <ProtectedRoute allowedRoles={['Discente', 'Docente']}>
              <PPGPsiuPage />
            </ProtectedRoute>
          } />
          <Route path="/mural" element={<MuralPage />} />
          <Route path="/ajuda" element={<HelpPage />} />
          <Route path="/admin/ajuda" element={
            <ProtectedRoute allowedRoles={['Secretaria', 'Coordenacao']}>
              <HelpAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/ptts" element={
            <ProtectedRoute allowedRoles={['Discente', 'Docente']}>
              <PTTsPage />
            </ProtectedRoute>
          } />
          <Route path="/laboratorios" element={
            <ProtectedRoute allowedRoles={['Docente']}>
              <LaboratoriesPage />
            </ProtectedRoute>
          } />
          <Route path="/projetos" element={
            <ProtectedRoute allowedRoles={['Docente']}>
              <ProjectsPage />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DomainGate>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
        <ToastProvider />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
