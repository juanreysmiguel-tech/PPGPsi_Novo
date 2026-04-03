/**
 * Firestore service for bibliographic and technical publications
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
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export type PublicationType = 'artigo' | 'livro' | 'capitulo' | 'evento' | 'ptt'
export type PublicationSource = 'lattes' | 'sucupira' | 'manual'

export interface Publication {
  id?: string
  authorIds: string[]
  title: string
  type: PublicationType
  year: number
  venue: string
  qualisStrata?: string
  doi?: string
  issn?: string
  url?: string
  source: PublicationSource
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Get a publication by ID
 */
export async function getPublication(pubId: string): Promise<Publication | null> {
  try {
    const docRef = doc(db, 'publications', pubId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as Publication) } : null
  } catch (error) {
    console.error('Error fetching publication:', error)
    throw error
  }
}

/**
 * Create a new publication
 */
export async function createPublication(data: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now()
    const docRef = doc(collection(db, 'publications'))
    await setDoc(docRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating publication:', error)
    throw error
  }
}

/**
 * Update a publication
 */
export async function updatePublication(pubId: string, data: Partial<Omit<Publication, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, 'publications', pubId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating publication:', error)
    throw error
  }
}

/**
 * Delete a publication
 */
export async function deletePublication(pubId: string) {
  try {
    const docRef = doc(db, 'publications', pubId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting publication:', error)
    throw error
  }
}

/**
 * Get publications by author
 */
export async function getPublicationsByAuthor(authorId: string): Promise<Publication[]> {
  try {
    const q = query(
      collection(db, 'publications'),
      where('authorIds', 'array-contains', authorId),
      orderBy('year', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication))
  } catch (error) {
    console.error('Error fetching publications by author:', error)
    throw error
  }
}

/**
 * Get publications by author and year range (CAPES 4-year window)
 */
export async function getPublicationsByAuthorAndYear(
  authorId: string,
  startYear: number,
  endYear: number
): Promise<Publication[]> {
  try {
    const q = query(
      collection(db, 'publications'),
      where('authorIds', 'array-contains', authorId),
      where('year', '>=', startYear),
      where('year', '<=', endYear),
      orderBy('year', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication))
  } catch (error) {
    console.error('Error fetching publications by author and year:', error)
    throw error
  }
}

/**
 * Get publications by type
 */
export async function getPublicationsByType(type: PublicationType): Promise<Publication[]> {
  try {
    const q = query(
      collection(db, 'publications'),
      where('type', '==', type),
      orderBy('year', 'desc'),
      limit(100)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication))
  } catch (error) {
    console.error('Error fetching publications by type:', error)
    throw error
  }
}

/**
 * Get publications by Qualis strata
 */
export async function getPublicationsByQualis(strata: string): Promise<Publication[]> {
  try {
    const q = query(
      collection(db, 'publications'),
      where('qualisStrata', '==', strata),
      orderBy('year', 'desc'),
      limit(50)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication))
  } catch (error) {
    console.error('Error fetching publications by Qualis:', error)
    throw error
  }
}

/**
 * Batch create publications (used by importers)
 */
export async function batchCreatePublications(
  publications: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<string[]> {
  try {
    const batch = writeBatch(db)
    const now = Timestamp.now()
    const ids: string[] = []

    publications.forEach(pub => {
      const docRef = doc(collection(db, 'publications'))
      batch.set(docRef, {
        ...pub,
        createdAt: now,
        updatedAt: now,
      })
      ids.push(docRef.id)
    })

    await batch.commit()
    return ids
  } catch (error) {
    console.error('Error batch creating publications:', error)
    throw error
  }
}

/**
 * Get all publications (admin only)
 */
export async function getAllPublications(): Promise<Publication[]> {
  try {
    const q = query(collection(db, 'publications'), orderBy('year', 'desc'), limit(500))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Publication))
  } catch (error) {
    console.error('Error fetching all publications:', error)
    throw error
  }
}

/**
 * Get publication statistics for dashboard
 */
export async function getPublicationStats(authorIds: string[], startYear: number, endYear: number) {
  try {
    const publications = await Promise.all(
      authorIds.map(id => getPublicationsByAuthorAndYear(id, startYear, endYear))
    )
    const all = publications.flat()

    const stats = {
      total: all.length,
      byType: {} as Record<PublicationType, number>,
      byQualis: {} as Record<string, number>,
      byYear: {} as Record<number, number>,
    }

    all.forEach(pub => {
      stats.byType[pub.type] = (stats.byType[pub.type] || 0) + 1
      if (pub.qualisStrata) stats.byQualis[pub.qualisStrata] = (stats.byQualis[pub.qualisStrata] || 0) + 1
      stats.byYear[pub.year] = (stats.byYear[pub.year] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Error calculating publication stats:', error)
    throw error
  }
}
