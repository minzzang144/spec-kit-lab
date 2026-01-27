import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Optional loading text
   */
  text?: string

  /**
   * Whether to center the spinner in its container
   */
  center?: boolean

  /**
   * Custom color class for the spinner
   */
  color?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function LoadingSpinner({
  size = 'md',
  text,
  center = false,
  color = 'text-blue-600',
  className = '',
}: LoadingSpinnerProps) {
  const spinnerClasses = `${sizeClasses[size]} ${color} animate-spin ${className}`

  const content = (
    <>
      <Loader2 className={spinnerClasses} />
      {text && (
        <span className="ml-2 text-sm text-gray-600">
          {text}
        </span>
      )}
    </>
  )

  if (center) {
    return (
      <div className="flex items-center justify-center space-x-2">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {content}
    </div>
  )
}

/**
 * Full-screen loading spinner overlay
 */
export function LoadingOverlay({ text = '로딩 중...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LoadingSpinner size="lg" text={text} center />
      </div>
    </div>
  )
}

/**
 * Page-level loading spinner
 */
export function PageLoadingSpinner({ text = '페이지를 불러오는 중...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} center />
    </div>
  )
}