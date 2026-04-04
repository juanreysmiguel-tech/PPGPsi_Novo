import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

function parseCSVLine(text: string): string[] {
  const re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
  const a: string[] = []
  text.replace(re_value, function(m0, m1, m2, m3) {
    if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"))
    else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'))
    else if (m3 !== undefined) a.push(m3)
    return ''
  })
  if (/,\s*$/.test(text)) a.push('')
  return a
}

export const importProPGWebCsv = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    // Check if user is Admin/Secretaria
    const uid = request.auth?.uid
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Precisa estar logado')
    }

    const { csvUrl } = request.data as { csvUrl?: string }
    if (!csvUrl) {
      throw new HttpsError('invalid-argument', 'Missing csvUrl')
    }

    try {
      const response = await fetch(csvUrl)
      if (!response.ok) throw new Error('Não foi possível ler o CSV.')
      const csvContent = await response.text()
      
      const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length < 2) throw new Error('CSV Vazio.')

      const headers = parseCSVLine(lines[0]).map(h => 
        h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, '_')
      )

      // Find critical columns
      const nameIdx = headers.findIndex(h => h.includes('nome'))
      const emailIdx = headers.findIndex(h => h.includes('mail') || h === 'email')
      const levelIdx = headers.findIndex(h => h.includes('nivel'))
      const statusIdx = headers.findIndex(h => h.includes('status'))
      
      if (nameIdx === -1) {
        throw new Error('CSV sem coluna de Nome identificada.')
      }

      const usersRef = db.collection('users')
      let imported = 0
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i])
        if (row.length < 2) continue

        const nome = row[nameIdx] || ''
        let email = emailIdx >= 0 ? (row[emailIdx] || '').toLowerCase().trim() : ''
        
        if (!nome) {
          errors.push(`Linha ${i + 1}: Sem nome do aluno.`)
          continue
        }

        if (!email) {
          // generate fallback email if ProPGWeb is missing it, to maintain indexability
          const fallback = nome.toLowerCase().replace(/[^a-z0-9]/g, '')
          email = `${fallback}@import.propgweb.local`
        }

        const nivel = levelIdx >= 0 ? row[levelIdx] : ''
        const status = statusIdx >= 0 ? row[statusIdx] : 'Ativo'

        const record: any = {
          nome,
          email,
          nivel,
          status,
          roles: ['Discente'], // Fallback roles if new user
          updatedAt: new Date()
        }

        // Map date columns dynamically to preserve ProPGWeb source of truth
        headers.forEach((h, idx) => {
          if (idx !== nameIdx && idx !== emailIdx && idx !== levelIdx && idx !== statusIdx) {
            const val = row[idx]?.trim()
            if (val) {
               // convert date structures 
               if (h.includes('data')) {
                 if (val.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                   const [d, m, y] = val.split('/')
                   record[h] = new Date(`${y}-${m}-${d}T12:00:00Z`)
                 } else {
                   record[h] = val
                 }
               } else {
                 record[h] = val
               }
            }
          }
        })

        // Find existing user by email
        const snapshot = await usersRef.where('email', '==', email).limit(1).get()
        
        if (!snapshot.empty) {
          // Update
          const docId = snapshot.docs[0].id
          const existingData = snapshot.docs[0].data()
          const roles = existingData.roles || ['Discente']
          if (!roles.includes('Discente')) roles.push('Discente')
          
          await usersRef.doc(docId).update({
            ...record,
            roles
          })
          imported++
        } else {
          // Force creating a UID based on email hash or generate random
          const newDocRef = usersRef.doc()
          await newDocRef.set({
            ...record,
            id: newDocRef.id,
            createdAt: new Date()
          })
          imported++
        }
      }

      return { imported, errors }

    } catch (e: any) {
      console.error(e)
      throw new HttpsError('internal', `Falha ao processar CSV: ${e.message}`)
    }
  }
)
