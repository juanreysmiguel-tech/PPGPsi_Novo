import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMuralPosts, createMuralPost, deleteMuralPost, type MuralPost } from '@/services/firestore'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextareaField } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Megaphone, Trash2, Send } from 'lucide-react'

export function MuralPage() {
  const { userProfile } = useAuthStore()
  const qc = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['mural'],
    queryFn: () => getMuralPosts(100),
    staleTime: 60_000,
  })

  const createPost = useMutation({
    mutationFn: createMuralPost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mural'] }) },
  })

  const deletePost = useMutation({
    mutationFn: deleteMuralPost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mural'] }) },
  })

  const [content, setContent] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePost = async () => {
    if (!content.trim() || !userProfile) return
    try {
      await createPost.mutateAsync({
        idUsuario: userProfile.id,
        nomeUsuario: userProfile.nome,
        fotoUrl: userProfile.fotoUrl,
        conteudo: content.trim(),
      })
      setContent('')
      toast.success('Publicacao criada!')
    } catch {
      toast.error('Erro ao publicar.')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-indigo-500" />
          Mural da Comunidade PPGPsi
        </h1>
        <p className="text-gray-500">Compartilhe pesquisas, artigos, eventos e informacoes.</p>
      </div>

      {/* New post form */}
      <Card>
        <CardBody className="space-y-3">
          <TextareaField
            label="Nova publicacao"
            id="mural-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe algo com a comunidade..."
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handlePost} loading={createPost.isPending} disabled={!content.trim()}>
              <Send className="h-4 w-4" /> Publicar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Posts feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <EmptyState title="Nenhuma publicacao" description="Seja o primeiro a publicar!" />
      ) : (
        <div className="space-y-4">
          {posts.map((post: MuralPost) => (
            <Card key={post.id}>
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {post.fotoUrl ? (
                      <img src={post.fotoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      post.nomeUsuario?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{post.nomeUsuario}</span>
                        <span className="text-xs text-gray-400 ml-2">{formatRelativeDate(post.dataPublicacao)}</span>
                      </div>
                      {userProfile?.id === post.idUsuario && (
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{post.conteudo}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => { if (deleteId) await deletePost.mutateAsync(deleteId) }}
        title="Excluir publicacao"
        message="Tem certeza que deseja excluir esta publicacao?"
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}
