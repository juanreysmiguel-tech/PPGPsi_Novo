/**
 * React hooks for PTT (Produtos Técnicos/Tecnológicos) operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPTT,
  createPTT,
  updatePTT,
  deletePTT,
  getPTTsByAuthor,
  getPTTsByStatus,
  validatePTT,
  type PTT,
  type PTTStatus,
} from '@/services/firestore'

const PTT_KEYS = {
  all: ['ptts'] as const,
  detail: (pttId: string) => [...PTT_KEYS.all, pttId] as const,
  list: () => [...PTT_KEYS.all, 'list'] as const,
  byAuthor: (authorId: string) => [...PTT_KEYS.all, 'author', authorId] as const,
  byStatus: (status: PTTStatus) => [...PTT_KEYS.all, 'status', status] as const,
}

/**
 * Get PTT by ID
 */
export function usePTT(pttId: string) {
  return useQuery({
    queryKey: PTT_KEYS.detail(pttId),
    queryFn: () => getPTT(pttId),
    enabled: !!pttId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get PTTs by author (user's PTTs)
 */
export function usePTTsByAuthor(authorId: string) {
  return useQuery({
    queryKey: PTT_KEYS.byAuthor(authorId),
    queryFn: () => getPTTsByAuthor(authorId),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get PTTs by status (admin only)
 */
export function usePTTsByStatus(status: PTTStatus) {
  return useQuery({
    queryKey: PTT_KEYS.byStatus(status),
    queryFn: () => getPTTsByStatus(status),
    enabled: !!status,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Mutation: Create PTT
 */
export function useCreatePTT() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPTT,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PTT_KEYS.byAuthor(variables.authorId),
      })
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.list() })
    },
  })
}

/**
 * Mutation: Update PTT
 */
export function useUpdatePTT() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pttId, data }: { pttId: string; data: Partial<Omit<PTT, 'id' | 'createdAt'>> }) =>
      updatePTT(pttId, data),
    onSuccess: (_, { pttId }) => {
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.detail(pttId) })
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.all })
    },
  })
}

/**
 * Mutation: Delete PTT
 */
export function useDeletePTT() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePTT,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.all })
    },
  })
}

/**
 * Mutation: Validate PTT (admin only)
 */
export function useValidatePTT() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pttId,
      validatedBy,
      notes,
    }: {
      pttId: string
      validatedBy: string
      notes?: string
    }) => validatePTT(pttId, validatedBy, notes),
    onSuccess: (_, { pttId }) => {
      queryClient.invalidateQueries({ queryKey: PTT_KEYS.detail(pttId) })
      queryClient.invalidateQueries({
        queryKey: PTT_KEYS.byStatus('submetido'),
      })
      queryClient.invalidateQueries({
        queryKey: PTT_KEYS.byStatus('validado'),
      })
    },
  })
}
