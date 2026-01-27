import { AlertCircle, TriangleAlert, XCircle, RefreshCw, X } from 'lucide-react'

interface ErrorMessageProps {
  /**
   * Error message text
   */
  message: string

  /**
   * Error type/variant
   */
  variant?: 'error' | 'warning' | 'danger'

  /**
   * Size of the error message
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether to show an icon
   */
  showIcon?: boolean

  /**
   * Whether to show a retry button
   */
  showRetry?: boolean

  /**
   * Whether to show a dismiss button
   */
  showDismiss?: boolean

  /**
   * Retry button handler
   */
  onRetry?: () => void

  /**
   * Dismiss button handler
   */
  onDismiss?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  danger: {
    container: 'bg-red-100 border-red-300 text-red-900',
    icon: 'text-red-700',
    button: 'bg-red-700 hover:bg-red-800 text-white',
  },
}

const sizeStyles = {
  sm: {
    container: 'p-3 text-sm',
    icon: 'w-4 h-4',
    button: 'px-2 py-1 text-xs',
  },
  md: {
    container: 'p-4 text-base',
    icon: 'w-5 h-5',
    button: 'px-3 py-1.5 text-sm',
  },
  lg: {
    container: 'p-6 text-lg',
    icon: 'w-6 h-6',
    button: 'px-4 py-2 text-base',
  },
}

const variantIcons = {
  error: AlertCircle,
  warning: TriangleAlert,
  danger: XCircle,
} as const

export function ErrorMessage({
  message,
  variant = 'error',
  size = 'md',
  showIcon = true,
  showRetry = false,
  showDismiss = false,
  onRetry,
  onDismiss,
  className = '',
}: ErrorMessageProps) {
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]
  const Icon = variantIcons[variant]

  return (
    <div
      className={`
        border rounded-lg flex items-start space-x-3
        ${variantStyle.container}
        ${sizeStyle.container}
        ${className}
      `}
      role="alert"
    >
      {showIcon && (
        <div className="flex-shrink-0">
          <Icon className={`${sizeStyle.icon} ${variantStyle.icon}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium">{message}</p>
      </div>

      <div className="flex-shrink-0 flex items-center space-x-2">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className={`
              inline-flex items-center rounded-md font-medium transition-colors
              ${variantStyle.button}
              ${sizeStyle.button}
            `}
            type="button"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            다시 시도
          </button>
        )}

        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className={`
              p-1 rounded-md transition-colors hover:bg-black hover:bg-opacity-10
              ${variantStyle.icon}
            `}
            type="button"
            aria-label="오류 메시지 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Full-screen error message
 */
export function FullScreenError({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  onBack,
}: {
  title?: string
  message: string
  onRetry?: () => void
  onBack?: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex space-x-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              type="button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              type="button"
            >
              뒤로 가기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}