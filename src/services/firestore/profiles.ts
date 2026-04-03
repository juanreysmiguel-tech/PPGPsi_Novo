/**
 * Firestore service for scientific profiles
 * Handles CRUD operations for user profiles with research data
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export interface ResearchLine {
  name: string
  active: boolean
}

export interface ScientificProfile {
  userId: string
  orcid?: string
  lattesId?: string
  researchLines: ResearchLine[]
  bio?: string
  photoUrl?: string
  lastLattesSync?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Get a user's scientific profile
 */
export async function getProfile(userId: string): Promise<ScientificProfile | null> {
  try {
    const docRef = doc(db, 'profiles', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as ScientificProfile) : null
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

/**
 * Create or update a user's profile
 */
export async function setProfile(userId: string, data: Partial<ScientificProfile>) {
  try {
    const docRef = doc(db, 'profiles', userId)
    const now = Timestamp.now()

    // Get existing profile to preserve createdAt
    const existing = await getDoc(docRef)
    const createdAt = existing.exists()
      ? existing.data().createdAt
      : now

    await setDoc(
      docRef,
      {
        userId,
        ...data,
        createdAt,
        updatedAt: now,
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error setting profile:', error)
    throw error
  }
}

/**
 * Update specific fields in a profile
 */
export async function updateProfile(
  userId: string,
  data: Partial<Omit<ScientificProfile, 'userId' | 'createdAt'>>
) {
  try {
    const docRef = doc(db, 'profiles', userId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Get all profiles (admin only)
 */
export async function getAllProfiles(): Promise<ScientificProfile[]> {
  try {
    const q = query(collection(db, 'profiles'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ScientificProfile)
  } catch (error) {
    console.error('Error fetching all profiles:', error)
    throw error
  }
}

/**
 * Search profiles by research line
 */
export async function getProfilesByResearchLine(
  researchLine: string
): Promise<ScientificProfile[]> {
  try {
    const q = query(
      collection(db, 'profiles'),
      where('researchLines', 'array-contains', { name: researchLine, active: true })
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ScientificProfile)
  } catch (error) {
    console.error('Error searching profiles by research line:', error)
    throw error
  }
}

/**
 * Update Lattes sync timestamp
 */
export async function updateLastLattesSync(userId: string) {
  try {
    const docRef = doc(db, 'profiles', userId)
    await updateDoc(docRef, {
      lastLattesSync: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating Lattes sync timestamp:', error)
    throw error
  }
}
