import React, { useState } from 'react'
import { Edit2, Plus, Trash2, UserRound } from 'lucide-react'
import {
  useCreateUser,
  useDeleteUser,
  useEstablishments,
  useUpdateUser,
  useUsers,
} from '@/hooks'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { EmptyState, PageLoader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { toast } from '@/store/toastStore'
import type { User } from '@/types'

type FormState = {
  name: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'bartender' | 'chef'
  establishmentIds: string[]
}

const defaultForm: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'bartender',
  establishmentIds: [],
}

const ROLE_LABELS: Record<FormState['role'], string> = {
  admin: 'Administrator',
  manager: 'Manager',
  bartender: 'Bartender',
  chef: 'Chef',
}

export const UsersPage: React.FC = () => {
  const { user: loggedUser, activeEstablishmentId } = useAuthStore()
  const { data, isLoading } = useUsers()
  const { data: establishments } = useEstablishments()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const isAdmin = loggedUser?.role === 'admin'

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...defaultForm,
      establishmentIds: isAdmin
        ? []
        : activeEstablishmentId
          ? [activeEstablishmentId]
          : [],
    })
    setModalOpen(true)
  }

  const openEdit = (item: User) => {
    setEditing(item)
    setForm({
      name: item.name,
      email: item.email,
      password: '',
      role: item.role ?? 'bartender',
      establishmentIds: item.establishments?.map((link) => link.establishmentId) ?? [],
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (isAdmin && form.establishmentIds.length === 0) {
      toast.error('Select at least one establishment for the user')
      return
    }

    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          establishmentIds: form.establishmentIds,
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
          <h1 className="page-title">Users</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.length ?? 0} registered</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          New
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState
          icon={<UserRound className="w-6 h-6" />}
          title="No users"
          description="Register users for system access"
          action={<Button onClick={openCreate}>Create user</Button>}
        />
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">{item.email}</p>
                {item.role && (
                  <span className="inline-block mt-1 text-xs bg-brand-muted text-brand px-2 py-0.5 rounded-full">
                    {ROLE_LABELS[item.role]}
                  </span>
                )}
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
        title={editing ? 'Edit user' : 'New user'}
        size="sm"
        footer={
          <Button
            fullWidth
            onClick={() => void handleSubmit()}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Name"
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
            label={editing ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required={!editing}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-role" className="label">Role</label>
            <select
              id="user-role"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  role: event.target.value as FormState['role'],
                }))
              }
              className="input-field"
            >
              <option value="bartender">Bartender</option>
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Establishments</label>
            {isAdmin ? (
              <div className="card-elevated p-3 max-h-40 overflow-auto space-y-2">
                {establishments?.map((establishment) => {
                  const checked = form.establishmentIds.includes(establishment.id)
                  return (
                    <label key={establishment.id} className="flex items-center gap-2 text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const isChecked = event.target.checked
                          setForm((prev) => ({
                            ...prev,
                            establishmentIds: isChecked
                              ? [...prev.establishmentIds, establishment.id]
                              : prev.establishmentIds.filter((id) => id !== establishment.id),
                          }))
                        }}
                      />
                      <span>{establishment.name}</span>
                    </label>
                  )
                })}

                {!establishments?.length && (
                  <p className="text-xs text-gray-400">No establishments available</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Users created by a manager are linked to the active establishment.
              </p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message="Are you sure you want to delete this user?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
