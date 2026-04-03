/**
 * React hooks for publication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPublication,
  createPublication,
  updatePublication,
  deletePublication,
  getPublicationsByAuthor,
  getPublicationsByAuthorAndYear,
  getPublicationsByType,
  getAllPublications,
  getPublicationStats,
  batchCreatePublications,
  type Publication,
  type PublicationType,
} from '@/services/firestore'

const PUB_KEYS = {
  all: ['publications'] as const,
  detail: (pubId: string) => [...PUB_KEYS.all, pubId] as const,
  list: () => [...PUB_KEYS.all, 'list'] as const,
  byAuthor: (authorId: string) => [...PUB_KEYS.all, 'author', authorId] as const,
  byAuthorAndYear: (authorId: string, startYear: number, endYear: number) =>
    [...PUB_KEYS.all, 'author', authorId, 'year', startYear, endYear] as const,
  byType: (type: PublicationType) => [...PUB_KEYS.all, 'type', type] as const,
  stats: (authorIds: string[], startYear: number, endYear: number) =>
    [...PUB_KEYS.all, 'stats', authorIds.join(','), startYear, endYear] as const,
}

/**
 * Get publication by ID
 */
export function usePublication(pubId: string) {
  return useQuery({
    queryKey: PUB_KEYS.detail(pubId),
    queryFn: () => getPublication(pubId),
    enabled: !!pubId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get all publications (admin only)
 */
export function useAllPublications() {
  return useQuery({
    queryKey: PUB_KEYS.list(),
    queryFn: getAllPublications,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get publications by author
 */
export function usePublicationsByAuthor(authorId: string) {
  return useQuery({
    queryKey: PUB_KEYS.byAuthor(authorId),
    queryFn: () => getPublicationsByAuthor(authorId),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get publications by author and year (CAPES 4-year window)
 */
export function usePublicationsByAuthorAndYear(
  authorId: string,
  startYear: number,
  endYear: number
) {
  return useQuery({
    queryKey: PUB_KEYS.byAuthorAndYear(authorId, startYear, endYear),
    queryFn: () => getPublicationsByAuthorAndYear(authorId, startYear, endYear),
    enabled: !!authorId && startYear > 0 && endYear > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get publications by type
 */
export function usePublicationsByType(type: PublicationType) {
  return useQuery({
    queryKey: PUB_KEYS.byType(type),
    queryFn: () => getPublicationsByType(type),
    enabled: !!type,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get publication statistics
 */
export function usePublicationStats(
  authorIds: string[],
  startYear: number,
  endYear: number
) {
  return useQuery({
    queryKey: PUB_KEYS.stats(authorIds, startYear, endYear),
    queryFn: () => getPublicationStats(authorIds, startYear, endYear),
    enabled: authorIds.length > 0 && startYear > 0 && endYear > 0,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Mutation: Create publication
 */
export function useCreatePublication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPublication,
    onSuccess: (_, variables) => {
      if (variables.authorIds && variables.authorIds.length > 0) {
        queryClient.invalidateQueries({
          queryKey: PUB_KEYS.byAuthor(variables.authorIds[0]),
        })
      }
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.list() })
    },
  })
}

/**
 * Mutation: Batch create publications (used by importers)
 */
export function useBatchCreatePublications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreatePublications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.list() })
      // Invalidate all author-based queries (can't be more specific without knowing authors)
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.all })
    },
  })
}

/**
 * Mutation: Update publication
 */
export function useUpdatePublication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pubId, data }: { pubId: string; data: Partial<Omit<Publication, 'id' | 'createdAt'>> }) =>
      updatePublication(pubId, data),
    onSuccess: (_, { pubId, data }) => {
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.detail(pubId) })
      if (data.authorIds && data.authorIds.length > 0) {
        queryClient.invalidateQueries({
          queryKey: PUB_KEYS.byAuthor(data.authorIds[0]),
        })
      }
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.list() })
    },
  })
}

/**
 * Mutation: Delete publication
 */
export function useDeletePublication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PUB_KEYS.all })
    },
  })
}
