import { Plus, Loader } from 'lucide-react'

interface CreateRoomButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export const CreateRoomButton = ({
  onClick,
  disabled = false,
  isLoading = false,
  className = '',
  variant = 'primary',
  size = 'md',
}: CreateRoomButtonProps) => {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
      title="새 채팅방 만들기"
    >
      {isLoading ? (
        <Loader size={iconSizes[size]} className="animate-spin" />
      ) : (
        <Plus size={iconSizes[size]} />
      )}
      <span className="hidden sm:inline">새 방 만들기</span>
      <span className="sm:hidden">새 방</span>
    </button>
  )
}

export default CreateRoomButton