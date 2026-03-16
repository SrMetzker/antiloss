import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { User, UserCreateInput, UserUpdateInput } from '@/types'

type BackendUser = {
  id: string
  name: string
  email: string
  createdAt: string
  createdBy: string
}

const mapUser = (user: BackendUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  createdBy: user.createdBy,
})

const getContext = () => {
  const { activeEstablishmentId, user } = useAuthStore.getState()
  return {
    establishmentId: activeEstablishmentId,
    createdBy: user?.id,
  }
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { establishmentId } = getContext()
    const response = await apiClient.get<BackendUser[]>('/users', {
      params: {
        establishmentId: establishmentId ?? undefined,
      },
    })

    return response.data.map(mapUser)
  },

  create: async (data: UserCreateInput): Promise<User> => {
    const { createdBy } = getContext()
    if (!createdBy) throw new Error('Usuário não autenticado')

    const response = await apiClient.post<BackendUser>('/users', {
      ...data,
      createdBy,
    })

    return mapUser(response.data)
  },

  update: async (id: string, data: UserUpdateInput): Promise<User> => {
    const response = await apiClient.put<BackendUser>(`/users/${id}`, data)
    return mapUser(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
