import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Package, Warehouse, BarChart3, BookOpen, ChefHat, Building2, Users, CreditCard, MoreVertical } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasAnyRole, ROUTE_ROLE_MAP, type AppRole } from '@/utils/rbac'
import { BottomNavMoreMenu } from './BottomNavMoreMenu'

// Primary items shown in bottom nav
const primaryBottomNavItems = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home', allowedRoles: ROUTE_ROLE_MAP['/dashboard'] },
  { path: '/kitchen', icon: <ChefHat className="w-5 h-5" />, label: 'Kitchen', allowedRoles: ROUTE_ROLE_MAP['/kitchen'] },
  { path: '/tables', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Tables', allowedRoles: ROUTE_ROLE_MAP['/tables'] },
  { path: '/products', icon: <Package className="w-5 h-5" />, label: 'Products', allowedRoles: ROUTE_ROLE_MAP['/products'] },
]

// Secondary items in More menu
const secondaryBottomNavItems = [
  { path: '/recipes', icon: <BookOpen className="w-5 h-5" />, label: 'Recipes', allowedRoles: ROUTE_ROLE_MAP['/recipes'] },
  { path: '/inventory', icon: <Warehouse className="w-5 h-5" />, label: 'Stock', allowedRoles: ROUTE_ROLE_MAP['/inventory'] },
  { path: '/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports', allowedRoles: ROUTE_ROLE_MAP['/reports'] },
  { path: '/establishments', icon: <Building2 className="w-5 h-5" />, label: 'Establishments', allowedRoles: ROUTE_ROLE_MAP['/establishments'] },
  { path: '/users', icon: <Users className="w-5 h-5" />, label: 'Users', allowedRoles: ROUTE_ROLE_MAP['/users'] },
  { path: '/subscription', icon: <CreditCard className="w-5 h-5" />, label: 'Subscription', allowedRoles: ROUTE_ROLE_MAP['/subscription'] },
]

interface BottomNavItem {
  path: string
  icon: React.ReactNode
  label: string
  allowedRoles: readonly AppRole[]
}

export const BottomNav: React.FC = () => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { user } = useAuthStore()
  const visiblePrimaryItems = (primaryBottomNavItems as BottomNavItem[]).filter((item) => hasAnyRole(user?.role, item.allowedRoles))
  const visibleSecondaryItems = (secondaryBottomNavItems as BottomNavItem[]).filter((item) => hasAnyRole(user?.role, item.allowedRoles))
  const hasSecondaryItems = visibleSecondaryItems.length > 0

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-border bottom-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {visiblePrimaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item flex-1 ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          ))}

          {hasSecondaryItems && (
            <button
              onClick={() => setMoreMenuOpen(true)}
              className={`nav-item flex-1 ${moreMenuOpen ? 'active' : ''}`}
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
              <span className="text-[10px] font-semibold">More</span>
            </button>
          )}
        </div>
      </nav>

      <BottomNavMoreMenu
        items={visibleSecondaryItems}
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
      />
    </>
  )
}
