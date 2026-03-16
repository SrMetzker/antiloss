import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDefaultRouteForRole, hasAnyRole, type AppRole } from '@/utils/rbac'

interface RoleGuardProps extends PropsWithChildren {
  allowedRoles: readonly AppRole[]
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasAnyRole(user?.role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />
  }

  return children
}