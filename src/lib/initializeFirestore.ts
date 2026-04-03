/**
 * Initialize Firestore collections with empty documents
 * Run this once to set up the database structure
 */

import { db } from '@/config/firebase'
import { collection, addDoc, deleteDoc, Timestamp } from 'firebase/firestore'

export async function initializeFirestoreCollections() {
  try {
    console.log('Initializing Firestore collections...')

    const collections = [
      {
        name: 'profiles',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
      {
        name: 'publications',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
      {
        name: 'ptts',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
      {
        name: 'laboratories',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
      {
        name: 'projects',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
      {
        name: 'news_feed',
        initDoc: { dummy: true, createdAt: Timestamp.now() }
      },
    ]

    for (const col of collections) {
      try {
        const docRef = await addDoc(collection(db, col.name), col.initDoc)
        console.log(`✓ Created ${col.name} with init doc: ${docRef.id}`)

        // Delete the dummy doc
        await deleteDoc(docRef)
        console.log(`✓ Cleaned up ${col.name}`)
      } catch (error: any) {
        if (error.code === 'permission-denied') {
          console.warn(`⚠️ ${col.name}: Permission denied. Check security rules.`)
        } else {
          console.warn(`⚠️ ${col.name}: ${error.message}`)
        }
      }
    }

    console.log('Firestore initialization complete!')
    return true
  } catch (error) {
    console.error('Error initializing Firestore:', error)
    return false
  }
}

/**
 * Call this from useEffect in App component or a setup page
 */
export async function ensureCollectionsExist() {
  const initialized = localStorage.getItem('firestore-initialized')

  if (!initialized) {
    const success = await initializeFirestoreCollections()
    if (success) {
      localStorage.setItem('firestore-initialized', 'true')
    }
  }
}
