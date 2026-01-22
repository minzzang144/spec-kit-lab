import { Send, Loader2, AlertCircle } from 'lucide-react'
import { useChatInputFlow } from '../hooks/useChatInputFlow'

interface ChatInputWidgetProps {
  roomId?: string
  onSendMessage?: (message: string, roomId: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ChatInputWidget({
  roomId,
  onSendMessage,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
  className = '',
}: ChatInputWidgetProps) {
  const chatInput = useChatInputFlow({
    roomId,
    onSendMessage,
    disabled,
  })

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="p-4">
        {/* Error Message */}
        {chatInput.error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{chatInput.error}</p>
              <button
                onClick={chatInput.clearError}
                className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                type="button"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={chatInput.message}
              onChange={(e) => chatInput.updateMessage(e.target.value)}
              onKeyDown={chatInput.handleKeyPress}
              onCompositionStart={() => chatInput.setComposing(true)}
              onCompositionEnd={() => chatInput.setComposing(false)}
              placeholder={placeholder}
              disabled={disabled || chatInput.isSending}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                resize-none transition-colors
                ${disabled || chatInput.isSending
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-900'
                }
              `}
              rows={1}
              maxLength={500}
              style={{
                minHeight: '40px',
                maxHeight: '120px',
              }}
            />

            {/* Character Counter */}
            <div className="absolute -bottom-5 right-0 text-xs text-gray-500">
              {chatInput.message.length}/500
              {chatInput.remainingChars < 50 && (
                <span className="text-yellow-600 ml-1">
                  ({chatInput.remainingChars} 남음)
                </span>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={chatInput.sendMessage}
            disabled={!chatInput.canSend || disabled}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${chatInput.canSend && !disabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            type="button"
          >
            {chatInput.isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>전송중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>전송</span>
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-gray-500">
          <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
            Enter
          </kbd>
          로 전송,{' '}
          <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
            Shift + Enter
          </kbd>
          로 줄바꿈
        </div>
      </div>
    </div>
  )
}

export default ChatInputWidget