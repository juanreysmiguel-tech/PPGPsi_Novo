import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getAuth } from 'firebase-admin/auth'
import {
  ALL_NATIVE_ROLES,
  EMAIL_SECRETARIA,
  hasAllNativeRoles,
  isUFSCarEmail,
} from '../config'

/**
 * Gen2 Firestore trigger em southamerica-east1 (alinhado às outras functions).
 */
export const onUserWriteEnsurePpgpsiRoles = onDocumentWritten(
  {
    document: 'users/{userId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const after = event.data?.after
    if (!after?.exists) return

    const data = after.data()
    const email = String(data?.email ?? '').toLowerCase().trim()
    if (email !== EMAIL_SECRETARIA.toLowerCase()) return
    if (hasAllNativeRoles(data?.roles)) return

    const uid = after.id
    await after.ref.update({
      roles: [...ALL_NATIVE_ROLES],
      updatedAt: new Date(),
    })
    await getAuth().setCustomUserClaims(uid, {
      roles: [...ALL_NATIVE_ROLES],
      isUFSCar: isUFSCarEmail(email),
    })
  },
)
