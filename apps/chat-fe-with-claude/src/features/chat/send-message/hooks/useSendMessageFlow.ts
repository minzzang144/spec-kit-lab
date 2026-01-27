import { useCallback, useEffect } from 'react'
import { useSocket } from '@/app/providers/socket-hooks'
import { SessionManager } from '@/shared/lib/session-manager'
import { useSendMessageModel } from '../model/useSendMessageModel'

export interface SendMessageFlow {
  isSending: boolean
  error: string | null
  sendMessage: (content: string, roomId: string) => Promise<void>
  clearError: () => void
}

export function useSendMessageFlow(): SendMessageFlow {
  const { socket, isConnected } = useSocket()
  const model = useSendMessageModel()

  // Listen for message sending acknowledgments and errors
  useEffect(() => {
    if (!socket) return

    // Listen for successful message receipt
    const handleMessageSent = (data: { messageId: string }) => {
      console.log('✅ Message sent successfully:', data.messageId)
      model.setLastMessageId(data.messageId)
      model.setSending(false)
    }

    // Listen for message errors
    const handleMessageError = (data: { message: string; code?: string }) => {
      console.error('❌ Message send error:', data.message)
      model.setError(data.message)
    }

    // Generic error handler
    const handleError = (data: { message: string; code?: string }) => {
      console.error('❌ Socket error:', data.message)
      if (model.state.isSending) {
        model.setError(data.message)
      }
    }

    socket.on('message-sent', handleMessageSent)
    socket.on('message-error', handleMessageError)
    socket.on('error', handleError)

    return () => {
      socket.off('message-sent', handleMessageSent)
      socket.off('message-error', handleMessageError)
      socket.off('error', handleError)
    }
  }, [socket, model])

  const sendMessage = useCallback(
    async (content: string, roomId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          const error = '서버에 연결되지 않았습니다'
          model.setError(error)
          reject(new Error(error))
          return
        }

        const session = SessionManager.load()
        if (!session || !SessionManager.isValid(session)) {
          const error = '사용자 세션이 유효하지 않습니다'
          model.setError(error)
          reject(new Error(error))
          return
        }

        const trimmedContent = content.trim()
        if (!trimmedContent) {
          const error = '메시지 내용을 입력해주세요'
          model.setError(error)
          reject(new Error(error))
          return
        }

        if (trimmedContent.length > 500) {
          const error = '메시지는 500자를 초과할 수 없습니다'
          model.setError(error)
          reject(new Error(error))
          return
        }

        console.log('💬 Sending message:', {
          roomId,
          content: trimmedContent,
          author: session.nickname,
        })

        model.setSending(true)

        try {
          // Send message via Socket.IO
          socket.emit('send-message', {
            roomId,
            content: trimmedContent,
          })

          // For now, we'll resolve immediately since we don't have proper ack handling
          // In a real implementation, you'd wait for server acknowledgment
          setTimeout(() => {
            model.setSending(false)
            resolve()
          }, 100)

        } catch (error) {
          console.error('Failed to send message:', error)
          const errorMessage = error instanceof Error ? error.message : '메시지 전송에 실패했습니다'
          model.setError(errorMessage)
          reject(new Error(errorMessage))
        }
      })
    },
    [socket, isConnected, model]
  )

  return {
    isSending: model.state.isSending,
    error: model.state.error,
    sendMessage,
    clearError: model.clearError,
  }
}