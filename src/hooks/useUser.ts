import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserById, getUserByEmail, getAllUsers, getUsersByRole,
  getStudentsByAdvisor, updateUser, updateUserContact, addUserDraft,
} from '@/services/firestore/users'
import { updateUserRoles as callSyncUserClaims } from '@/services/api'
import { refreshCurrentUserProfile } from '@/services/refreshProfile'
import { auth } from '@/config/firebase'
import type { User, Role } from '@/types'
import { useAuthStore } from '@/stores/authStore'

const STALE = 5 * 60 * 1000

const keys = {
  all: ['users'] as const,
  byId: (id: string) => ['users', 'byId', id] as const,
  byEmail: (email: string) => ['users', 'byEmail', email] as const,
  byRole: (role: Role) => ['users', 'byRole', role] as const,
  studentsByAdvisor: (email: string) => ['users', 'students', email] as const,
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => getUserById(id),
    staleTime: STALE,
    enabled: !!id,
  })
}

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: keys.byEmail(email),
    queryFn: () => getUserByEmail(email),
    staleTime: STALE,
    enabled: !!email,
  })
}

export function useAllUsers() {
  return useQuery({
    queryKey: keys.all,
    queryFn: getAllUsers,
    staleTime: STALE,
  })
}

export function useUsersByRole(role: Role) {
  return useQuery({
    queryKey: keys.byRole(role),
    queryFn: () => getUsersByRole(role),
    staleTime: STALE,
    enabled: !!role,
  })
}

export function useStudentsByAdvisor(advisorEmail?: string) {
  const profile = useAuthStore((s) => s.userProfile)
  const email = advisorEmail ?? profile?.email ?? ''
  return useQuery({
    queryKey: keys.studentsByAdvisor(email),
    queryFn: () => getStudentsByAdvisor(email),
    staleTime: STALE,
    enabled: !!email,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; data: Partial<User> }) =>
      updateUser(vars.id, vars.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }) },
  })
}

/** Atualiza Firestore, sincroniza custom claims (Cloud Function) e refresca sessão se for o próprio usuário. */
export function useUpdateUserWithClaimsSync() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; data: Partial<User> }) => {
      await updateUser(vars.id, vars.data)
      if (vars.data.roles != null && vars.data.roles.length > 0) {
        await callSyncUserClaims({ userId: vars.id, roles: [...vars.data.roles] })
      }
      if (auth.currentUser?.uid === vars.id) {
        await refreshCurrentUserProfile()
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useCreateUserDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      email: string
      nome: string
      roles: User['roles']
      status: User['status']
    }) => addUserDraft(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUserContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: string
      contact: { telefone?: string; celular?: string; endereco?: string; emergenciaNome?: string; emergenciaTel?: string }
    }) => updateUserContact(vars.id, vars.contact),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }) },
  })
}
