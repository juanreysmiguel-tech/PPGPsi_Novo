/**
 * Scientific Profile Page
 * Allows users to view and edit their scientific profile
 * Integrates with Lattes import, research lines, and bio
 */

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProfile, useUpdateProfile, useUpdateLastLattesSync } from '@/hooks/useProfile'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loader2, Upload, Edit2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProfilePage() {
  const { firebaseUser } = useAuthStore()
  const userId = firebaseUser?.uid || ''

  const { data: profile, isLoading, error } = useProfile(userId)
  const updateProfileMutation = useUpdateProfile()
  const updateLastLattesSyncMutation = useUpdateLastLattesSync()

  const [isEditing, setIsEditing] = useState(false)
  const [showLattesImport, setShowLattesImport] = useState(false)
  const [formData, setFormData] = useState({
    orcid: '',
    lattesId: '',
    bio: '',
    researchLines: [] as string[],
  })
  const [newResearchLine, setNewResearchLine] = useState('')

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        orcid: profile.orcid || '',
        lattesId: profile.lattesId || '',
        bio: profile.bio || '',
        researchLines: profile.researchLines?.map(rl => rl.name) || [],
      })
    }
  }, [profile])

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        userId,
        data: {
          orcid: formData.orcid || undefined,
          lattesId: formData.lattesId || undefined,
          bio: formData.bio || undefined,
          researchLines: formData.researchLines.map(name => ({ name, active: true })),
        },
      })
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
      console.error(error)
    }
  }

  const handleAddResearchLine = () => {
    if (newResearchLine.trim() && !formData.researchLines.includes(newResearchLine.trim())) {
      setFormData(prev => ({
        ...prev,
        researchLines: [...prev.researchLines, newResearchLine.trim()],
      }))
      setNewResearchLine('')
    }
  }

  const handleRemoveResearchLine = (line: string) => {
    setFormData(prev => ({
      ...prev,
      researchLines: prev.researchLines.filter(l => l !== line),
    }))
  }

  const handleLattesImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()

      // Basic validation
      if (!text.includes('CURRICULO-VITAE')) {
        toast.error('Arquivo Lattes inválido. Use o formato XML do CNPq.')
        return
      }

      // Parse Lattes XML (simplified - extract IDs)
      const orcidMatch = text.match(/ORCID-DO-AUTOR="([^"]+)"/i)
      const lattesIdMatch = text.match(/NUMERO-IDENTIFICADOR="([^"]+)"/i)

      const updates: any = {}
      if (orcidMatch) updates.orcid = orcidMatch[1]
      if (lattesIdMatch) updates.lattesId = lattesIdMatch[1]

      await updateProfileMutation.mutateAsync({
        userId,
        data: updates,
      })

      await updateLastLattesSyncMutation.mutateAsync(userId)

      toast.success('CV Lattes importado com sucesso!')
      setShowLattesImport(false)
    } catch (error) {
      toast.error('Erro ao processar arquivo Lattes')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Erro ao carregar perfil: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil Científico</h1>
          <p className="mt-1 text-gray-600">Gerencie seus dados acadêmicos e de pesquisa</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'secondary' : 'primary'}
        >
          {isEditing ? 'Cancelar' : <Edit2 className="mr-2 h-4 w-4" />}
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* ORCID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ORCID</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.orcid}
                onChange={e => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                placeholder="0000-0000-0000-0000"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-gray-900">{profile?.orcid || '—'}</p>
            )}
          </div>

          {/* Lattes ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Lattes</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lattesId}
                onChange={e => setFormData(prev => ({ ...prev, lattesId: e.target.value }))}
                placeholder="1234567890"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-gray-900">{profile?.lattesId || '—'}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Biografia</label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Descreva sua carreira e interesse de pesquisa..."
              maxLength={500}
              rows={4}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
            />
          ) : (
            <p className="mt-1 text-gray-600">{profile?.bio || '—'}</p>
          )}
          {isEditing && (
            <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500</p>
          )}
        </div>

        {/* Research Lines */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Linhas de Pesquisa</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.researchLines.map(line => (
              <div
                key={line}
                className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
              >
                {line}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveResearchLine(line)}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newResearchLine}
                onChange={e => setNewResearchLine(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddResearchLine()}
                placeholder="Adicionar linha de pesquisa..."
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <Button onClick={handleAddResearchLine} variant="secondary" size="sm">
                Adicionar
              </Button>
            </div>
          )}
        </div>

        {/* Lattes Import Button */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setShowLattesImport(true)}
              variant="secondary"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar CV Lattes
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Faça upload do seu CV Lattes (XML) para atualizar ORCID e ID Lattes automaticamente
            </p>
          </div>
        )}

        {/* Last Sync */}
        {profile?.lastLattesSync && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Última sincronização: {profile.lastLattesSync.toDate?.().toLocaleDateString?.('pt-BR')}
          </div>
        )}

        {/* Save Button */}
        {isEditing && (
          <Button
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
            className="mt-6 w-full"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        )}
      </Card>

      {/* Lattes Import Modal */}
      {showLattesImport && (
        <Modal open={showLattesImport} onClose={() => setShowLattesImport(false)}>
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900">Importar CV Lattes</h2>
            <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Faça upload do arquivo XML do seu Currículo Lattes. Você pode baixá-lo em:
              <br />
              <a
                href="https://lattes.cnpq.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                lattes.cnpq.br
              </a>
            </p>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 rounded border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-primary-500">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Clique para selecionar arquivo</span>
                <input
                  type="file"
                  accept=".xml,.zip"
                  onChange={handleLattesImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="rounded bg-blue-50 p-4 text-sm text-blue-700">
              ℹ️ Seu arquivo não será armazenado. Apenas ORCID e ID Lattes serão extraídos.
            </div>

            <Button onClick={() => setShowLattesImport(false)} variant="secondary" className="w-full">
              Fechar
            </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
