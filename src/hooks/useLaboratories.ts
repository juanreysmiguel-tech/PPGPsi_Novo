/**
 * React hooks for laboratory operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getLaboratory,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  getLaboratoriesByLeader,
  getActiveLaboratories,
  getAllLaboratories,
  addLabMember,
  removeLabMember,
  type Laboratory,
} from '@/services/firestore'

const LAB_KEYS = {
  all: ['laboratories'] as const,
  detail: (labId: string) => [...LAB_KEYS.all, labId] as const,
  list: () => [...LAB_KEYS.all, 'list'] as const,
  active: () => [...LAB_KEYS.all, 'active'] as const,
  byLeader: (leaderId: string) => [...LAB_KEYS.all, 'leader', leaderId] as const,
}

/**
 * Get laboratory by ID
 */
export function useLaboratory(labId: string) {
  return useQuery({
    queryKey: LAB_KEYS.detail(labId),
    queryFn: () => getLaboratory(labId),
    enabled: !!labId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get all active laboratories
 */
export function useActiveLaboratories() {
  return useQuery({
    queryKey: LAB_KEYS.active(),
    queryFn: getActiveLaboratories,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get all laboratories (admin only)
 */
export function useAllLaboratories() {
  return useQuery({
    queryKey: LAB_KEYS.list(),
    queryFn: getAllLaboratories,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get laboratories by leader
 */
export function useLaboratoriesByLeader(leaderId: string) {
  return useQuery({
    queryKey: LAB_KEYS.byLeader(leaderId),
    queryFn: () => getLaboratoriesByLeader(leaderId),
    enabled: !!leaderId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation: Create laboratory
 */
export function useCreateLaboratory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLaboratory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LAB_KEYS.byLeader(variables.leaderId),
      })
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.active() })
    },
  })
}

/**
 * Mutation: Update laboratory
 */
export function useUpdateLaboratory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ labId, data }: { labId: string; data: Partial<Omit<Laboratory, 'id' | 'createdAt'>> }) =>
      updateLaboratory(labId, data),
    onSuccess: (_, { labId }) => {
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.detail(labId) })
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.active() })
    },
  })
}

/**
 * Mutation: Delete laboratory
 */
export function useDeleteLaboratory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLaboratory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.active() })
    },
  })
}

/**
 * Mutation: Add member to laboratory
 */
export function useAddLabMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ labId, memberId }: { labId: string; memberId: string }) =>
      addLabMember(labId, memberId),
    onSuccess: (_, { labId }) => {
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.detail(labId) })
    },
  })
}

/**
 * Mutation: Remove member from laboratory
 */
export function useRemoveLabMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ labId, memberId }: { labId: string; memberId: string }) =>
      removeLabMember(labId, memberId),
    onSuccess: (_, { labId }) => {
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.detail(labId) })
    },
  })
}
