import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, type DocumentData, Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { FinancialRecord, BankDetails } from '@/types'

const COLLECTION = 'financial'
const ref = collection(db, COLLECTION)

function toRecord(id: string, data: DocumentData): FinancialRecord {
  return {
    id,
    idSolicitacao: data.idSolicitacao ?? '',
    valor: data.valor ?? 0,
    rubrica: data.rubrica ?? '',
    descricao: data.descricao ?? '',
    dataAutorizacao: data.dataAutorizacao,
    comprovanteUrl: data.comprovanteUrl,
    dadosBancarios: data.dadosBancarios,
    status: data.status || 'PENDING_ADVISOR',
    createdAt: data.createdAt ?? Timestamp.now(),
  }
}

export async function getFinancialByRequest(requestId: string): Promise<FinancialRecord[]> {
  const q = query(ref, where('idSolicitacao', '==', requestId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toRecord(d.id, d.data()))
}

export async function getAllFinancialRecords(): Promise<FinancialRecord[]> {
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toRecord(d.id, d.data()))
}

export async function createFinancialRecord(data: {
  idSolicitacao: string
  valor: number
  rubrica: string
  descricao: string
  dadosBancarios?: BankDetails
}): Promise<string> {
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function confirmDeposit(id: string, comprovanteUrl: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    dataAutorizacao: serverTimestamp(),
    comprovanteUrl,
  })
}
