/**
 * React hooks for scientific profile operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProfile,
  setProfile,
  updateProfile,
  getAllProfiles,
  getProfilesByResearchLine,
  updateLastLattesSync,
  type ScientificProfile,
} from '@/services/firestore'

const PROFILE_KEYS = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...PROFILE_KEYS.all, userId] as const,
  list: () => [...PROFILE_KEYS.all, 'list'] as const,
  byResearchLine: (line: string) => [...PROFILE_KEYS.all, 'researchLine', line] as const,
}

/**
 * Get current user's profile
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: PROFILE_KEYS.detail(userId),
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get all profiles (admin only)
 */
export function useAllProfiles() {
  return useQuery({
    queryKey: PROFILE_KEYS.list(),
    queryFn: getAllProfiles,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get profiles by research line
 */
export function useProfilesByResearchLine(researchLine: string) {
  return useQuery({
    queryKey: PROFILE_KEYS.byResearchLine(researchLine),
    queryFn: () => getProfilesByResearchLine(researchLine),
    enabled: !!researchLine,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Mutation: Update or create profile
 */
export function useSetProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<ScientificProfile> }) =>
      setProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) })
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.list() })
    },
  })
}

/**
 * Mutation: Update specific profile fields
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: Partial<Omit<ScientificProfile, 'userId' | 'createdAt'>>
    }) => updateProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) })
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.list() })
    },
  })
}

/**
 * Mutation: Update Lattes sync timestamp
 */
export function useUpdateLastLattesSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLastLattesSync,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) })
    },
  })
}
