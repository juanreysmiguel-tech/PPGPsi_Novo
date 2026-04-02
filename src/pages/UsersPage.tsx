import { useState } from 'react'
import { useAllUsers, useUpdateUserWithClaimsSync, useCreateUserDraft } from '@/hooks/useUser'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { InputField, SelectField } from '@/components/ui/FormField'
import { CSVImportModal } from '@/components/admin/CSVImportModal'
import { toast } from 'sonner'
import type { User } from '@/types'
import { ROLES } from '@/types'
import { Plus, Upload, Edit2 } from 'lucide-react'

function firebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code)
    if (code === 'functions/not-found') {
      return 'Cloud Function updateUserRoles nao deployada. Rode: firebase deploy --only functions'
    }
    if (code === 'functions/unavailable') {
      return 'Functions indisponiveis. Verifique rede ou deploy.'
    }
    if (code === 'permission-denied' || code === 'functions/permission-denied') {
      return 'Sem permissao (apenas Secretaria/Coordenacao).'
    }
  }
  if (err instanceof Error) return err.message
  return 'Erro desconhecido.'
}

export function UsersPage() {
  const { data: users } = useAllUsers()
  const updateUserWithSync = useUpdateUserWithClaimsSync()
  const createDraft = useCreateUserDraft()
  const firebaseUser = useAuthStore((s) => s.firebaseUser)

  const [editUser, setEditUser] = useState<User | null>(null)
  const [editRoles, setEditRoles] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState('Ativo')
  const [saving, setSaving] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)

  const [newOpen, setNewOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newNome, setNewNome] = useState('')
  const [newRoles, setNewRoles] = useState<string[]>(['Discente'])
  const [newStatus, setNewStatus] = useState<User['status']>('Ativo')
  const [creating, setCreating] = useState(false)

  const columns: Column<User>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sortable: true,
      accessor: (u) => u.nome,
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {u.nome?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{u.nome}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Perfis',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {(u.roles ?? []).map((r) => (
            <Badge key={r} variant="primary">{r}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'nivel',
      header: 'Nivel',
      sortable: true,
      accessor: (u) => u.nivel ?? '',
      render: (u) => <span className="text-sm text-gray-600">{u.nivel || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (u) => u.status ?? '',
      render: (u) => (
        <Badge variant={u.status === 'Ativo' ? 'success' : 'default'}>
          {u.status || 'Ativo'}
        </Badge>
      ),
    },
    {
      key: 'orientador',
      header: 'Orientador',
      render: (u) => <span className="text-sm text-gray-600">{u.nomeOrientador || '-'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  const openEdit = (u: User) => {
    setEditUser(u)
    setEditRoles(u.roles ?? [])
    setEditStatus(u.status ?? 'Ativo')
  }

  const handleSaveRoles = async () => {
    if (!editUser) return
    if (editRoles.length === 0) {
      toast.error('Selecione ao menos um perfil.')
      return
    }
    setSaving(true)
    try {
      await updateUserWithSync.mutateAsync({
        id: editUser.id,
        data: {
          roles: editRoles as User['roles'],
          status: editStatus as User['status'],
        },
      })
      toast.success('Usuario atualizado. Claims sincronizados.')
      setEditUser(null)
    } catch (err) {
      toast.error(firebaseErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleNewRole = (role: string) => {
    setNewRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  const handleCreateUser = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!email || !newNome.trim()) {
      toast.error('Preencha e-mail e nome.')
      return
    }
    if (newRoles.length === 0) {
      toast.error('Selecione ao menos um perfil.')
      return
    }
    setCreating(true)
    try {
      await createDraft.mutateAsync({
        email,
        nome: newNome.trim(),
        roles: newRoles as User['roles'],
        status: newStatus,
      })
      if (firebaseUser?.email?.toLowerCase() === email) {
        await import('@/services/refreshProfile').then((m) => m.refreshCurrentUserProfile())
      }
      toast.success('Usuario pre-cadastrado. No primeiro login o documento sera associado ao UID.')
      setNewOpen(false)
      setNewEmail('')
      setNewNome('')
      setNewRoles(['Discente'])
      setNewStatus('Ativo')
    } catch (err) {
      toast.error(firebaseErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const toggleRole = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">Gerenciar perfis e permissoes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> Novo usuario
          </Button>
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload className="h-4 w-4" /> Importar ProPGWeb
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        keyExtractor={(u) => u.id}
        searchFn={(u, q) =>
          (u.nome?.toLowerCase().includes(q) ?? false) ||
          (u.email?.toLowerCase().includes(q) ?? false)
        }
        searchPlaceholder="Buscar por nome ou email..."
        emptyMessage="Nenhum usuario cadastrado."
      />

      {/* Edit roles modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Editar: ${editUser?.nome ?? ''}`}
        size="sm"
      >
        {editUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{editUser.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Perfis</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      editRoles.includes(role)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <SelectField
              label="Status"
              id="user-status"
              options={['Ativo', 'Inativo', 'Suspenso']}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveRoles} loading={saving}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Pre-cadastrar usuario" size="sm">
        <div className="space-y-4">
          <InputField
            label="E-mail UFSCar"
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <InputField
            label="Nome completo"
            id="new-nome"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            required
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Perfis</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.filter((r) => r !== 'Externo').map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleNewRole(role)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    newRoles.includes(role)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-primary'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <SelectField
            label="Status"
            id="new-status"
            options={['Ativo', 'Inativo', 'Suspenso']}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as User['status'])}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateUser} loading={creating}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import */}
      <CSVImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </div>
  )
}
