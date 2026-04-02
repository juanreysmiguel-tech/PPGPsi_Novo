/**
 * Firestore users service
 * Migrado de API.getAllUsers, API.saveUser, etc.
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
import type { User } from '@/types'

const COLLECTION = 'users'

/**
 * Get all users
 * Migrado de: API.getAllUsers(cb)
 */
export async function getAllUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as User))
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as User
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(collection(db, COLLECTION), where('email', '==', email.toLowerCase()))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as User
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  const q = query(collection(db, COLLECTION), where('roles', 'array-contains', role))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as User))
}

/**
 * Get students by advisor email
 */
export async function getStudentsByAdvisor(advisorEmail: string): Promise<User[]> {
  const q = query(
    collection(db, COLLECTION),
    where('emailOrientador', '==', advisorEmail.toLowerCase()),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as User))
}

/**
 * Save/Update user
 * Migrado de: API.saveUser(user, cb)
 */
export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Update user contact info
 * Migrado de: API.updateContactInfo(data, cb)
 */
export async function updateUserContact(
  id: string,
  contact: {
    telefone?: string
    celular?: string
    endereco?: string
    emergenciaNome?: string
    emergenciaTel?: string
  },
): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...contact,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Create user draft (pre-registration)
 */
export async function addUserDraft(data: {
  email: string
  nome: string
  roles: string[]
  status: string
}): Promise<string> {
  const timestamp = serverTimestamp()
  const docRef = await addDoc(collection(db, COLLECTION), {
    email: data.email.toLowerCase(),
    nome: data.nome,
    roles: data.roles,
    status: data.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return docRef.id
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}

/**
 * Create full user doc (when user first logs in)
 */
export async function createUserFromAuth(data: {
  uid: string
  email: string
  nome: string
  roles: string[]
}): Promise<void> {
  const timestamp = serverTimestamp()
  const docRef = doc(db, COLLECTION, data.uid)
  await updateDoc(docRef, {
    email: data.email.toLowerCase(),
    nome: data.nome,
    roles: data.roles,
    status: 'Ativo',
    createdAt: timestamp,
    updatedAt: timestamp,
  }).catch(async () => {
    // Create if doesn't exist
    await updateDoc(docRef, {
      email: data.email.toLowerCase(),
      nome: data.nome,
      roles: data.roles,
      status: 'Ativo',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  })
}

/**
 * Get users by status
 */
export async function getUsersByStatus(status: string): Promise<User[]> {
  const q = query(collection(db, COLLECTION), where('status', '==', status))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as User))
}
