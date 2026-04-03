/**
 * Firestore service for research projects
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export type ProjectStatus = 'ativo' | 'concluido' | 'suspenso'

export interface Project {
  id?: string
  title: string
  labId: string
  leaderId: string
  memberIds: string[]
  funder: string
  startDate: Timestamp
  endDate: Timestamp
  status: ProjectStatus
  description: string
  website?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Get a project by ID
 */
export async function getProject(projId: string): Promise<Project | null> {
  try {
    const docRef = doc(db, 'projects', projId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as Project) } : null
  } catch (error) {
    console.error('Error fetching project:', error)
    throw error
  }
}

/**
 * Create a new project
 */
export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now()
    const docRef = doc(collection(db, 'projects'))
    await setDoc(docRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

/**
 * Update a project
 */
export async function updateProject(projId: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, 'projects', projId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projId: string) {
  try {
    const docRef = doc(db, 'projects', projId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

/**
 * Get projects by laboratory
 */
export async function getProjectsByLab(labId: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('labId', '==', labId),
      orderBy('startDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))
  } catch (error) {
    console.error('Error fetching projects by lab:', error)
    throw error
  }
}

/**
 * Get projects by leader
 */
export async function getProjectsByLeader(leaderId: string): Promise<Project[]> {
  try {
    const q = query(collection(db, 'projects'), where('leaderId', '==', leaderId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))
  } catch (error) {
    console.error('Error fetching projects by leader:', error)
    throw error
  }
}

/**
 * Get active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('status', '==', 'ativo'),
      orderBy('startDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))
  } catch (error) {
    console.error('Error fetching active projects:', error)
    throw error
  }
}

/**
 * Get all projects (admin only)
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const q = query(collection(db, 'projects'), orderBy('startDate', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))
  } catch (error) {
    console.error('Error fetching all projects:', error)
    throw error
  }
}

/**
 * Add member to project
 */
export async function addProjectMember(projId: string, memberId: string) {
  try {
    const proj = await getProject(projId)
    if (!proj) throw new Error('Project not found')

    const members = new Set(proj.memberIds)
    members.add(memberId)

    await updateProject(projId, {
      memberIds: Array.from(members),
    })
  } catch (error) {
    console.error('Error adding project member:', error)
    throw error
  }
}

/**
 * Remove member from project
 */
export async function removeProjectMember(projId: string, memberId: string) {
  try {
    const proj = await getProject(projId)
    if (!proj) throw new Error('Project not found')

    const members = new Set(proj.memberIds)
    members.delete(memberId)

    await updateProject(projId, {
      memberIds: Array.from(members),
    })
  } catch (error) {
    console.error('Error removing project member:', error)
    throw error
  }
}
