import { ArrowLeft, Loader2, LogOut } from 'lucide-react'

export interface LeaveRoomButtonProps {
  /**
   * Button variant styling
   * - 'back': Shows arrow-left icon, styled like a back button
   * - 'exit': Shows log-out icon, styled like an exit button
   */
  variant?: 'back' | 'exit'

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether the leave operation is in progress
   */
  isLeaving?: boolean

  /**
   * Whether the button should be disabled
   */
  disabled?: boolean

  /**
   * Click handler - should trigger leave room action
   */
  onClick: () => void

  /**
   * Optional custom text for the button
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

export function LeaveRoomButton({
  variant = 'back',
  size = 'md',
  isLeaving = false,
  disabled = false,
  onClick,
  children,
  className = '',
}: LeaveRoomButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    back: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    exit: 'text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500',
  }

  const sizeClasses = {
    sm: 'p-1.5 text-sm rounded-md',
    md: 'p-2 text-base rounded-md',
    lg: 'px-4 py-2 text-base rounded-lg',
  }

  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400'

  const Icon = isLeaving ? Loader2 : (variant === 'back' ? ArrowLeft : LogOut)
  const iconClasses = isLeaving ? 'animate-spin' : ''

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className
  ].join(' ')

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <button
      type="button"
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || isLeaving}
      aria-label={variant === 'back' ? '이전으로' : '방 나가기'}
    >
      <Icon className={`${iconSize} ${iconClasses}`} />
      {children && (
        <span className={size === 'lg' ? 'ml-2' : 'sr-only'}>
          {children}
        </span>
      )}
    </button>
  )
}