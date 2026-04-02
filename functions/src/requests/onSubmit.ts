import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { FINANCIAL_STATUS } from '../config'

const db = getFirestore()

/**
 * Trigger: fires when a new request document is created.
 * Replicates code.gs ~line 1400 (auto-assign meeting) and ~line 3200 (round-robin CG).
 *
 * 1. Auto-assign to the open meeting whose period contains the request date.
 * 2. If financial, auto-assign a CG parecerista via round-robin.
 * 3. Set initial status based on category.
 */
export const onRequestSubmit = onDocumentCreated(
  { document: 'requests/{requestId}', region: 'southamerica-east1' },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const data = snap.data()
    const update: Record<string, unknown> = {}

    // 1. Auto-assign meeting
    const meetingId = await findMeetingForDate(data.dataCriacao ?? Timestamp.now())
    if (meetingId) {
      update.idReuniao = meetingId
      // Increment request count on the meeting
      const meetingRef = db.collection('meetings').doc(meetingId)
      await db.runTransaction(async (tx) => {
        const meetingSnap = await tx.get(meetingRef)
        const currentCount = meetingSnap.data()?.requestCount ?? 0
        tx.update(meetingRef, { requestCount: currentCount + 1 })
      })
    }

    // 2. If financial, auto-assign CG parecerista (round-robin)
    const categoria = data.categoria ?? ''
    if (categoria === 'financial') {
      const pareceristId = await assignCGRoundRobin()
      if (pareceristId) {
        update.idParecerista = pareceristId
      }
      update.status = FINANCIAL_STATUS.PENDING_ADVISOR
    }

    // 3. Apply updates if any
    if (Object.keys(update).length > 0) {
      await snap.ref.update(update)
    }
  },
)

/**
 * Finds an open meeting whose period (dataInicioPeriodo to dataFimPeriodo)
 * contains the given timestamp. Returns the meeting doc ID or null.
 */
async function findMeetingForDate(ts: Timestamp): Promise<string | null> {
  const snap = await db
    .collection('meetings')
    .where('status', '==', 'Aberto')
    .orderBy('dataReuniao', 'asc')
    .get()

  for (const doc of snap.docs) {
    const d = doc.data()
    const start = d.dataInicioPeriodo as Timestamp
    const end = d.dataFimPeriodo as Timestamp
    if (start && end && ts >= start && ts <= end) {
      return doc.id
    }
  }
  return null
}

/**
 * Round-robin CG assignment. Finds the CG member with the fewest
 * pending assignments and assigns the next request to them.
 * Replicates code.gs ~line 3200.
 */
async function assignCGRoundRobin(): Promise<string | null> {
  // Get all CG members
  const usersSnap = await db
    .collection('users')
    .where('roles', 'array-contains', 'CG')
    .where('status', '==', 'Ativo')
    .get()

  if (usersSnap.empty) return null

  // Count pending assignments per CG member
  const counts: Record<string, number> = {}
  for (const userDoc of usersSnap.docs) {
    counts[userDoc.id] = 0
  }

  const pendingSnap = await db
    .collection('requests')
    .where('categoria', '==', 'financial')
    .where('status', 'in', [
      FINANCIAL_STATUS.PENDING_CG,
      FINANCIAL_STATUS.PENDING_ADVISOR,
    ])
    .get()

  for (const reqDoc of pendingSnap.docs) {
    const pid = reqDoc.data().idParecerista
    if (pid && counts[pid] !== undefined) {
      counts[pid]++
    }
  }

  // Find member with fewest assignments
  let minId: string | null = null
  let minCount = Infinity
  for (const [uid, count] of Object.entries(counts)) {
    if (count < minCount) {
      minCount = count
      minId = uid
    }
  }

  return minId
}
