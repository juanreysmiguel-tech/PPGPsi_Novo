import { useState, useCallback } from 'react'
import { uploadRequestFile, uploadProfilePhoto, type UploadProgress } from '@/services/storage'

interface UseFileUploadReturn {
  upload: (file: File) => Promise<string>
  progress: UploadProgress | null
  isUploading: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for uploading files to Firebase Storage with progress tracking.
 * @param scope - 'request' for request files, 'profile' for user photos
 * @param scopeId - requestId or userId depending on scope
 */
export function useFileUpload(
  scope: 'request' | 'profile',
  scopeId: string,
): UseFileUploadReturn {
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(null)
    setIsUploading(false)
    setError(null)
  }, [])

  const upload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true)
    setError(null)
    setProgress(null)

    try {
      const fn = scope === 'request' ? uploadRequestFile : uploadProfilePhoto
      const url = await fn(scopeId, file, setProgress)
      setIsUploading(false)
      return url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no upload'
      setError(msg)
      setIsUploading(false)
      throw err
    }
  }, [scope, scopeId])

  return { upload, progress, isUploading, error, reset }
}

/**
 * Hook for uploading multiple files sequentially.
 */
export function useMultiFileUpload(requestId: string) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadAll = useCallback(async (fileList: File[]): Promise<{ name: string; url: string }[]> => {
    setIsUploading(true)
    const results: { name: string; url: string }[] = []

    for (const file of fileList) {
      setCurrentFile(file.name)
      const url = await uploadRequestFile(requestId, file, setProgress)
      results.push({ name: file.name, url })
    }

    setFiles(results)
    setIsUploading(false)
    setCurrentFile(null)
    setProgress(null)
    return results
  }, [requestId])

  return { uploadAll, files, currentFile, progress, isUploading }
}
