import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/types'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
}

const styles: Record<ToastType, string> = {
  success: 'border-green-500/25 bg-green-500/10',
  error: 'border-red-500/25 bg-red-500/10',
  warning: 'border-amber-500/25 bg-amber-500/10',
  info: 'border-blue-500/25 bg-blue-500/10',
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-2xl border
            bg-bg-surface backdrop-blur-sm shadow-2xl
            ${styles[toast.type]}
            animate-slide-in-right pointer-events-auto
          `}
        >
          {icons[toast.type]}
          <p className="text-sm text-gray-100 font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
