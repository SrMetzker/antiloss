import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Package, Warehouse, BarChart3, BookOpen, ChefHat } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasAnyRole, ROUTE_ROLE_MAP, type AppRole } from '@/utils/rbac'

const bottomNavItems = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home', allowedRoles: ROUTE_ROLE_MAP['/dashboard'] },
  { path: '/kitchen', icon: <ChefHat className="w-5 h-5" />, label: 'Kitchen', allowedRoles: ROUTE_ROLE_MAP['/kitchen'] },
  { path: '/tables', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Tables', allowedRoles: ROUTE_ROLE_MAP['/tables'] },
  { path: '/products', icon: <Package className="w-5 h-5" />, label: 'Products', allowedRoles: ROUTE_ROLE_MAP['/products'] },
  { path: '/recipes', icon: <BookOpen className="w-5 h-5" />, label: 'Recipes', allowedRoles: ROUTE_ROLE_MAP['/recipes'] },
  { path: '/inventory', icon: <Warehouse className="w-5 h-5" />, label: 'Stock', allowedRoles: ROUTE_ROLE_MAP['/inventory'] },
  { path: '/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports', allowedRoles: ROUTE_ROLE_MAP['/reports'] },
]

interface BottomNavItem {
  path: string
  icon: React.ReactNode
  label: string
  allowedRoles: readonly AppRole[]
}

export const BottomNav: React.FC = () => {
  const { user } = useAuthStore()
  const visibleItems = (bottomNavItems as BottomNavItem[]).filter((item) => hasAnyRole(user?.role, item.allowedRoles))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-border bottom-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {visibleItems.map((item) => (
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
      </div>
    </nav>
  )
}
