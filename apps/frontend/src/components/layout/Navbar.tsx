import React, { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Users, Wine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProducts } from '@/hooks'
import { hasAnyRole, ROUTE_ROLE_MAP } from '@/utils/rbac'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: products } = useProducts()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const canAccessUsers = hasAnyRole(user?.role, ROUTE_ROLE_MAP['/users'])

  const lowStock = products?.filter(
    (p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold
  ).length ?? 0

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return
      if (menuRef.current.contains(event.target as Node)) return
      setMenuOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const handleOpenUsers = () => {
    setMenuOpen(false)
    navigate('/users')
  }

  return (
    <header className="md:hidden sticky top-0 z-30 bg-bg-surface border-b border-bg-border">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
            <Wine className="w-4 h-4 text-black" />
          </div>
          <span className="font-display font-bold text-white text-lg">BarFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {lowStock > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {lowStock}
              </span>
            </div>
          )}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center text-brand font-display font-bold text-sm"
            >
              {user?.name.charAt(0)}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-56 card-elevated p-2 z-40 animate-slide-up">
                <div className="px-2 py-2 border-b border-bg-border mb-1">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role ?? 'user'}</p>
                </div>

                {canAccessUsers && (
                  <button
                    type="button"
                    onClick={handleOpenUsers}
                    className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-left text-sm text-gray-300 hover:bg-bg-elevated hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
