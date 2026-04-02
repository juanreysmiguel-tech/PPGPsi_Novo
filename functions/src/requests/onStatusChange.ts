import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'
import { createInAppNotification } from '../notifications/sendEmail'

const db = getFirestore()

/**
 * Trigger: fires when a request document is updated.
 * Checks if the status changed and sends appropriate notifications.
 * Replicates the notification logic from code.gs processSecretariaAction / submitCGAction.
 */
export const onStatusChange = onDocumentUpdated(
  { document: 'requests/{requestId}', region: 'southamerica-east1' },
  async (event) => {
    const before = event.data?.before?.data()
    const after = event.data?.after?.data()
    if (!before || !after) return

    const oldStatus = before.status ?? ''
    const newStatus = after.status ?? ''

    // Only proceed if status actually changed
    if (oldStatus === newStatus) return

    const requestId = event.params.requestId
    const userId = after.idUsuario ?? ''
    const tipoSolicitacao = after.tipoSolicitacao ?? ''

    if (!userId) return

    // Determine notification type and message
    const { tipo, titulo, mensagem } = getNotificationContent(newStatus, tipoSolicitacao)

    // Create in-app notification for the student
    await createInAppNotification(userId, tipo, titulo, mensagem, requestId)

    // If there's an advisor email, notify them too
    const advisorEmail = after.emailOrientador
    if (advisorEmail) {
      const advisorUser = await findUserByEmail(advisorEmail)
      if (advisorUser) {
        await createInAppNotification(
          advisorUser.id,
          tipo,
          `Orientando: ${titulo}`,
          `Solicitacao de ${after.nomeAluno ?? 'aluno'}: ${mensagem}`,
          requestId,
        )
      }
    }
  },
)

function getNotificationContent(status: string, tipo: string): { tipo: string; titulo: string; mensagem: string } {
  const s = status.toLowerCase()

  if (s.includes('aprovado na cpg') || s.includes('ad referendum')) {
    return {
      tipo: 'aprovado',
      titulo: 'Solicitacao Aprovada pela CPG',
      mensagem: `Sua solicitacao "${tipo}" foi aprovada.`,
    }
  }
  if (s.includes('aprovado com ressalvas')) {
    return {
      tipo: 'aprovado_ressalvas',
      titulo: 'Solicitacao Aprovada com Ressalvas',
      mensagem: `Sua solicitacao "${tipo}" foi aprovada com ressalvas. Verifique os detalhes.`,
    }
  }
  if (s.includes('aprovado pela cg')) {
    return {
      tipo: 'aprovado_cg',
      titulo: 'Auxilio Aprovado pelo CG',
      mensagem: `Seu auxilio financeiro "${tipo}" foi aprovado pelo Conselho de Gestao.`,
    }
  }
  if (s.includes('indeferido') || s.includes('reprovado') || s.includes('recusado')) {
    return {
      tipo: 'reprovado',
      titulo: 'Solicitacao Indeferida',
      mensagem: `Sua solicitacao "${tipo}" foi indeferida. Verifique a justificativa.`,
    }
  }
  if (s.includes('elucidacao') || s.includes('ajustes')) {
    return {
      tipo: 'elucidacao',
      titulo: 'Solicitacao Retornada para Ajustes',
      mensagem: `Sua solicitacao "${tipo}" foi retornada para esclarecimentos. Verifique os comentarios.`,
    }
  }
  if (s.includes('prestacao de contas')) {
    return {
      tipo: 'prestacao',
      titulo: 'Prestacao de Contas Solicitada',
      mensagem: `Apresente a prestacao de contas para "${tipo}".`,
    }
  }
  if (s.includes('aguardando deposito')) {
    return {
      tipo: 'deposito',
      titulo: 'Aguardando Deposito',
      mensagem: `Sua prestacao de contas de "${tipo}" foi aprovada. Aguardando deposito financeiro.`,
    }
  }
  if (s.includes('concluido') || s.includes('arquivado')) {
    return {
      tipo: 'concluido',
      titulo: 'Solicitacao Concluida',
      mensagem: `Sua solicitacao "${tipo}" foi concluida e arquivada.`,
    }
  }

  return {
    tipo: 'status',
    titulo: 'Status Atualizado',
    mensagem: `O status de "${tipo}" foi alterado para: ${status}`,
  }
}

async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  const snap = await db.collection('users').where('email', '==', email).limit(1).get()
  if (snap.empty) return null
  return { id: snap.docs[0].id }
}
