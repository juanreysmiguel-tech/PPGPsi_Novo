import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHelpArticles, saveHelpArticle, deleteHelpArticle } from '@/services/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { HelpCircle, Plus, Edit, Trash2 } from 'lucide-react'
import type { HelpArticle } from '@/types'

export function HelpAdminPage() {
  const queryClient = useQueryClient()
  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-helpArticles'],
    queryFn: () => getHelpArticles(),
  })

  const [editingArticle, setEditingArticle] = useState<Partial<HelpArticle> | null>(null)

  const saveMutation = useMutation({
    mutationFn: (article: HelpArticle) => saveHelpArticle(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-helpArticles'] })
      setEditingArticle(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHelpArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-helpArticles'] })
    },
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Gerenciar Ajuda (CRUD)
          </h1>
          <p className="text-gray-500">Adicione ou edite artigos da central de ajuda</p>
        </div>
        <Button variant="primary" onClick={() => setEditingArticle({})}>
          <Plus className="h-4 w-4" /> Novo Artigo
        </Button>
      </div>

      {editingArticle && (
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-bold">{editingArticle.id ? 'Editar' : 'Novo'} Artigo</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Título"
              value={editingArticle.titulo || ''}
              onChange={e => setEditingArticle({ ...editingArticle, titulo: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Tipo Solicitacao"
              value={editingArticle.tipoSolicitacao || ''}
              onChange={e => setEditingArticle({ ...editingArticle, tipoSolicitacao: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Perfil Alvo"
              value={editingArticle.perfil || ''}
              onChange={e => setEditingArticle({ ...editingArticle, perfil: e.target.value })}
              className="border p-2 rounded"
            />
            <textarea
              placeholder="Passo a Passo"
              value={editingArticle.passoAPasso || ''}
              onChange={e => setEditingArticle({ ...editingArticle, passoAPasso: e.target.value })}
              className="border p-2 rounded col-span-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingArticle(null)}>Cancelar</Button>
            <Button variant="primary" onClick={() => saveMutation.mutate(editingArticle as HelpArticle)}>Salvar</Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="space-y-3">
          {articles?.map(article => (
            <Card key={article.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{article.titulo}</h3>
                <p className="text-xs text-gray-500">{article.tipoSolicitacao} - Perfil: {article.perfil}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingArticle(article)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(article.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
