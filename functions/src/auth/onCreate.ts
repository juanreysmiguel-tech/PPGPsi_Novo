import * as functions from 'firebase-functions/v1'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import {
  ALL_NATIVE_ROLES,
  hasAllNativeRoles,
  isPpgpsiInstitutionalEmail,
  isUFSCarEmail,
} from '../config'

/**
 * Auth user onCreate (Cloud Functions 1ª geração, região fixa us-central1).
 *
 * Não use `beforeUserCreated` (Gen2) sem upgrade para Identity Platform (GCIP):
 * o deploy retorna OPERATION_NOT_ALLOWED em projetos Auth “clássicos”.
 *
 * Se o build falhar com "Access to bucket gcf-sources-...-us-central1 denied":
 * https://cloud.google.com/functions/docs/troubleshooting#build-service-account
 * — conceda Storage Object Viewer no bucket `gcf-sources-<PROJECT_NUMBER>-us-central1`
 * à conta `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  if (!user.email) return

  const email = user.email.toLowerCase().trim()
  const db = getFirestore()
  const authAdmin = getAuth()

  if (!isUFSCarEmail(email)) {
    await authAdmin.setCustomUserClaims(user.uid, {
      roles: ['Externo'],
      isUFSCar: false,
    })
    return
  }

  const usersRef = db.collection('users')
  const snapshot = await usersRef.where('email', '==', email).limit(1).get()

  if (snapshot.empty) {
    const roles = isPpgpsiInstitutionalEmail(email) ? [...ALL_NATIVE_ROLES] : ['Externo']
    await usersRef.doc(user.uid).set({
      email,
      nome: user.displayName || email.split('@')[0],
      roles,
      status: 'Ativo',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await authAdmin.setCustomUserClaims(user.uid, {
      roles,
      isUFSCar: true,
    })
    return
  }

  const userDoc = snapshot.docs[0]
  const userData = userDoc.data()
  const roles: string[] = isPpgpsiInstitutionalEmail(email)
    ? [...ALL_NATIVE_ROLES]
    : userData.roles || ['Externo']

  if (userDoc.id !== user.uid) {
    const batch = db.batch()
    batch.set(usersRef.doc(user.uid), {
      ...userData,
      roles,
      updatedAt: new Date(),
    })
    batch.delete(userDoc.ref)
    await batch.commit()
  } else if (isPpgpsiInstitutionalEmail(email) && !hasAllNativeRoles(userData.roles)) {
    await userDoc.ref.update({
      roles,
      updatedAt: new Date(),
    })
  }

  await authAdmin.setCustomUserClaims(user.uid, {
    roles,
    isUFSCar: true,
  })
})
