import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type {
  Establishment,
  EstablishmentCreateInput,
  EstablishmentUpdateInput,
} from '@/types'

const mapEstablishment = (item: Establishment): Establishment => ({
  id: item.id,
  name: item.name,
  createdAt: item.createdAt,
  createdBy: item.createdBy,
})

const getContext = () => {
  const { user } = useAuthStore.getState()
  return { createdBy: user?.id }
}

export const establishmentsApi = {
  getAll: async (): Promise<Establishment[]> => {
    const response = await apiClient.get<Establishment[]>('/establishments')
    return response.data.map(mapEstablishment)
  },

  create: async (data: EstablishmentCreateInput): Promise<Establishment> => {
    const { createdBy } = getContext()
    if (!createdBy) throw new Error('User not authenticated')

    const response = await apiClient.post<Establishment>('/establishments', {
      name: data.name,
      createdBy,
    })

    return mapEstablishment(response.data)
  },

  update: async (id: string, data: EstablishmentUpdateInput): Promise<Establishment> => {
    const response = await apiClient.put<Establishment>(`/establishments/${id}`, {
      name: data.name,
    })

    return mapEstablishment(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/establishments/${id}`)
  },
}
