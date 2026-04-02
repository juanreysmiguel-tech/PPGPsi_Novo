import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from '@/config/firebase'

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  percent: number
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error'
}

/**
 * Upload a file to Firebase Storage with progress tracking.
 * Path convention: `requests/{requestId}/{filename}` or `users/{uid}/foto`
 */
export function uploadFile(
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as UploadProgress['state'],
        })
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}

/**
 * Upload a file for a specific request.
 */
export function uploadRequestFile(
  requestId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  return uploadFile(`requests/${requestId}/${safeName}`, file, onProgress)
}

/**
 * Upload user profile photo.
 */
export function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  return uploadFile(`users/${userId}/foto.${ext}`, file, onProgress)
}

/**
 * Get the download URL for a storage path.
 */
export async function getFileUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path))
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path))
}

/**
 * Extract the storage path from a download URL for deletion.
 */
export function pathFromUrl(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url)
    const match = decoded.match(/\/o\/(.+?)\?/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}
