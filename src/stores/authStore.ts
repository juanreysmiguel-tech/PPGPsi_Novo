import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Role, UserProfile } from '@/types'

interface AuthState {
  firebaseUser: FirebaseUser | null
  userProfile: UserProfile | null
  roles: Role[]
  currentRole: Role
  isLoading: boolean
  isInitialized: boolean

  setFirebaseUser: (user: FirebaseUser | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  switchRole: (role: Role) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  roles: [],
  currentRole: 'Externo',
  isLoading: true,
  isInitialized: false,

  setFirebaseUser: (user) => set({ firebaseUser: user }),

  setUserProfile: (profile) =>
    set({
      userProfile: profile,
      roles: profile?.roles ?? [],
      currentRole: profile?.roles?.[0] ?? 'Externo',
    }),

  switchRole: (role) => set({ currentRole: role }),

  setLoading: (loading) => set({ isLoading: loading }),

  setInitialized: (initialized) => set({ isInitialized: initialized }),

  logout: () =>
    set({
      firebaseUser: null,
      userProfile: null,
      roles: [],
      currentRole: 'Externo',
      isLoading: false,
    }),
}))
