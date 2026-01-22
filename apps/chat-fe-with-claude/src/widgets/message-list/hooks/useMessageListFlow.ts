import { useEffect, useCallback } from 'react'
import { useSocket } from '@/app/providers/socket-hooks'
import type { MessageData } from '@/generated/socket-types'
import { useMessageListModel } from '../model/useMessageListModel'

export interface MessageListFlow {
  messages: MessageData[]
  isLoading: boolean
  error: string | null
  isScrolledToBottom: boolean
  setScrolledToBottom: (isScrolled: boolean) => void
  clearError: () => void
  scrollToBottom: () => void
}

interface UseMessageListFlowProps {
  roomId?: string
  initialMessages?: MessageData[]
  autoScroll?: boolean
}

export function useMessageListFlow({
  roomId,
  initialMessages = [],
  autoScroll = true,
}: UseMessageListFlowProps): MessageListFlow {
  const { socket, isConnected } = useSocket()
  const model = useMessageListModel()

  // Set initial messages
  useEffect(() => {
    if (initialMessages.length > 0) {
      model.setMessages(initialMessages)
    }
  }, [initialMessages, model])

  // Socket event listeners for real-time message updates
  useEffect(() => {
    if (!socket || !isConnected || !roomId) return

    console.log('🔌 Setting up message listeners for room:', roomId)

    // Handle new message received
    const handleMessageReceived = (data: { message: MessageData }) => {
      console.log('📨 New message received:', data.message)
      model.addMessage(data.message)
    }

    // Handle room joined (includes existing messages)
    const handleRoomJoined = (data: { room: { messages: MessageData[] } }) => {
      console.log('🏠 Room joined, loading messages:', data.room.messages.length)
      model.setMessages(data.room.messages)
    }

    // Handle user activity (system messages)
    const handleUserActivity = (data: {
      type: 'joined' | 'left'
      user: { id: string; nickname: string }
      roomId: string
    }) => {
      if (data.roomId === roomId) {
        console.log(`👤 User ${data.type}:`, data.user.nickname)

        // Create system message
        const systemMessage: MessageData = {
          id: `system-${Date.now()}-${Math.random()}`,
          content: data.type === 'joined'
            ? `${data.user.nickname}님이 입장했습니다.`
            : `${data.user.nickname}님이 나갔습니다.`,
          authorId: 'system',
          authorNickname: 'System',
          roomId: data.roomId,
          createdAt: new Date().toISOString(),
          type: 'system',
        }

        model.addMessage(systemMessage)
      }
    }

    // Handle errors
    const handleError = (data: { message: string; code?: string }) => {
      console.error('❌ Message-related error:', data.message)
      model.setError(data.message)
    }

    socket.on('message-received', handleMessageReceived)
    socket.on('room-joined', handleRoomJoined)
    socket.on('user-activity', handleUserActivity)
    socket.on('error', handleError)

    return () => {
      console.log('🔌 Cleaning up message listeners')
      socket.off('message-received', handleMessageReceived)
      socket.off('room-joined', handleRoomJoined)
      socket.off('user-activity', handleUserActivity)
      socket.off('error', handleError)
    }
  }, [socket, isConnected, roomId, model])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    // This will be called by the UI component
    model.setScrolledToBottom(true)
  }, [model])

  return {
    messages: model.state.messages,
    isLoading: model.state.isLoading,
    error: model.state.error,
    isScrolledToBottom: model.state.isScrolledToBottom,
    setScrolledToBottom: model.setScrolledToBottom,
    clearError: model.clearError,
    scrollToBottom,
  }
}