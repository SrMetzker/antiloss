import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  headerActions?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-2',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  headerActions,
  children,
  size = 'md',
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        className={`
          relative w-full ${sizeMap[size]}
          bg-bg-surface border border-bg-border
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl animate-slide-up
          max-h-[92dvh] flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-bg-border rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border flex-shrink-0">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            <div className="flex items-center gap-2">
              {headerActions}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-bg-border flex-shrink-0 bottom-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-300 text-sm mb-6">{message}</p>
    <div className="flex gap-3">
      <button onClick={onClose} className="btn-secondary flex-1">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="btn-danger flex-1 flex items-center justify-center gap-2"
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
)
