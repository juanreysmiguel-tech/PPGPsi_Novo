import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { EMAIL_SECRETARIA } from '../config'

const db = getFirestore()

/**
 * Send notification email. Called via Cloud Functions callable.
 * In production, replace with SendGrid or Firebase Extension "Trigger Email".
 * For now, creates a document in a `mail` collection that can be picked up
 * by the Firebase Trigger Email extension.
 */
export const sendNotificationEmail = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    const { to, subject, templateId, data: templateData } = request.data as {
      to: string
      subject: string
      templateId: string
      data: Record<string, unknown>
    }

    if (!to || !subject) {
      throw new HttpsError('invalid-argument', 'Missing to or subject.')
    }

    // Create mail document for Firebase Trigger Email extension
    await db.collection('mail').add({
      to,
      message: {
        subject,
        html: buildEmailHtml(templateId, templateData),
      },
      createdAt: new Date(),
    })

    return { success: true }
  },
)

/**
 * Create in-app notification document.
 */
export async function createInAppNotification(
  userId: string,
  tipo: string,
  titulo: string,
  mensagem: string,
  requestId?: string,
): Promise<void> {
  await db.collection('notifications').add({
    idUsuario: userId,
    tipo,
    titulo,
    mensagem,
    data: new Date(),
    lido: false,
    idSolicitacao: requestId ?? null,
  })
}

function buildEmailHtml(templateId: string, data: Record<string, unknown>): string {
  const name = String(data.name ?? 'Usuario')
  const message = String(data.message ?? '')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Inter', Arial, sans-serif; background: #f8fafc; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #004b85; margin: 0;">PPGPsi - UFSCar</h2>
        </div>
        <p>Ola, <strong>${name}</strong>,</p>
        <p>${message}</p>
        ${data.link ? `<p><a href="${String(data.link)}" style="display: inline-block; background: #004b85; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px;">Ver Detalhes</a></p>` : ''}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          Este e-mail foi enviado automaticamente pelo sistema PPGPsi.<br>
          Em caso de duvidas, entre em contato: ${EMAIL_SECRETARIA}
        </p>
      </div>
    </body>
    </html>
  `
}
