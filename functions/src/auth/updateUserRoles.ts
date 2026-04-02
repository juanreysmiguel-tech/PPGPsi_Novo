import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import {
  ALL_NATIVE_ROLES,
  hasAllNativeRoles,
  isPpgpsiInstitutionalEmail,
  isUFSCarEmail,
} from '../config'

const ALLOWED_ROLES = new Set([
  'Externo',
  'Discente',
  'Docente',
  'Secretaria',
  'Coordenacao',
  'CG',
])

async function assertCallerIsAdmin(db: Firestore, uid: string): Promise<void> {
  const snap = await db.collection('users').doc(uid).get()
  const roles: string[] = snap.data()?.roles ?? []
  const ok = roles.some((r) => r === 'Secretaria' || r === 'Coordenacao')
  if (!ok) {
    throw new HttpsError('permission-denied', 'Apenas Secretaria ou Coordenacao podem sincronizar perfis.')
  }
}

/**
 * Sincroniza custom claims com os roles já gravados no Firestore (ou roles enviados).
 * Chamada após updateUser no cliente para o usuário-alvo passar a receber token atualizado.
 */
export const updateUserRoles = onCall({ region: 'southamerica-east1' }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Login necessario.')
  }

  const db = getFirestore()
  await assertCallerIsAdmin(db, request.auth.uid)

  const { userId, roles } = request.data as { userId?: string; roles?: string[] }
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId e obrigatorio.')
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new HttpsError('invalid-argument', 'Informe ao menos um perfil.')
  }

  for (const r of roles) {
    if (typeof r !== 'string' || !ALLOWED_ROLES.has(r)) {
      throw new HttpsError('invalid-argument', `Perfil invalido: ${r}`)
    }
  }

  const targetSnap = await db.collection('users').doc(userId).get()
  if (!targetSnap.exists) {
    throw new HttpsError('not-found', 'Usuario nao encontrado no Firestore.')
  }

  const email = String(targetSnap.data()?.email ?? '').toLowerCase().trim()
  const effectiveRoles = isPpgpsiInstitutionalEmail(email) ? [...ALL_NATIVE_ROLES] : roles

  if (isPpgpsiInstitutionalEmail(email) && !hasAllNativeRoles(targetSnap.data()?.roles)) {
    await targetSnap.ref.update({
      roles: effectiveRoles,
      updatedAt: new Date(),
    })
  }

  await getAuth().setCustomUserClaims(userId, {
    roles: effectiveRoles,
    isUFSCar: isUFSCarEmail(email),
  })

  return { ok: true as const }
})
