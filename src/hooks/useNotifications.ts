import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  getNotificationsByUser, getUnreadCount, markAsRead, markAllAsRead,
} from '@/services/firestore/notifications'
import { useAuthStore } from '@/stores/authStore'

const STALE = 60 * 1000 // 1 min

const keys = {
  byUser: (uid: string) => ['notifications', uid] as const,
  unreadCount: (uid: string) => ['notifications', 'unread', uid] as const,
}

export function useNotifications(maxResults = 50) {
  const uid = useAuthStore((s) => s.userProfile?.id)
  return useQuery({
    queryKey: keys.byUser(uid ?? ''),
    queryFn: () => getNotificationsByUser(uid!, false, maxResults),
    staleTime: STALE,
    enabled: !!uid,
  })
}

export function useUnreadCount() {
  const uid = useAuthStore((s) => s.userProfile?.id)
  const qc = useQueryClient()

  // Real-time listener for badge updates
  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'notifications'),
      where('idUsuario', '==', uid),
      where('lido', '==', false),
      orderBy('data', 'desc'),
      limit(200),
    )
    const unsub = onSnapshot(q, (snap) => {
      qc.setQueryData(keys.unreadCount(uid), snap.size)
    })
    return unsub
  }, [uid, qc])

  return useQuery({
    queryKey: keys.unreadCount(uid ?? ''),
    queryFn: () => getUnreadCount(uid!),
    staleTime: STALE,
    enabled: !!uid,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
}

export function useMarkAllAsRead() {
  const uid = useAuthStore((s) => s.userProfile?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markAllAsRead(uid!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
}
