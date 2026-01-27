/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    addToast({ type: 'error', message, title, duration: 7000 })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }, [addToast])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

const toastStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
  },
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
} as const

function ToastItem({ toast, onClose }: ToastItemProps) {
  const style = toastStyles[toast.type]
  const Icon = toastIcons[toast.type]

  return (
    <div
      className={`
        w-96 max-w-sm bg-white border rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        ${style.container}
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${style.icon}`} />
        </div>

        <div className="ml-3 flex-1">
          {toast.title && (
            <p className={`text-sm font-medium ${style.title}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${style.message} ${toast.title ? 'mt-1' : ''}`}>
            {toast.message}
          </p>

          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`text-xs font-medium px-2 py-1 rounded hover:bg-black hover:bg-opacity-10 ${style.title}`}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 ${style.icon}`}
            type="button"
            aria-label="토스트 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}