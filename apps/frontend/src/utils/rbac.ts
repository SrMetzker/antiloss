import type { User } from '@/types'

export type AppRole = NonNullable<User['role']>

type AppRoute =
  | '/dashboard'
  | '/kitchen'
  | '/tables'
  | '/products'
  | '/recipes'
  | '/inventory'
  | '/reports'
  | '/establishments'
  | '/users'
  | '/subscription'

const SALES_ROLES: readonly AppRole[] = ['admin', 'manager']

export const ROUTE_ROLE_MAP: Record<AppRoute, readonly AppRole[]> = {
  '/dashboard': SALES_ROLES,
  '/kitchen': ['admin', 'manager', 'chef'],
  '/tables': ['admin', 'manager', 'bartender'],
  '/products': ['admin', 'manager', 'bartender', 'chef'],
  '/recipes': ['admin', 'manager', 'chef'],
  '/inventory': ['admin', 'manager', 'chef'],
  '/reports': SALES_ROLES,
  '/establishments': ['admin', 'manager', 'bartender', 'chef'],
  '/users': ['admin', 'manager'],
  '/subscription': ['admin', 'manager'],
}

export const normalizeRole = (value: unknown): AppRole | null => {
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()

  if (normalized === 'admin' || normalized === 'manager' || normalized === 'bartender' || normalized === 'chef') {
    return normalized
  }

  return null
}

export const hasAnyRole = (
  role: User['role'] | null | undefined,
  allowedRoles: readonly AppRole[]
) => {
  const normalizedRole = normalizeRole(role)
  return normalizedRole ? allowedRoles.includes(normalizedRole) : false
}

export const canViewSalesData = (role: User['role'] | null | undefined) => {
  return hasAnyRole(role, SALES_ROLES)
}

export const getDefaultRouteForRole = (role: User['role'] | null | undefined) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'admin' || normalizedRole === 'manager') return '/dashboard'
  if (normalizedRole === 'bartender') return '/tables'
  if (normalizedRole === 'chef') return '/kitchen'

  return '/login'
}