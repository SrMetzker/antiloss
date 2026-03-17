import apiClient from '@/api/client'
import type { SubscriptionStatusResponse } from '@/types'

export interface MarkSubscriptionAsPaidPayload {
  establishmentId?: string
  providerReference?: string
  amountCents?: number
}

export interface ChangeSubscriptionPlanPayload {
  establishmentId?: string
  planCode: string
}

export const subscriptionApi = {
  getStatus: async (establishmentId?: string): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient.get<SubscriptionStatusResponse>('/users/subscription/status', {
      params: establishmentId ? { establishmentId } : undefined,
    })
    return response.data
  },

  markAsPaid: async (payload: MarkSubscriptionAsPaidPayload): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient.post<SubscriptionStatusResponse>(
      '/users/subscription/mark-paid',
      payload
    )
    return response.data
  },

  changePlan: async (payload: ChangeSubscriptionPlanPayload): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient.post<SubscriptionStatusResponse>(
      '/users/subscription/change-plan',
      payload
    )
    return response.data
  },
}
