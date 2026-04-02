/**
 * React hooks for meetings using Firestore
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  getMeetingById,
  deleteMeeting,
  getMeetingsByDateRange,
  updateMeetingStatus,
} from '@/services/firestore/meetings'
import type { Meeting } from '@/types'

const STALE = 5 * 60 * 1000 // 5 minutes

const keys = {
  all: ['meetings'] as const,
  active: ['meetings', 'active'] as const,
  byId: (id: string) => ['meetings', 'byId', id] as const,
  byDateRange: (start: string, end: string) => ['meetings', 'dateRange', start, end] as const,
}

/**
 * Get meetings (active or all)
 * Substitui: useMeetingRequests() em useRequests.ts
 */
export function useMeetings(activeOnly = true) {
  return useQuery({
    queryKey: activeOnly ? keys.active : keys.all,
    queryFn: () => getMeetings(activeOnly),
    staleTime: STALE,
  })
}

/**
 * Get single meeting by ID
 */
export function useMeetingById(id: string) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => getMeetingById(id),
    staleTime: STALE,
    enabled: !!id,
  })
}

/**
 * Get meetings by date range
 */
export function useMeetingsByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: keys.byDateRange(startDate.toISOString(), endDate.toISOString()),
    queryFn: () => getMeetingsByDateRange(startDate, endDate),
    staleTime: STALE,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Create meeting
 */
export function useCreateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Meeting>) => createMeeting(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.active })
    },
  })
}

/**
 * Update meeting
 */
export function useUpdateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Meeting> }) =>
      updateMeeting(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.active })
    },
  })
}

/**
 * Delete meeting
 */
export function useDeleteMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.active })
    },
  })
}

/**
 * Update meeting status
 */
export function useUpdateMeetingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateMeetingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.active })
    },
  })
}
