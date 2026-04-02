import { auth } from '@/config/firebase'
import { useAuthStore } from '@/stores/authStore'
import { loadUserProfile } from '@/services/authProfile'

/** Recarrega perfil do Firestore e força novo ID token (útil após sync de custom claims). */
export async function refreshCurrentUserProfile(): Promise<void> {
  const user = auth.currentUser
  if (!user) return
  const profile = await loadUserProfile(user, { forceRefreshToken: true })
  useAuthStore.getState().setUserProfile(profile)
}
