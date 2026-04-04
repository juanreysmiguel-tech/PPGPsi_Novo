import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

export const onMeetingCreate = onDocumentCreated(
  { document: 'reunioes/{meetingId}', region: 'southamerica-east1' },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const meeting = snap.data()
    const dataReuniao = meeting.dataReuniao?.toDate()
    if (!dataReuniao) return

    // Get all CG and Coordenacao members to send the calendar invite 
    // Usually these are the ones involved in CPG meetings
    const usersSnap = await db.collection('users').get()
    const attendees: string[] = []
    usersSnap.forEach(doc => {
      const u = doc.data()
      if (u.roles && (u.roles.includes('CG') || u.roles.includes('Coordenacao'))) {
        if (u.email) attendees.push(u.email)
      }
    })

    if (attendees.length === 0) return

    // End time is roughly 2 hours after start
    const endReuniao = new Date(dataReuniao.getTime() + 2 * 60 * 60 * 1000)

    // Generate .ics standard format string
    // This allows Gmail/Workspace to automatically recognize it as a calendar invite
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PPGPsi UFSCar//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${event.params.meetingId}@ppgpsi-ufscar.br`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(dataReuniao)}`,
      `DTEND:${formatIcsDate(endReuniao)}`,
      `SUMMARY:${meeting.nome || 'Reunião CPG - PPGPsi'}`,
      'DESCRIPTION:Reunião agendada através do sistema PPGPsi. Verifique a pauta no sistema oficial.',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    // Attach base64 to mail extension
    const attachments = [{
      filename: 'invite.ics',
      content: Buffer.from(icsContent).toString('base64'),
      encoding: 'base64',
      contentType: 'text/calendar; method=REQUEST'
    }]

    // Send the email via our mail queue (Trigger Email extension)
    const promises = attendees.map(email => {
      return db.collection('mail').add({
        to: email,
        message: {
          subject: 'Convite CPG: ' + (meeting.nome || 'Nova Reunião'),
          html: `<p>Uma nova Reunião foi agendada para <strong>${dataReuniao.toLocaleString('pt-BR')}</strong>.</p><p>Acesse o sistema PPGPsi para mais detalhes e não esqueça de adicionar este evento ao seu calendário Workspace pelo anexo!</p>`,
          attachments
        },
        createdAt: new Date()
      })
    })

    await Promise.all(promises)
  }
)

function formatIcsDate(date: Date): string {
  // Format to YYYYMMDDThhmmssZ
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
