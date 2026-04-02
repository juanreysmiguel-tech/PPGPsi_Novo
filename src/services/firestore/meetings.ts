/**
 * Firestore meetings service
 * Migrado de API.getMeetings, API.createMeeting, etc.
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
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Meeting } from '@/types'

const COLLECTION = 'meetings'

export interface CreateMeetingData {
  nome: string
  dataReuniao: Date | Timestamp
  dataInicioPeriodo: Date | Timestamp
  dataFimPeriodo: Date | Timestamp
  prazoFechamento: Date | Timestamp
  status?: 'Aberto' | 'Concluida' | 'Cancelada'
}

/**
 * Get all meetings
 */
export async function getAllMeetings(): Promise<Meeting[]> {
  const q = query(collection(db, COLLECTION), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Meeting))
}

/**
 * Get open/active meetings
 */
export async function getOpenMeetings(): Promise<Meeting[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'Agendada'),
    orderBy('date', 'asc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Meeting))
}

/**
 * Get meetings (active or all)
 * Migrado de: API.getMeetings(activeOnly, cb)
 */
export async function getMeetings(activeOnly = true): Promise<Meeting[]> {
  return activeOnly ? getOpenMeetings() : getAllMeetings()
}

/**
 * Create meeting
 * Migrado de: API.createMeeting(data, cb)
 */
export async function createMeeting(data: Partial<Meeting>): Promise<string> {
  const timestamp = serverTimestamp()
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'Agendada',
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return docRef.id
}

/**
 * Update meeting
 * Migrado de: API.updateMeeting(data, cb)
 */
export async function updateMeeting(id: string, data: Partial<Meeting>): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Get meeting by ID
 */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as Meeting
}

/**
 * Delete meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}

/**
 * Get meetings by date range
 */
export async function getMeetingsByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<Meeting[]> {
  const q = query(
    collection(db, COLLECTION),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Meeting))
}

/**
 * Update meeting status
 */
export async function updateMeetingStatus(id: string, status: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Find meeting for a specific date
 */
export async function findMeetingForDate(date: Date): Promise<Meeting | null> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, COLLECTION),
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Meeting
}
