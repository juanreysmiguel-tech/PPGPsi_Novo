import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { createInAppNotification } from '../notifications/sendEmail'

const db = getFirestore()

/**
 * Daily reminder function: sends reminders for approaching deadlines.
 * Checks meetings whose prazoFechamento is within 3 days and notifies
 * students with pending requests.
 * Runs daily at 08:00 AM Sao Paulo time.
 */
export const dailyReminders = onSchedule(
  {
    schedule: '0 8 * * *',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const now = new Date()
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    // Find meetings with approaching deadlines
    const meetingsSnap = await db
      .collection('meetings')
      .where('status', '==', 'Aberto')
      .where('prazoFechamento', '<=', Timestamp.fromDate(threeDaysFromNow))
      .where('prazoFechamento', '>=', Timestamp.fromDate(now))
      .get()

    for (const meetingDoc of meetingsSnap.docs) {
      const meeting = meetingDoc.data()
      const deadline = meeting.prazoFechamento?.toDate?.()
      if (!deadline) continue

      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Find all active users (Discente) to remind
      const usersSnap = await db
        .collection('users')
        .where('roles', 'array-contains', 'Discente')
        .where('status', '==', 'Ativo')
        .get()

      for (const userDoc of usersSnap.docs) {
        await createInAppNotification(
          userDoc.id,
          'lembrete',
          `Prazo em ${daysLeft} dia(s)!`,
          `A reuniao "${meeting.nome}" encerra o prazo para solicitacoes em ${daysLeft} dia(s). Envie suas solicitacoes antes de ${deadline.toLocaleDateString('pt-BR')}.`,
        )
      }
    }
  },
)

/**
 * Close meeting periods whose prazoFechamento has passed.
 */
export const meetingDeadlines = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const now = Timestamp.now()

    const snap = await db
      .collection('meetings')
      .where('status', '==', 'Aberto')
      .where('prazoFechamento', '<', now)
      .get()

    const batch = db.batch()
    for (const doc of snap.docs) {
      batch.update(doc.ref, { status: 'Fechado', updatedAt: now })
    }

    if (!snap.empty) {
      await batch.commit()
      console.log(`Closed ${snap.size} expired meeting periods.`)
    }
  },
)
