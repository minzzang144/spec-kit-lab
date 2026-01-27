import type { MessageData } from '@/generated/socket-types'
import { MessageModel } from '@/entities/message'

interface MessageItemProps {
  message: MessageData
  isCurrentUser?: boolean
  showTimestamp?: boolean
  className?: string
}

export function MessageItem({
  message,
  isCurrentUser = false,
  showTimestamp = true,
  className = '',
}: MessageItemProps) {
  const isSystemMessage = message.type === 'system' || message.authorId === 'system'

  if (isSystemMessage) {
    return (
      <div className={`flex justify-center py-2 ${className}`}>
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {/* Author name (only for other users) */}
        {!isCurrentUser && (
          <div className="text-sm font-medium text-gray-700 mb-1 px-1">
            {message.authorNickname}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl break-words
            ${isCurrentUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }
          `}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div
            className={`
              text-xs text-gray-500 mt-1 px-1
              ${isCurrentUser ? 'text-right' : 'text-left'}
            `}
          >
            {MessageModel.formatTimestamp({
              ...message,
              createdAt: new Date(message.createdAt),
            })}
          </div>
        )}
      </div>

      {/* Avatar placeholder (for other users) */}
      {!isCurrentUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 order-0 flex-shrink-0">
          <span className="text-sm font-medium text-gray-600">
            {message.authorNickname.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

export default MessageItem