/**
 * React hooks for research project operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByLab,
  getProjectsByLeader,
  getActiveProjects,
  getAllProjects,
  addProjectMember,
  removeProjectMember,
  type Project,
} from '@/services/firestore'

const PROJ_KEYS = {
  all: ['projects'] as const,
  detail: (projId: string) => [...PROJ_KEYS.all, projId] as const,
  list: () => [...PROJ_KEYS.all, 'list'] as const,
  active: () => [...PROJ_KEYS.all, 'active'] as const,
  byLab: (labId: string) => [...PROJ_KEYS.all, 'lab', labId] as const,
  byLeader: (leaderId: string) => [...PROJ_KEYS.all, 'leader', leaderId] as const,
}

/**
 * Get project by ID
 */
export function useProject(projId: string) {
  return useQuery({
    queryKey: PROJ_KEYS.detail(projId),
    queryFn: () => getProject(projId),
    enabled: !!projId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get all active projects
 */
export function useActiveProjects() {
  return useQuery({
    queryKey: PROJ_KEYS.active(),
    queryFn: getActiveProjects,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get all projects (admin only)
 */
export function useAllProjects() {
  return useQuery({
    queryKey: PROJ_KEYS.list(),
    queryFn: getAllProjects,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get projects by laboratory
 */
export function useProjectsByLab(labId: string) {
  return useQuery({
    queryKey: PROJ_KEYS.byLab(labId),
    queryFn: () => getProjectsByLab(labId),
    enabled: !!labId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get projects by leader
 */
export function useProjectsByLeader(leaderId: string) {
  return useQuery({
    queryKey: PROJ_KEYS.byLeader(leaderId),
    queryFn: () => getProjectsByLeader(leaderId),
    enabled: !!leaderId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation: Create project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROJ_KEYS.byLab(variables.labId),
      })
      queryClient.invalidateQueries({
        queryKey: PROJ_KEYS.byLeader(variables.leaderId),
      })
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.active() })
    },
  })
}

/**
 * Mutation: Update project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projId, data }: { projId: string; data: Partial<Omit<Project, 'id' | 'createdAt'>> }) =>
      updateProject(projId, data),
    onSuccess: (_, { projId }) => {
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.detail(projId) })
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.active() })
    },
  })
}

/**
 * Mutation: Delete project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.active() })
    },
  })
}

/**
 * Mutation: Add member to project
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projId, memberId }: { projId: string; memberId: string }) =>
      addProjectMember(projId, memberId),
    onSuccess: (_, { projId }) => {
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.detail(projId) })
    },
  })
}

/**
 * Mutation: Remove member from project
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projId, memberId }: { projId: string; memberId: string }) =>
      removeProjectMember(projId, memberId),
    onSuccess: (_, { projId }) => {
      queryClient.invalidateQueries({ queryKey: PROJ_KEYS.detail(projId) })
    },
  })
}
