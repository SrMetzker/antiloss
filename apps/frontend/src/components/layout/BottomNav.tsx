import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Package, Warehouse, BarChart3 } from 'lucide-react'

const bottomNavItems = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
  { path: '/tables', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Tables' },
  { path: '/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
  { path: '/inventory', icon: <Warehouse className="w-5 h-5" />, label: 'Stock' },
  { path: '/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
]

export const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-border bottom-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {bottomNavItems.map((item) => (
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
