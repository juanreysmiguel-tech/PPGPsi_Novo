/**
 * Firestore service for PTTs (Produtos Técnicos/Tecnológicos)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export type PTTStatus = 'rascunho' | 'submetido' | 'validado'

export interface PTT {
  id?: string
  authorId: string
  title: string
  category: string
  year: number
  description: string
  fileUrls: string[]
  status: PTTStatus
  validatedBy?: string
  validationNotes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Get a PTT by ID
 */
export async function getPTT(pttId: string): Promise<PTT | null> {
  try {
    const docRef = doc(db, 'ptts', pttId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as PTT) } : null
  } catch (error) {
    console.error('Error fetching PTT:', error)
    throw error
  }
}

/**
 * Create a new PTT
 */
export async function createPTT(data: Omit<PTT, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now()
    const docRef = doc(collection(db, 'ptts'))
    await setDoc(docRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating PTT:', error)
    throw error
  }
}

/**
 * Update a PTT
 */
export async function updatePTT(pttId: string, data: Partial<Omit<PTT, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, 'ptts', pttId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating PTT:', error)
    throw error
  }
}

/**
 * Delete a PTT
 */
export async function deletePTT(pttId: string) {
  try {
    const docRef = doc(db, 'ptts', pttId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting PTT:', error)
    throw error
  }
}

/**
 * Get PTTs by author
 */
export async function getPTTsByAuthor(authorId: string): Promise<PTT[]> {
  try {
    const q = query(
      collection(db, 'ptts'),
      where('authorId', '==', authorId),
      orderBy('year', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PTT))
  } catch (error) {
    console.error('Error fetching PTTs by author:', error)
    throw error
  }
}

/**
 * Get PTTs by status (admin)
 */
export async function getPTTsByStatus(status: PTTStatus): Promise<PTT[]> {
  try {
    const q = query(
      collection(db, 'ptts'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PTT))
  } catch (error) {
    console.error('Error fetching PTTs by status:', error)
    throw error
  }
}

/**
 * Validate a PTT (admin only)
 */
export async function validatePTT(pttId: string, validatedBy: string, notes?: string) {
  try {
    const docRef = doc(db, 'ptts', pttId)
    await updateDoc(docRef, {
      status: 'validado',
      validatedBy,
      validationNotes: notes || '',
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error validating PTT:', error)
    throw error
  }
}
