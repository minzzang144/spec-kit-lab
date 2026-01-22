import { ReactNode } from 'react'
import { MessageSquare, Users, Search, Inbox } from 'lucide-react'

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: ReactNode

  /**
   * Predefined icon type for common scenarios
   */
  iconType?: 'messages' | 'users' | 'search' | 'inbox' | 'custom'

  /**
   * Title of the empty state
   */
  title: string

  /**
   * Description text
   */
  description?: string

  /**
   * Primary action button
   */
  action?: {
    label: string
    onClick: () => void
  }

  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string
    onClick: () => void
  }

  /**
   * Size of the empty state
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string
}

const getIconByType = (type: EmptyStateProps['iconType']) => {
  switch (type) {
    case 'messages':
      return MessageSquare
    case 'users':
      return Users
    case 'search':
      return Search
    case 'inbox':
      return Inbox
    default:
      return MessageSquare
  }
}

const sizeStyles = {
  sm: {
    container: 'p-6',
    icon: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-sm',
    button: 'px-4 py-2 text-sm',
  },
  md: {
    container: 'p-8',
    icon: 'w-16 h-16',
    title: 'text-xl',
    description: 'text-base',
    button: 'px-4 py-2 text-base',
  },
  lg: {
    container: 'p-12',
    icon: 'w-20 h-20',
    title: 'text-2xl',
    description: 'text-lg',
    button: 'px-6 py-3 text-lg',
  },
}

export function EmptyState({
  icon,
  iconType = 'messages',
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const styles = sizeStyles[size]
  const IconComponent = getIconByType(iconType)

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      {/* Icon */}
      <div className={`text-gray-400 mb-4 ${styles.icon}`}>
        {icon || <IconComponent className={styles.icon} />}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-2 ${styles.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-gray-500 mb-6 max-w-md ${styles.description}`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`
                bg-blue-600 text-white rounded-md hover:bg-blue-700
                transition-colors font-medium ${styles.button}
              `}
              type="button"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`
                bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300
                transition-colors font-medium ${styles.button}
              `}
              type="button"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Predefined empty states for common scenarios
 */
export const EmptyStates = {
  NoMessages: ({ onSendFirst }: { onSendFirst?: () => void }) => (
    <EmptyState
      iconType="messages"
      title="아직 메시지가 없어요"
      description="첫 번째 메시지를 보내서 대화를 시작해보세요!"
      action={onSendFirst ? { label: '메시지 작성하기', onClick: onSendFirst } : undefined}
    />
  ),

  NoParticipants: ({ onInvite }: { onInvite?: () => void }) => (
    <EmptyState
      iconType="users"
      title="참여자가 없습니다"
      description="다른 사용자들이 방에 참여할 때까지 기다려보세요."
      action={onInvite ? { label: '초대하기', onClick: onInvite } : undefined}
    />
  ),

  NoRooms: ({ onCreateRoom }: { onCreateRoom?: () => void }) => (
    <EmptyState
      iconType="search"
      title="활성화된 채팅방이 없어요"
      description="새로운 채팅방을 만들어서 다른 사용자들과 대화를 시작해보세요!"
      action={onCreateRoom ? { label: '새 채팅방 만들기', onClick: onCreateRoom } : undefined}
    />
  ),

  SearchNoResults: ({ query, onClear }: { query?: string; onClear?: () => void }) => (
    <EmptyState
      iconType="search"
      title="검색 결과가 없습니다"
      description={query ? `"${query}"에 대한 결과를 찾을 수 없습니다.` : '다른 키워드로 검색해보세요.'}
      action={onClear ? { label: '검색 초기화', onClick: onClear } : undefined}
    />
  ),
}