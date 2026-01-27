import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the button is in loading state
   */
  loading?: boolean

  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Loading text to show when loading
   */
  loadingText?: string

  /**
   * Icon to show when not loading
   */
  icon?: ReactNode

  /**
   * Whether button should be full width
   */
  fullWidth?: boolean

  /**
   * Button content
   */
  children: ReactNode
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function LoadingButton({
  loading = false,
  variant = 'primary',
  size = 'md',
  loadingText,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled

  const buttonClasses = [
    'inline-flex items-center justify-center font-medium rounded-md',
    'transition-colors duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}