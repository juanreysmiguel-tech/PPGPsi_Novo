import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}
