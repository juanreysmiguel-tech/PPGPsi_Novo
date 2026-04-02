import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useAuthStore } from '@/stores/authStore'
import { loadUserProfile } from '@/services/authProfile'

export function useAuth() {
  const { setFirebaseUser, setUserProfile, setLoading, setInitialized, logout } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        setFirebaseUser(user)
        try {
          const profile = await loadUserProfile(user)
          setUserProfile(profile)
        } catch {
          setUserProfile({
            id: user.uid,
            email: user.email ?? '',
            nome: 'Visitante',
            roles: ['Externo'],
            status: 'Ativo',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      } else {
        logout()
      }
      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, logout])
}
