import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowDown, Loader2 } from 'lucide-react'
import type { MessageData } from '@/generated/socket-types'
import { SessionManager } from '@/shared/lib/session-manager'
import { useMessageListFlow } from '../hooks/useMessageListFlow'
import { MessageItem } from './MessageItem'

interface MessageListWidgetProps {
  roomId?: string
  initialMessages?: MessageData[]
  autoScroll?: boolean
  showScrollToBottom?: boolean
  className?: string
}

export function MessageListWidget({
  roomId,
  initialMessages = [],
  autoScroll = true,
  showScrollToBottom = true,
  className = '',
}: MessageListWidgetProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const {
    messages,
    isLoading,
    error,
    isScrolledToBottom,
    setScrolledToBottom,
    clearError,
    scrollToBottom,
  } = useMessageListFlow({
    roomId,
    initialMessages,
    autoScroll,
  })

  // Get current user info
  const currentUser = SessionManager.load()
  const currentUserId = currentUser?.userId

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (autoScroll && isScrolledToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll, isScrolledToBottom])

  // Handle scroll events to detect if user is at bottom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

      setScrolledToBottom(isAtBottom)
      setShowScrollButton(!isAtBottom && showScrollToBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [setScrolledToBottom, showScrollToBottom])

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    scrollToBottom()
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>메시지를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-2 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="flex-1 text-sm text-red-800">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            type="button"
          >
            닫기
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
      >
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">아직 메시지가 없습니다</p>
              <p className="text-sm">첫 번째 메시지를 보내보세요! 💬</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = currentUserId && message.authorId === currentUserId
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showTimestamp = !prevMessage ||
                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 60000 // 1 minute

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showTimestamp={showTimestamp}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          type="button"
          title="최신 메시지로 이동"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Loading more messages indicator */}
      {isLoading && messages.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">메시지 로딩 중...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageListWidget