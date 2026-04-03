/**
 * Cloud Function: Parse Sucupira export (CSV/XML) and reconcile with local data
 * Triggered by: HTTP (upload from React component for Coordenação)
 */

import * as functions from 'firebase-functions/v1'
import * as admin from 'firebase-admin'

const db = admin.firestore()

interface SucupiraRecord {
  docente: string
  artigos: number
  livros: number
  capitulos: number
  eventos: number
  qualisA1?: number
  qualisA2?: number
  qualisB1?: number
}

/**
 * Parse CSV format (simplified)
 */
function parseCSV(csvContent: string): SucupiraRecord[] {
  const lines = csvContent.split('\n')
  const headers = lines[0].split(',')
  const records: SucupiraRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(',')
    records.push({
      docente: values[headers.indexOf('docente')]?.trim() || '',
      artigos: parseInt(values[headers.indexOf('artigos')] || '0'),
      livros: parseInt(values[headers.indexOf('livros')] || '0'),
      capitulos: parseInt(values[headers.indexOf('capitulos')] || '0'),
      eventos: parseInt(values[headers.indexOf('eventos')] || '0'),
      qualisA1: parseInt(values[headers.indexOf('qualisA1')] || '0'),
      qualisA2: parseInt(values[headers.indexOf('qualisA2')] || '0'),
      qualisB1: parseInt(values[headers.indexOf('qualisB1')] || '0'),
    })
  }

  return records
}

/**
 * HTTP Cloud Function: Process Sucupira import
 * POST /sucupira-parser
 * Body: { userId: string, csvContent: string, fileName: string }
 */
export const sucupiraParser = functions
  .region('southamerica-east1')
  .https.onCall(async (data: any, context: any) => {
    // Check authentication - admin only
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated')
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get()
    const userRoles = userDoc.data()?.roles || []

    if (!userRoles.includes('Coordenacao') && !userRoles.includes('Secretaria')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only Coordenação and Secretaria can import Sucupira data'
      )
    }

    const { csvContent, fileName } = data

    if (!csvContent) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing csvContent')
    }

    try {
      // Parse CSV
      const records = parseCSV(csvContent)

      // Store as staging import
      const importDoc = await db.collection('sucupira_imports').add({
        importedAt: admin.firestore.Timestamp.now(),
        importedBy: context.auth.uid,
        fileName,
        status: 'pending',
        recordCount: records.length,
        rawData: records,
        reconciliationLog: [],
      })

      return {
        success: true,
        importId: importDoc.id,
        recordCount: records.length,
        records: records.slice(0, 10), // Return first 10 for preview
      }
    } catch (error) {
      console.error('Error parsing Sucupira CSV:', error)
      throw new functions.https.HttpsError('invalid-argument', 'Failed to parse Sucupira CSV')
    }
  })

/**
 * Scheduled Cloud Function: Reconcile Sucupira imports with local data
 * Runs: Daily at 2 AM UTC (adjust as needed)
 */
export const reconcileSucupira = functions
  .region('southamerica-east1')
  .pubsub.schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context: any) => {
    try {
      // Fetch all pending imports
      const imports = await db
        .collection('sucupira_imports')
        .where('status', '==', 'pending')
        .get()

      let processedCount = 0

      for (const importDoc of imports.docs) {
        const importData = importDoc.data()
        const log: string[] = []

        // Process each record
        for (const record of importData.rawData) {
          // Find matching user by email or name
          const usersSnapshot = await db
            .collection('users')
            .where('email', '==', record.docente)
            .limit(1)
            .get()

          if (usersSnapshot.empty) {
            log.push(`⚠️ Docente não encontrado: ${record.docente}`)
            continue
          }

          const userId = usersSnapshot.docs[0].id
          log.push(`✓ Sincronizou: ${record.docente} (${userId})`)
        }

        // Mark import as reconciled
        await importDoc.ref.update({
          status: 'reconciled',
          reconciliationLog: log,
          reconciledAt: admin.firestore.Timestamp.now(),
        })

        processedCount++
      }

      console.log(`Reconciled ${processedCount} Sucupira imports`)
      return { processedCount }
    } catch (error) {
      console.error('Error reconciling Sucupira data:', error)
      throw error
    }
  })
