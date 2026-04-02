/**
 * Firestore requests service
 * Migrado de API.submitRequest, API.getRequests, etc.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Request } from '@/types'

const COLLECTION = 'requests'

/**
 * Create/Submit a new request
 * Alias para submitRequest (compatibilidade com hooks)
 */
export async function createRequest(data: Partial<Request>): Promise<string> {
  const timestamp = serverTimestamp()
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'Pendente',
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return docRef.id
}

/**
 * Submit a new request (alias para createRequest)
 * Migrado de: API.submitRequest(type, details, cb)
 */
export async function submitRequest(data: Partial<Request>): Promise<string> {
  return createRequest(data)
}

/**
 * Get requests by user ID
 * Para Discente: suas próprias requisições
 */
export async function getRequestsByUser(userId: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('idUsuario', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests by role and user ID
 * Migrado de: API.getRequests(role, userId, cb)
 */
export async function getRequests(role: string, userId: string): Promise<Request[]> {
  const constraints: QueryConstraint[] = []

  if (role === 'Discente') {
    constraints.push(where('idUsuario', '==', userId))
  } else if (['Docente', 'Secretaria', 'Coordenacao', 'CG'].includes(role)) {
    constraints.push(where('status', '!=', 'Arquivado'))
  }

  const q = query(collection(db, COLLECTION), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get all requests (admin only)
 * Migrado de: API.getAllRequests(cb)
 */
export async function getAllRequests(): Promise<Request[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get archived requests
 * Migrado de: API.getArchivedRequests(cb)
 */
export async function getArchivedRequests(): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('status', '==', 'Arquivado'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get single request by ID
 */
export async function getRequestById(id: string): Promise<Request | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as Request
}

/**
 * Update request status
 * Migrado de: API.updateRequestStatus(id, status, justif, obs, cb)
 */
export async function updateRequestStatus(
  id: string,
  status: string,
  justification?: string,
  observation?: string,
): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  const updateData: Record<string, any> = {
    status,
    updatedAt: serverTimestamp(),
  }

  if (justification) {
    updateData.justification = justification
  }
  if (observation) {
    updateData.observation = observation
  }

  await updateDoc(docRef, updateData)
}

/**
 * Update request with meeting assignment
 * Migrado de: API.updateRequestMeeting(id, meetingId, cb)
 */
export async function updateRequestMeeting(id: string, meetingId: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    meetingId,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete request
 */
export async function deleteRequest(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}

/**
 * Archive student requests (when student leaves program)
 * Migrado de: API.archiveStudentRequests(email, cb)
 */
export async function archiveStudentRequests(email: string): Promise<number> {
  const q = query(collection(db, COLLECTION), where('studentEmail', '==', email))
  const snapshot = await getDocs(q)

  let archivedCount = 0
  for (const docSnap of snapshot.docs) {
    await updateDoc(docSnap.ref, {
      status: 'Arquivado',
      updatedAt: serverTimestamp(),
    })
    archivedCount++
  }

  return archivedCount
}

/**
 * Get requests by student email
 */
export async function getRequestsByStudentEmail(email: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('studentEmail', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests by status
 */
export async function getRequestsByStatus(status: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('status', '==', status))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests assigned to a user (CG member)
 */
export async function getRequestsAssignedTo(userId: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('assignedTo', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Update generic request data
 */
export async function updateRequest(id: string, data: Partial<Request>): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Get requests by advisor email
 */
export async function getRequestsByAdvisorEmail(advisorEmail: string): Promise<Request[]> {
  const q = query(
    collection(db, COLLECTION),
    where('emailOrientador', '==', advisorEmail.toLowerCase())
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests by meeting ID
 */
export async function getRequestsByMeeting(meetingId: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('meetingId', '==', meetingId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests by category
 */
export async function getRequestsByCategory(category: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('categoria', '==', category))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Get requests assigned to a parecerista (CG member doing assessment)
 */
export async function getRequestsByParecerista(userId: string): Promise<Request[]> {
  const q = query(collection(db, COLLECTION), where('pareceristId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Request))
}

/**
 * Update request details (custom fields)
 */
export async function updateRequestDetails(
  id: string,
  details: Record<string, unknown>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...details,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Assign request to a meeting
 */
export async function assignRequestToMeeting(
  requestId: string,
  meetingId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, requestId)
  await updateDoc(docRef, {
    meetingId,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Assign parecerista (CG member) to a request
 */
export async function assignParecerista(
  requestId: string,
  pareceristId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, requestId)
  await updateDoc(docRef, {
    pareceristId,
    updatedAt: serverTimestamp(),
  })
}
