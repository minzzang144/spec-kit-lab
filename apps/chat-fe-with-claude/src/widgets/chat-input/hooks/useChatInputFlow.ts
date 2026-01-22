import { useCallback } from 'react'
import { useChatInputModel } from '../model/useChatInputModel'

export interface ChatInputFlow {
  message: string
  isComposing: boolean
  isSending: boolean
  error: string | null
  canSend: boolean
  remainingChars: number
  updateMessage: (message: string) => void
  sendMessage: () => void
  handleKeyPress: (e: React.KeyboardEvent) => void
  clearError: () => void
}

interface UseChatInputFlowProps {
  roomId?: string
  onSendMessage?: (message: string, roomId: string) => Promise<void>
  disabled?: boolean
}

export function useChatInputFlow({
  roomId,
  onSendMessage,
  disabled = false,
}: UseChatInputFlowProps): ChatInputFlow {
  const model = useChatInputModel()

  const sendMessage = useCallback(async () => {
    if (!model.canSend || disabled || !roomId || !onSendMessage) {
      return
    }

    const messageToSend = model.state.message.trim()
    if (!messageToSend) return

    try {
      model.setSending(true)
      await onSendMessage(messageToSend, roomId)
      model.clearMessage()
    } catch (error) {
      console.error('Failed to send message:', error)
      model.setError(
        error instanceof Error ? error.message : '메시지 전송에 실패했습니다'
      )
    } finally {
      model.setSending(false)
    }
  }, [model, disabled, roomId, onSendMessage])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage, disabled]
  )

  const clearError = useCallback(() => {
    model.setError(null)
  }, [model])

  return {
    message: model.state.message,
    isComposing: model.state.isComposing,
    isSending: model.state.isSending,
    error: model.state.error,
    canSend: model.canSend && !disabled,
    remainingChars: model.remainingChars,
    updateMessage: model.updateMessage,
    sendMessage,
    handleKeyPress,
    clearError,
  }
}