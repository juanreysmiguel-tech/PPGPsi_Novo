import {
  collection, doc, getDocs, updateDoc,
  query, where, orderBy, limit, type DocumentData, Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Notification } from '@/types'

const COLLECTION = 'notifications'
const ref = collection(db, COLLECTION)

function toNotification(id: string, data: DocumentData): Notification {
  return {
    id,
    idUsuario: data.idUsuario ?? '',
    tipo: data.tipo ?? '',
    titulo: data.titulo ?? '',
    mensagem: data.mensagem ?? '',
    data: data.data ?? Timestamp.now(),
    lido: data.lido ?? false,
    idSolicitacao: data.idSolicitacao,
  }
}

export async function getNotificationsByUser(
  userId: string,
  onlyUnread = false,
  maxResults = 50,
): Promise<Notification[]> {
  const constraints = [
    where('idUsuario', '==', userId),
    ...(onlyUnread ? [where('lido', '==', false)] : []),
    orderBy('data', 'desc'),
    limit(maxResults),
  ]
  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => toNotification(d.id, d.data()))
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(ref, where('idUsuario', '==', userId), where('lido', '==', false))
  const snap = await getDocs(q)
  return snap.size
}

export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), { lido: true })
}

export async function markAllAsRead(userId: string): Promise<void> {
  const unread = await getNotificationsByUser(userId, true, 200)
  const promises = unread.map((n) => markAsRead(n.id))
  await Promise.all(promises)
}
