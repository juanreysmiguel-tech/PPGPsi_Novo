/**
 * Laboratories Management Page
 */

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useActiveLaboratories, useCreateLaboratory, useUpdateLaboratory, useDeleteLaboratory } from '@/hooks/useLaboratories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function LaboratoriesPage() {
  const { firebaseUser } = useAuthStore()
  const userId = firebaseUser?.uid || ''

  const { data: labs = [], isLoading } = useActiveLaboratories()
  const createMutation = useCreateLaboratory()
  const updateMutation = useUpdateLaboratory()
  const deleteMutation = useDeleteLaboratory()

  const userLabs = labs.filter(lab => lab.leaderId === userId || lab.memberIds.includes(userId))

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    description: '',
    researchLines: [] as string[],
  })
  const [newLine, setNewLine] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          labId: editingId,
          data: {
            ...formData,
            leaderId: userId,
            memberIds: [],
            active: true,
          },
        })
        toast.success('Laboratório atualizado!')
      } else {
        await createMutation.mutateAsync({
          ...formData,
          leaderId: userId,
          memberIds: [userId],
          active: true,
        })
        toast.success('Laboratório criado!')
      }

      setFormData({ name: '', acronym: '', description: '', researchLines: [] })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      toast.error('Erro ao salvar laboratório')
      console.error(error)
    }
  }

  const handleDelete = async (labId: string) => {
    if (confirm('Tem certeza que deseja deletar este laboratório?')) {
      try {
        await deleteMutation.mutateAsync(labId)
        toast.success('Laboratório deletado!')
      } catch (error) {
        toast.error('Erro ao deletar laboratório')
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
          <h1 className="text-3xl font-bold text-gray-900">Laboratórios</h1>
          <p className="mt-1 text-gray-600">Gerencie seus laboratórios de pesquisa</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Laboratório
        </Button>
      </div>

      {userLabs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Nenhum laboratório</p>
          <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Laboratório
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {userLabs.map(lab => (
            <Card key={lab.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
                  <p className="text-sm text-gray-500">{lab.acronym}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(lab.id || '')
                      setFormData({
                        name: lab.name,
                        acronym: lab.acronym,
                        description: lab.description,
                        researchLines: lab.researchLines,
                      })
                      setShowForm(true)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lab.id || '')}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{lab.description}</p>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Linhas de Pesquisa</p>
                <div className="flex flex-wrap gap-2">
                  {lab.researchLines.length > 0 ? (
                    lab.researchLines.map(line => (
                      <span key={line} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {line}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Nenhuma linha definida</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                {lab.memberIds.length} membro(s)
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)}>
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Editar Laboratório' : 'Novo Laboratório'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sigla</label>
                <input
                  type="text"
                  value={formData.acronym}
                  onChange={e => setFormData(prev => ({ ...prev, acronym: e.target.value }))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Ex: LACOP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Linhas de Pesquisa</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLine}
                    onChange={e => setNewLine(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newLine.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            researchLines: [...prev.researchLines, newLine.trim()]
                          }))
                          setNewLine('')
                        }
                      }
                    }}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Adicionar linha..."
                  />
                  <Button type="button" variant="secondary" onClick={() => {
                    if (newLine.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        researchLines: [...prev.researchLines, newLine.trim()]
                      }))
                      setNewLine('')
                    }
                  }} size="sm">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.researchLines.map(line => (
                    <span key={line} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs flex items-center gap-1">
                      {line}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          researchLines: prev.researchLines.filter(l => l !== line)
                        }))}
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
