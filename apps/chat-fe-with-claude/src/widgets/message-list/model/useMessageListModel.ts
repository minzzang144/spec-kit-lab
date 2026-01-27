import { useState, useCallback } from 'react'
import type { MessageData } from '@/generated/socket-types'

interface MessageListState {
  messages: MessageData[]
  isLoading: boolean
  error: string | null
  isScrolledToBottom: boolean
}

export interface MessageListModel {
  state: MessageListState
  setMessages: (messages: MessageData[]) => void
  addMessage: (message: MessageData) => void
  updateMessage: (messageId: string, updates: Partial<MessageData>) => void
  removeMessage: (messageId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setScrolledToBottom: (isScrolled: boolean) => void
  clearMessages: () => void
  clearError: () => void
}

export function useMessageListModel(): MessageListModel {
  const [state, setState] = useState<MessageListState>({
    messages: [],
    isLoading: false,
    error: null,
    isScrolledToBottom: true,
  })

  const setMessages = useCallback((messages: MessageData[]) => {
    setState(prev => ({
      ...prev,
      messages: [...messages].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
      error: null,
    }))
  }, [])

  const addMessage = useCallback((message: MessageData) => {
    setState(prev => {
      // Avoid duplicates
      const exists = prev.messages.some(m => m.id === message.id)
      if (exists) return prev

      const newMessages = [...prev.messages, message].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      return {
        ...prev,
        messages: newMessages,
        error: null,
      }
    })
  }, [])

  const updateMessage = useCallback((messageId: string, updates: Partial<MessageData>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(message =>
        message.id === messageId ? { ...message, ...updates } : message
      ),
    }))
  }, [])

  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(message => message.id !== messageId),
    }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }))
  }, [])

  const setScrolledToBottom = useCallback((isScrolled: boolean) => {
    setState(prev => ({
      ...prev,
      isScrolledToBottom: isScrolled,
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    state,
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    setLoading,
    setError,
    setScrolledToBottom,
    clearMessages,
    clearError,
  }
}