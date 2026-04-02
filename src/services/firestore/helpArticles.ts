/**
 * Firestore help articles service
 * Migrado de API.getHelpArticles, API.saveHelpArticle
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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { HelpArticle } from '@/types'

const COLLECTION = 'helpArticles'

/**
 * Get help articles by profile and/or request type
 * Migrado de: API.getHelpArticles(profile, requestType, cb)
 */
export async function getHelpArticles(
  profile?: string,
  requestType?: string,
): Promise<HelpArticle[]> {
  let q = query(collection(db, COLLECTION))

  if (profile && requestType) {
    q = query(
      collection(db, COLLECTION),
      where('profile', '==', profile),
      where('requestType', '==', requestType),
    )
  } else if (profile) {
    q = query(collection(db, COLLECTION), where('profile', '==', profile))
  } else if (requestType) {
    q = query(collection(db, COLLECTION), where('requestType', '==', requestType))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as HelpArticle))
}

/**
 * Get all help articles
 */
export async function getAllHelpArticles(): Promise<HelpArticle[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as HelpArticle))
}

/**
 * Get help article by ID
 */
export async function getHelpArticleById(id: string): Promise<HelpArticle | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as HelpArticle
}

/**
 * Save help article
 * Migrado de: API.saveHelpArticle(payload, cb)
 */
export async function saveHelpArticle(article: HelpArticle): Promise<string> {
  const timestamp = serverTimestamp()
  if (article.id) {
    // Update
    const docRef = doc(db, COLLECTION, article.id)
    await updateDoc(docRef, {
      ...article,
      updatedAt: timestamp,
    })
    return article.id
  } else {
    // Create
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...article,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return docRef.id
  }
}

/**
 * Delete help article
 */
export async function deleteHelpArticle(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}
