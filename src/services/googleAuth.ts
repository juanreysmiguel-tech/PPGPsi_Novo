import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { isUFSCarEmail } from '@/config/constants'

const googleProvider = new GoogleAuthProvider()

/** Sempre mostrar seletor de conta. Sem `hd`: permite @ufscar.br e @estudante.ufscar.br no Google. */
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

/**
 * Realiza login com Google, validando o domínio UFSCar.
 * Abre popup do Google; usuário seleciona conta.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const email = result.user.email ?? ''

    // Validação hard: apenas UFSCar
    if (!isUFSCarEmail(email)) {
      await signOut(auth)
      throw new Error(
        `Email ${email} não autorizado. Use apenas @ufscar.br ou @estudante.ufscar.br`,
      )
    }

    return result
  } catch (error) {
    if (error instanceof Error && error.message.includes('popup-closed-by-user')) {
      throw new Error('Login cancelado pelo usuario.')
    }
    const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : ''
    const msg = error instanceof Error ? error.message : ''
    if (code === 'auth/configuration-not-found' || msg.includes('CONFIGURATION_NOT_FOUND')) {
      throw new Error(
        'Login Google nao configurado no Firebase (Authentication > Google, OAuth e restricoes da API key). Veja FIREBASE_SETUP.md.',
      )
    }
    throw error
  }
}

/**
 * Realiza logout do Google (e de todo o Firebase).
 */
export async function signOutGoogle(): Promise<void> {
  await auth.signOut()
}
