/**
 * Research Projects Management Page
 */

import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { useActiveProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Edit2, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function ProjectsPage() {
  const { firebaseUser } = useAuthStore()
  const userId = firebaseUser?.uid || ''

  const { data: projects = [], isLoading } = useActiveProjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  const userProjects = projects.filter(proj => proj.leaderId === userId || proj.memberIds.includes(userId))

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    funder: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          projId: editingId,
          data: {
            ...formData,
            startDate: Timestamp.fromDate(new Date(formData.startDate)),
            endDate: Timestamp.fromDate(new Date(formData.endDate)),
            leaderId: userId,
            memberIds: [],
            status: 'ativo',
          },
        })
        toast.success('Projeto atualizado!')
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          funder: formData.funder,
          description: formData.description,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          endDate: Timestamp.fromDate(new Date(formData.endDate)),
          leaderId: userId,
          labId: '',
          memberIds: [userId],
          status: 'ativo',
        })
        toast.success('Projeto criado!')
      }

      setFormData({
        title: '',
        funder: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      toast.error('Erro ao salvar projeto')
      console.error(error)
    }
  }

  const handleDelete = async (projId: string) => {
    if (confirm('Tem certeza que deseja deletar este projeto?')) {
      try {
        await deleteMutation.mutateAsync(projId)
        toast.success('Projeto deletado!')
      } catch (error) {
        toast.error('Erro ao deletar projeto')
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
          <h1 className="text-3xl font-bold text-gray-900">Projetos de Pesquisa</h1>
          <p className="mt-1 text-gray-600">Gerencie seus projetos e financiamentos</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {userProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Nenhum projeto</p>
          <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Projeto
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {userProjects.map(proj => (
            <Card key={proj.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{proj.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{proj.funder}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(proj.id || '')
                      setFormData({
                        title: proj.title,
                        funder: proj.funder,
                        description: proj.description,
                        startDate: proj.startDate.toDate?.().toISOString().split('T')[0] || '',
                        endDate: proj.endDate.toDate?.().toISOString().split('T')[0] || '',
                      })
                      setShowForm(true)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id || '')}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{proj.description}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {proj.startDate.toDate?.().toLocaleDateString?.('pt-BR')} até {proj.endDate.toDate?.().toLocaleDateString?.('pt-BR')}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  proj.status === 'ativo' ? 'bg-green-100 text-green-700' :
                  proj.status === 'concluido' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {proj.status}
                </span>
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
              {editingId ? 'Editar Projeto' : 'Novo Projeto'}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Financiador</label>
                <input
                  type="text"
                  value={formData.funder}
                  onChange={e => setFormData(prev => ({ ...prev, funder: e.target.value }))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Ex: FAPESP, CNPq"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Início</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fim</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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
