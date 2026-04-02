import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { FINANCIAL_STATUS } from '../config'

const db = getFirestore()

/**
 * Daily scheduled function: archives completed requests.
 * Moves requests with status "Concluido / Arquivado" to archivedRequests collection.
 * Runs daily at 02:00 AM Sao Paulo time.
 */
export const dailyArchive = onSchedule(
  {
    schedule: '0 2 * * *',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const snap = await db
      .collection('requests')
      .where('status', '==', FINANCIAL_STATUS.COMPLETED)
      .get()

    if (snap.empty) return

    const batch = db.batch()
    let count = 0

    for (const doc of snap.docs) {
      const data = doc.data()
      // Copy to archivedRequests
      const archiveRef = db.collection('archivedRequests').doc(doc.id)
      batch.set(archiveRef, { ...data, archivedAt: new Date() })
      // Delete from requests
      batch.delete(doc.ref)
      count++

      // Firestore batch limit is 500
      if (count % 450 === 0) {
        await batch.commit()
      }
    }

    if (count % 450 !== 0) {
      await batch.commit()
    }

    console.log(`Archived ${count} completed requests.`)
  },
)
