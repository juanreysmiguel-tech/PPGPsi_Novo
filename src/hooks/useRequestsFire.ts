/**
 * React hooks for requests using Firestore
 * Migrado de useRequests em useRequests.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  submitRequest,
  getRequests,
  getAllRequests,
  getArchivedRequests,
  getRequestById,
  updateRequestStatus,
  updateRequestMeeting,
  deleteRequest,
  archiveStudentRequests,
  getRequestsByStatus,
  getRequestsAssignedTo,
  updateRequest,
} from '@/services/firestore/requests'
import type { Request } from '@/types'

const STALE = 5 * 60 * 1000 // 5 minutes

const keys = {
  all: ['requests'] as const,
  byId: (id: string) => ['requests', 'byId', id] as const,
  byRole: (role: string, userId: string) => ['requests', 'byRole', role, userId] as const,
  byStatus: (status: string) => ['requests', 'byStatus', status] as const,
  assignedTo: (userId: string) => ['requests', 'assignedTo', userId] as const,
  archived: ['requests', 'archived'] as const,
}

/**
 * Get requests by role and user ID
 * Substitui: useRequests() em useRequests.ts
 */
export function useRequestsByRole(role: string, userId: string) {
  return useQuery({
    queryKey: keys.byRole(role, userId),
    queryFn: () => getRequests(role, userId),
    staleTime: STALE,
    enabled: !!userId && !!role,
  })
}

/**
 * Get all requests (admin)
 */
export function useAllRequests() {
  return useQuery({
    queryKey: keys.all,
    queryFn: getAllRequests,
    staleTime: STALE,
  })
}

/**
 * Get single request by ID
 */
export function useRequestById(id: string) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => getRequestById(id),
    staleTime: STALE,
    enabled: !!id,
  })
}

/**
 * Get archived requests
 */
export function useArchivedRequests() {
  return useQuery({
    queryKey: keys.archived,
    queryFn: getArchivedRequests,
    staleTime: STALE,
  })
}

/**
 * Get requests by status
 */
export function useRequestsByStatus(status: string) {
  return useQuery({
    queryKey: keys.byStatus(status),
    queryFn: () => getRequestsByStatus(status),
    staleTime: STALE,
    enabled: !!status,
  })
}

/**
 * Get requests assigned to a user (CG member)
 */
export function useRequestsAssignedTo(userId: string) {
  return useQuery({
    queryKey: keys.assignedTo(userId),
    queryFn: () => getRequestsAssignedTo(userId),
    staleTime: STALE,
    enabled: !!userId,
  })
}

/**
 * Submit new request
 */
export function useSubmitRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Request>) => submitRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

/**
 * Update request status
 */
export function useUpdateRequestStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      justification,
      observation,
    }: {
      id: string
      status: string
      justification?: string
      observation?: string
    }) => updateRequestStatus(id, status, justification, observation),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

/**
 * Update request meeting assignment
 */
export function useUpdateRequestMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, meetingId }: { id: string; meetingId: string }) =>
      updateRequestMeeting(id, meetingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

/**
 * Delete request
 */
export function useDeleteRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

/**
 * Archive student requests
 */
export function useArchiveStudentRequests() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => archiveStudentRequests(email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

/**
 * Generic update request
 */
export function useUpdateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Request> }) =>
      updateRequest(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}
