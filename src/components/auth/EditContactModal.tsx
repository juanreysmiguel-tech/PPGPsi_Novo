import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/ui/FormField'
import { useAuthStore } from '@/stores/authStore'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { toast } from 'sonner'

interface EditContactModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Modal for editing user contact information.
 * Replicates openEditContactModal from js.html.
 */
export function EditContactModal({ open, onClose }: EditContactModalProps) {
  const { userProfile, setUserProfile } = useAuthStore()

  const [telefone, setTelefone] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [cep, setCep] = useState('')
  const [emergenciaNome, setEmergenciaNome] = useState('')
  const [emergenciaTel, setEmergenciaTel] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill with existing data
  useEffect(() => {
    if (userProfile && open) {
      setTelefone(userProfile.telefone || '')
      setCelular(userProfile.celular || '')
      setEndereco(userProfile.endereco || '')
      setCidade((userProfile as any).cidade || '')
      setUf((userProfile as any).uf || '')
      setCep((userProfile as any).cep || '')
      setEmergenciaNome(userProfile.emergenciaNome || '')
      setEmergenciaTel(userProfile.emergenciaTel || '')
    }
  }, [userProfile, open])

  const handleSubmit = async () => {
    if (!userProfile) return
    setSubmitting(true)

    try {
      const updateData = {
        telefone,
        celular,
        endereco,
        cidade,
        uf,
        cep,
        emergenciaNome,
        emergenciaTel,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, 'users', userProfile.id), updateData)

      // Update local state
      setUserProfile({
        ...userProfile,
        telefone,
        celular,
        endereco,
        emergenciaNome,
        emergenciaTel,
      })

      toast.success('Informacoes de contato atualizadas!')
      onClose()
    } catch (err) {
      toast.error('Erro ao atualizar contatos.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar Informacoes de Contato" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Telefone" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <InputField label="Celular" id="celular" value={celular} onChange={(e) => setCelular(e.target.value)} />
        </div>

        <InputField label="Endereco" id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

        <div className="grid grid-cols-3 gap-3">
          <InputField label="Cidade" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          <InputField label="UF" id="uf" value={uf} onChange={(e) => setUf(e.target.value)} />
          <InputField label="CEP" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} />
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50/30 p-3">
          <h4 className="text-sm font-semibold text-orange-800 mb-2">Contato de Emergencia</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Nome" id="emergencia-nome" value={emergenciaNome} onChange={(e) => setEmergenciaNome(e.target.value)} />
            <InputField label="Telefone" id="emergencia-tel" value={emergenciaTel} onChange={(e) => setEmergenciaTel(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>Salvar</Button>
        </div>
      </div>
    </Modal>
  )
}
