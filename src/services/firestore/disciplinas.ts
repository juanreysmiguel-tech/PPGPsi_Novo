import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

const COLLECTION = 'disciplinas'

export interface Disciplina {
  id?: string
  nome: string
  creditos?: number
  tipoMestrado?: string
  tipoDoutorado?: string
  createdAt?: any
  updatedAt?: any
}

/**
 * Get all disciplinas
 */
export async function getAllDisciplinas(): Promise<Disciplina[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION)))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Disciplina))
}

/**
 * Get disciplina by ID
 */
export async function getDisciplinaById(id: string): Promise<Disciplina | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as Disciplina
}

/**
 * Save disciplina
 */
export async function saveDisciplina(disciplina: Disciplina): Promise<string> {
  const timestamp = serverTimestamp()
  if (disciplina.id) {
    const docRef = doc(db, COLLECTION, disciplina.id)
    await updateDoc(docRef, {
      ...disciplina,
      updatedAt: timestamp,
    })
    return disciplina.id
  } else {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...disciplina,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return docRef.id
  }
}

/**
 * Delete disciplina
 */
export async function deleteDisciplina(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await deleteDoc(docRef)
}
