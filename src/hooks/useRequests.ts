import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequestById, getRequestsByUser, getRequestsByAdvisorEmail,
  getRequestsByMeeting, getRequestsByCategory, getRequestsByStatus,
  getAllRequests, getRequestsByParecerista,
  createRequest, updateRequestStatus, updateRequestDetails, deleteRequest,
  assignRequestToMeeting, assignParecerista,
} from '@/services/firestore/requests'
import type { RequestCategory } from '@/types'
import { useAuthStore } from '@/stores/authStore'

const STALE = 5 * 60 * 1000 // 5 min – matches original CacheManager

const keys = {
  all: ['requests'] as const,
  byId: (id: string) => ['requests', 'byId', id] as const,
  byUser: (uid: string) => ['requests', 'byUser', uid] as const,
  byAdvisor: (email: string) => ['requests', 'byAdvisor', email] as const,
  byMeeting: (mid: string) => ['requests', 'byMeeting', mid] as const,
  byCategory: (cat: RequestCategory) => ['requests', 'byCategory', cat] as const,
  byStatus: (s: string) => ['requests', 'byStatus', s] as const,
  byParecerista: (uid: string) => ['requests', 'byParecerista', uid] as const,
}

/* ---- Queries ---- */

export function useRequest(id: string) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => getRequestById(id),
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useMyRequests() {
  const uid = useAuthStore((s) => s.userProfile?.id)
  return useQuery({
    queryKey: keys.byUser(uid ?? ''),
    queryFn: () => getRequestsByUser(uid!),
    staleTime: STALE,
    enabled: !!uid,
  })
}

export function useAdvisorRequests(email?: string) {
  return useQuery({
    queryKey: keys.byAdvisor(email ?? ''),
    queryFn: () => getRequestsByAdvisorEmail(email!),
    staleTime: STALE,
    enabled: !!email,
  })
}

export function useMeetingRequests(meetingId: string) {
  return useQuery({
    queryKey: keys.byMeeting(meetingId),
    queryFn: () => getRequestsByMeeting(meetingId),
    staleTime: STALE,
    enabled: !!meetingId,
  })
}

export function useRequestsByCategory(category: RequestCategory) {
  return useQuery({
    queryKey: keys.byCategory(category),
    queryFn: () => getRequestsByCategory(category),
    staleTime: STALE,
  })
}

export function useRequestsByStatus(status: string) {
  return useQuery({
    queryKey: keys.byStatus(status),
    queryFn: () => getRequestsByStatus(status),
    staleTime: STALE,
  })
}

export function useAllRequests() {
  return useQuery({
    queryKey: keys.all,
    queryFn: getAllRequests,
    staleTime: STALE,
  })
}

export function usePareceristaRequests(userId: string) {
  return useQuery({
    queryKey: keys.byParecerista(userId),
    queryFn: () => getRequestsByParecerista(userId),
    staleTime: STALE,
    enabled: !!userId,
  })
}

/* ---- Mutations ---- */

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; status: string; actor: string; comment?: string }) => {
      return updateRequestStatus(vars.id, vars.status, vars.comment)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}

export function useUpdateRequestDetails() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; details: Record<string, unknown> }) =>
      updateRequestDetails(vars.id, vars.details),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}

export function useDeleteRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}

export function useAssignMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { requestId: string; meetingId: string }) =>
      assignRequestToMeeting(vars.requestId, vars.meetingId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}

export function useAssignParecerista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { requestId: string; pareceristId: string }) =>
      assignParecerista(vars.requestId, vars.pareceristId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }) },
  })
}
