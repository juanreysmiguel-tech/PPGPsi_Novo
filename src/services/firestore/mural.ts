import {
  collection, getDocs, addDoc, deleteDoc, doc,
  query, orderBy, limit, serverTimestamp, type DocumentData, Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

const COLLECTION = 'mural'
const ref = collection(db, COLLECTION)

export interface MuralPost {
  id: string
  idUsuario: string
  nomeUsuario: string
  fotoUrl?: string
  conteudo: string
  dataPublicacao: Timestamp
}

function toPost(id: string, data: DocumentData): MuralPost {
  return {
    id,
    idUsuario: data.idUsuario ?? '',
    nomeUsuario: data.nomeUsuario ?? '',
    fotoUrl: data.fotoUrl,
    conteudo: data.conteudo ?? '',
    dataPublicacao: data.dataPublicacao ?? Timestamp.now(),
  }
}

export async function getMuralPosts(maxResults = 50): Promise<MuralPost[]> {
  const q = query(ref, orderBy('dataPublicacao', 'desc'), limit(maxResults))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toPost(d.id, d.data()))
}

export async function createMuralPost(data: {
  idUsuario: string
  nomeUsuario: string
  fotoUrl?: string
  conteudo: string
}): Promise<string> {
  const docRef = await addDoc(ref, {
    ...data,
    dataPublicacao: serverTimestamp(),
  })
  return docRef.id
}

export async function deleteMuralPost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
