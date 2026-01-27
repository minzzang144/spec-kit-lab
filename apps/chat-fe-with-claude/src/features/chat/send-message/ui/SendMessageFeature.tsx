import { useCallback } from 'react'
import { useSendMessageFlow } from '../hooks/useSendMessageFlow'
import { ChatInputWidget } from '@/widgets/chat-input'

interface SendMessageFeatureProps {
  roomId: string
  disabled?: boolean
  className?: string
  onMessageSent?: (content: string) => void
}

export function SendMessageFeature({
  roomId,
  disabled = false,
  className,
  onMessageSent,
}: SendMessageFeatureProps) {
  const { sendMessage, isSending, error } = useSendMessageFlow()

  const handleSendMessage = useCallback(
    async (content: string, messageRoomId: string) => {
      try {
        await sendMessage(content, messageRoomId)
        onMessageSent?.(content)
        console.log('Message sent successfully:', content)
      } catch (error) {
        console.error('Failed to send message:', error)
        // Error handling is done in the useSendMessageFlow hook
      }
    },
    [sendMessage, onMessageSent]
  )

  return (
    <div className={className}>
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <ChatInputWidget
        roomId={roomId}
        onSendMessage={handleSendMessage}
        disabled={disabled || isSending}
        placeholder={disabled ? '채팅이 비활성화되었습니다' : '메시지를 입력하세요...'}
      />
    </div>
  )
}

export default SendMessageFeature