import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMeetingById, getAllMeetings, getOpenMeetings, findMeetingForDate,
  createMeeting, updateMeeting, type CreateMeetingData,
} from '@/services/firestore/meetings'
import type { MeetingStatus } from '@/types'

const STALE = 5 * 60 * 1000

const keys = {
  all: ['meetings'] as const,
  byId: (id: string) => ['meetings', 'byId', id] as const,
  open: ['meetings', 'open'] as const,
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => getMeetingById(id),
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useAllMeetings() {
  return useQuery({
    queryKey: keys.all,
    queryFn: getAllMeetings,
    staleTime: STALE,
  })
}

export function useOpenMeetings() {
  return useQuery({
    queryKey: keys.open,
    queryFn: getOpenMeetings,
    staleTime: STALE,
  })
}

export function useMeetingForDate(date: Date | null) {
  return useQuery({
    queryKey: ['meetings', 'forDate', date?.toISOString()],
    queryFn: () => findMeetingForDate(date!),
    staleTime: STALE,
    enabled: !!date,
  })
}

export function useCreateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMeetingData) => createMeeting(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }) },
  })
}

export function useUpdateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; data: Partial<CreateMeetingData> & { status?: MeetingStatus } }) =>
      updateMeeting(vars.id, vars.data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }) },
  })
}
