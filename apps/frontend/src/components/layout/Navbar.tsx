import React from 'react'
import { Bell, Wine } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProducts } from '@/hooks'

export const Navbar: React.FC = () => {
  const { user } = useAuthStore()
  const { data: products } = useProducts()
  const lowStock = products?.filter(
    (p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold
  ).length ?? 0

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
          <div className="w-8 h-8 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center text-brand font-display font-bold text-sm">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  )
}
