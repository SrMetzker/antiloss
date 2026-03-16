import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  activeEstablishmentId: string | null
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
  setActiveEstablishmentId: (id: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      activeEstablishmentId: null,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          activeEstablishmentId: user.establishments?.[0]?.establishmentId ?? null,
        }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, activeEstablishmentId: null }),

      setUser: (user) => set({ user }),

      setActiveEstablishmentId: (id) => set({ activeEstablishmentId: id }),
    }),
    {
      name: 'barflow-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        activeEstablishmentId: state.activeEstablishmentId,
      }),
    }
  )
)
