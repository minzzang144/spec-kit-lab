import { useState, useCallback } from 'react'

const MAX_MESSAGE_LENGTH = 500

interface ChatInputState {
  message: string
  isComposing: boolean
  isSending: boolean
  error: string | null
}

export interface ChatInputModel {
  state: ChatInputState
  updateMessage: (message: string) => void
  clearMessage: () => void
  setComposing: (isComposing: boolean) => void
  setSending: (isSending: boolean) => void
  setError: (error: string | null) => void
  canSend: boolean
  remainingChars: number
}

export function useChatInputModel(): ChatInputModel {
  const [state, setState] = useState<ChatInputState>({
    message: '',
    isComposing: false,
    isSending: false,
    error: null,
  })

  const updateMessage = useCallback((message: string) => {
    // Trim to max length
    const trimmedMessage = message.length > MAX_MESSAGE_LENGTH
      ? message.slice(0, MAX_MESSAGE_LENGTH)
      : message

    setState(prev => ({
      ...prev,
      message: trimmedMessage,
      error: null,
    }))
  }, [])

  const clearMessage = useCallback(() => {
    setState(prev => ({
      ...prev,
      message: '',
      error: null,
    }))
  }, [])

  const setComposing = useCallback((isComposing: boolean) => {
    setState(prev => ({
      ...prev,
      isComposing,
    }))
  }, [])

  const setSending = useCallback((isSending: boolean) => {
    setState(prev => ({
      ...prev,
      isSending,
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
    }))
  }, [])

  const canSend = state.message.trim().length > 0 && !state.isSending && !state.isComposing
  const remainingChars = MAX_MESSAGE_LENGTH - state.message.length

  return {
    state,
    updateMessage,
    clearMessage,
    setComposing,
    setSending,
    setError,
    canSend,
    remainingChars,
  }
}