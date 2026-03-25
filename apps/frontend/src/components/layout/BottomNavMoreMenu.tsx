import React from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasAnyRole, type AppRole } from '@/utils/rbac'

interface MoreMenuItem {
  path: string
  icon: React.ReactNode
  label: string
  allowedRoles: readonly AppRole[]
}

interface BottomNavMoreMenuProps {
  items: MoreMenuItem[]
  isOpen: boolean
  onClose: () => void
}

export const BottomNavMoreMenu: React.FC<BottomNavMoreMenuProps> = ({ items, isOpen, onClose }) => {
  const { user } = useAuthStore()
  const visibleItems = items.filter((item) => hasAnyRole(user?.role, item.allowedRoles))

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 md:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-20 left-0 right-0 z-50 mx-2 rounded-2xl bg-bg-surface border border-bg-border shadow-xl md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
          <h2 className="font-semibold text-white">More</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-elevated rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <nav className="grid grid-cols-3 gap-1 p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-brand-muted text-brand border border-brand/20'
                    : 'text-gray-400 hover:text-white hover:bg-bg-elevated'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-[10px] font-semibold text-center leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
