import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { EnvMissingScreen } from './components/EnvMissingScreen'

const ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function hasFirebaseEnv(): boolean {
  return ENV_KEYS.every((k) => {
    const v = import.meta.env[k as keyof ImportMetaEnv]
    return typeof v === 'string' && v.trim().length > 0
  })
}

const root = document.getElementById('root')!

if (!hasFirebaseEnv()) {
  createRoot(root).render(
    <StrictMode>
      <EnvMissingScreen />
    </StrictMode>,
  )
} else {
  void import('./bootstrap')
}
