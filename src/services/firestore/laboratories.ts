/**
 * Firestore service for research laboratories
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
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export interface Laboratory {
  id?: string
  name: string
  acronym: string
  leaderId: string
  memberIds: string[]
  researchLines: string[]
  description: string
  website?: string
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Get a laboratory by ID
 */
export async function getLaboratory(labId: string): Promise<Laboratory | null> {
  try {
    const docRef = doc(db, 'laboratories', labId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as Laboratory) } : null
  } catch (error) {
    console.error('Error fetching laboratory:', error)
    throw error
  }
}

/**
 * Create a new laboratory
 */
export async function createLaboratory(data: Omit<Laboratory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now()
    const docRef = doc(collection(db, 'laboratories'))
    await setDoc(docRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating laboratory:', error)
    throw error
  }
}

/**
 * Update a laboratory
 */
export async function updateLaboratory(
  labId: string,
  data: Partial<Omit<Laboratory, 'id' | 'createdAt'>>
) {
  try {
    const docRef = doc(db, 'laboratories', labId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating laboratory:', error)
    throw error
  }
}

/**
 * Delete a laboratory
 */
export async function deleteLaboratory(labId: string) {
  try {
    const docRef = doc(db, 'laboratories', labId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting laboratory:', error)
    throw error
  }
}

/**
 * Get laboratories by leader
 */
export async function getLaboratoriesByLeader(leaderId: string): Promise<Laboratory[]> {
  try {
    const q = query(collection(db, 'laboratories'), where('leaderId', '==', leaderId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Laboratory))
  } catch (error) {
    console.error('Error fetching laboratories by leader:', error)
    throw error
  }
}

/**
 * Get all active laboratories
 */
export async function getActiveLaboratories(): Promise<Laboratory[]> {
  try {
    const q = query(collection(db, 'laboratories'), where('active', '==', true))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Laboratory))
  } catch (error) {
    console.error('Error fetching active laboratories:', error)
    throw error
  }
}

/**
 * Get all laboratories (admin only)
 */
export async function getAllLaboratories(): Promise<Laboratory[]> {
  try {
    const q = query(collection(db, 'laboratories'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Laboratory))
  } catch (error) {
    console.error('Error fetching all laboratories:', error)
    throw error
  }
}

/**
 * Add member to laboratory
 */
export async function addLabMember(labId: string, memberId: string) {
  try {
    const lab = await getLaboratory(labId)
    if (!lab) throw new Error('Laboratory not found')

    const members = new Set(lab.memberIds)
    members.add(memberId)

    await updateLaboratory(labId, {
      memberIds: Array.from(members),
    })
  } catch (error) {
    console.error('Error adding lab member:', error)
    throw error
  }
}

/**
 * Remove member from laboratory
 */
export async function removeLabMember(labId: string, memberId: string) {
  try {
    const lab = await getLaboratory(labId)
    if (!lab) throw new Error('Laboratory not found')

    const members = new Set(lab.memberIds)
    members.delete(memberId)

    await updateLaboratory(labId, {
      memberIds: Array.from(members),
    })
  } catch (error) {
    console.error('Error removing lab member:', error)
    throw error
  }
}
