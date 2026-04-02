import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { TextareaField } from '@/components/ui/FormField'
import { useAuthStore } from '@/stores/authStore'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface AtaEntry {
  id: string
  idReuniao: string
  idSolicitacao: string
  observacao: string
  data: string
  usuario: string
}

interface AtaPanelProps {
  meetingId: string
  requestId?: string
}

/**
 * Panel for recording meeting minutes (Ata) observations.
 * Replicates addAtaObservation from code.gs.
 */
export function AtaPanel({ meetingId, requestId }: AtaPanelProps) {
  const [entries, setEntries] = useState<AtaEntry[]>([])
  const [newObservation, setNewObservation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const { userProfile } = useAuthStore()

  // Load existing entries
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true)
      try {
        const constraints = [where('idReuniao', '==', meetingId)]
        if (requestId) constraints.push(where('idSolicitacao', '==', requestId))

        const q = query(collection(db, 'ata'), ...constraints)
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AtaEntry[]

        setEntries(items.sort((a, b) => a.data.localeCompare(b.data)))
      } catch (err) {
        console.error('Error loading ata entries:', err)
      } finally {
        setLoading(false)
      }
    }
    if (meetingId) loadEntries()
  }, [meetingId, requestId])

  const handleAdd = async () => {
    if (!newObservation.trim() || !userProfile) return
    setSubmitting(true)

    try {
      const entry = {
        idReuniao: meetingId,
        idSolicitacao: requestId || '',
        observacao: newObservation.trim(),
        data: new Date().toISOString(),
        usuario: userProfile.email,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'ata'), entry)

      setEntries((prev) => [...prev, { id: docRef.id, ...entry }])
      setNewObservation('')
      toast.success('Observacao registrada na ata.')
    } catch (err) {
      toast.error('Erro ao registrar observacao.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Ata / Observacoes da Reuniao</h4>

      {/* Existing entries */}
      {loading ? (
        <p className="text-xs text-gray-400">Carregando...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-gray-400">Nenhuma observacao registrada.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-gray-50 p-2 text-sm">
              <p className="text-gray-800">{entry.observacao}</p>
              <p className="text-xs text-gray-400 mt-1">
                {entry.usuario} — {formatDate(entry.data)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add new entry */}
      <TextareaField
        label="Nova observacao"
        id="ata-new"
        value={newObservation}
        onChange={(e) => setNewObservation(e.target.value)}
        helpText="Registre decisoes e observacoes da reuniao."
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        loading={submitting}
        disabled={!newObservation.trim()}
      >
        Adicionar a Ata
      </Button>
    </div>
  )
}
