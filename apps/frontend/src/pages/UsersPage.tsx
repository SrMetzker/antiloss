import React, { useState } from 'react'
import { Edit2, Plus, Trash2, UserRound } from 'lucide-react'
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from '@/hooks'
import { Button } from '@/components/ui/Button'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { EmptyState, PageLoader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { User } from '@/types'

type FormState = {
  name: string
  email: string
  password: string
}

const defaultForm: FormState = {
  name: '',
  email: '',
  password: '',
}

export const UsersPage: React.FC = () => {
  const { data, isLoading } = useUsers()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item: User) => {
    setEditing(item)
    setForm({
      name: item.name,
      email: item.email,
      password: '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        },
      })
    } else {
      await createMutation.mutateAsync(form)
    }

    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await deleteMutation.mutateAsync(confirmId)
    setConfirmId(null)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.length ?? 0} cadastrados</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Novo
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState
          icon={<UserRound className="w-6 h-6" />}
          title="Nenhum usuário"
          description="Cadastre usuários para acesso ao sistema"
          action={<Button onClick={openCreate}>Criar usuário</Button>}
        />
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">{item.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-brand-muted transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmId(item.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        size="sm"
        footer={
          <Button
            fullWidth
            onClick={() => void handleSubmit()}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editing ? 'Salvar' : 'Criar'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Nome"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <Input
            label={editing ? 'Nova senha (opcional)' : 'Senha'}
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required={!editing}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Excluir usuário"
        message="Tem certeza que deseja excluir este usuário?"
        confirmLabel="Excluir"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
