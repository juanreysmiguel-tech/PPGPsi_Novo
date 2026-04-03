/**
 * PTTs (Produtos Técnicos/Tecnológicos) Management Page
 */

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePTTsByAuthor, useCreatePTT, useUpdatePTT, useDeletePTT } from '@/hooks/usePTTs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const PTT_CATEGORIES = [
  'Software',
  'Hardware',
  'Banco de Dados',
  'Metodologia',
  'Processo',
  'Produto',
  'Serviço',
  'Outro',
]

export function PTTsPage() {
  const { firebaseUser } = useAuthStore()
  const userId = firebaseUser?.uid || ''

  const { data: ptts = [], isLoading } = usePTTsByAuthor(userId)
  const createMutation = useCreatePTT()
  const updateMutation = useUpdatePTT()
  const deleteMutation = useDeletePTT()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    year: new Date().getFullYear(),
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          pttId: editingId,
          data: formData,
        })
        toast.success('PTT atualizado!')
      } else {
        await createMutation.mutateAsync({
          ...formData,
          authorId: userId,
          fileUrls: [],
          status: 'rascunho',
        })
        toast.success('PTT criado!')
      }

      setFormData({ title: '', category: '', year: new Date().getFullYear(), description: '' })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      toast.error('Erro ao salvar PTT')
      console.error(error)
    }
  }

  const handleDelete = async (pttId: string) => {
    if (confirm('Tem certeza que deseja deletar este PTT?')) {
      try {
        await deleteMutation.mutateAsync(pttId)
        toast.success('PTT deletado!')
      } catch (error) {
        toast.error('Erro ao deletar PTT')
        console.error(error)
      }
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos Técnicos/Tecnológicos</h1>
          <p className="mt-1 text-gray-600">Gerencie seus PTTs e produções tecnológicas</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo PTT
        </Button>
      </div>

      {ptts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Nenhum PTT cadastrado</p>
          <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Criar PTT
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ptts.map(ptt => (
            <Card key={ptt.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{ptt.title}</h3>
                  <p className="text-sm text-gray-500">{ptt.category} • {ptt.year}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(ptt.id || '')
                      setFormData({
                        title: ptt.title,
                        category: ptt.category,
                        year: ptt.year,
                        description: ptt.description,
                      })
                      setShowForm(true)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ptt.id || '')}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{ptt.description}</p>
              <span className={`mt-3 inline-block px-2 py-1 rounded text-xs font-medium ${
                ptt.status === 'validado' ? 'bg-green-100 text-green-700' :
                ptt.status === 'submetido' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {ptt.status}
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)}>
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Editar PTT' : 'Novo PTT'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Nome do PTT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">Selecione...</option>
                    {PTT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ano</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Descreva o PTT..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={() => setShowForm(false)} variant="secondary" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
