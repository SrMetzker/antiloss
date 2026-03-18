import React, { useState } from 'react'
import { Building2, Edit2, Plus, Trash2 } from 'lucide-react'
import {
  useCreateEstablishment,
  useDeleteEstablishment,
  useEstablishments,
  useUpdateEstablishment,
} from '@/hooks'
import { Button } from '@/components/ui/Button'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { EmptyState, PageLoader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { Establishment } from '@/types'

export const EstablishmentsPage: React.FC = () => {
  const { data, isLoading } = useEstablishments()
  const createMutation = useCreateEstablishment()
  const updateMutation = useUpdateEstablishment()
  const deleteMutation = useDeleteEstablishment()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Establishment | null>(null)
  const [name, setName] = useState('')

  const openCreate = () => {
    setEditing(null)
    setName('')
    setModalOpen(true)
  }

  const openEdit = (item: Establishment) => {
    setEditing(item)
    setName(item.name)
    setModalOpen(true)
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: { name } })
    } else {
      await createMutation.mutateAsync({ name })
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
          <h1 className="page-title">Establishments</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.length ?? 0} registered</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          New
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No establishments"
          description="Register the first establishment to get started"
          action={<Button onClick={openCreate}>Create establishment</Button>}
        />
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">ID: {item.id.slice(0, 8)}...</p>
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
        title={editing ? 'Edit establishment' : 'New establishment'}
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
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete establishment"
        message="This action also removes all related data from this establishment."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
