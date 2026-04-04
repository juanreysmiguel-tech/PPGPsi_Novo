import {
  collection, doc, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, type DocumentData, Timestamp, onSnapshot,
  or
} from 'firebase/firestore'
import { db } from '@/config/firebase'

const COLLECTION = 'messages'
const ref = collection(db, COLLECTION)

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  read: boolean
  createdAt: Timestamp
}

function toMessage(id: string, data: DocumentData): ChatMessage {
  return {
    id,
    senderId: data.senderId ?? '',
    senderName: data.senderName ?? 'Usuário',
    receiverId: data.receiverId ?? '',
    receiverName: data.receiverName ?? 'Usuário',
    content: data.content ?? '',
    read: data.read ?? false,
    createdAt: data.createdAt ?? Timestamp.now(),
  }
}

export function subscribeToUserMessages(userId: string, callback: (msgs: ChatMessage[]) => void) {
  const q = query(
    ref,
    or(
      where('senderId', '==', userId),
      where('receiverId', '==', userId)
    ),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => toMessage(d.id, d.data()))
    callback(messages)
  })
}

export async function sendMessage(data: Omit<ChatMessage, 'id' | 'createdAt' | 'read'>) {
  await addDoc(ref, {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function markAsRead(messageId: string) {
  await updateDoc(doc(db, COLLECTION, messageId), {
    read: true
  })
}
