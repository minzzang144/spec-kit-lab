import { useState, useCallback } from 'react'

interface SendMessageState {
  isSending: boolean
  error: string | null
  lastMessageId: string | null
}

export interface SendMessageModel {
  state: SendMessageState
  setSending: (isSending: boolean) => void
  setError: (error: string | null) => void
  setLastMessageId: (messageId: string | null) => void
  clearError: () => void
}

export function useSendMessageModel(): SendMessageModel {
  const [state, setState] = useState<SendMessageState>({
    isSending: false,
    error: null,
    lastMessageId: null,
  })

  const setSending = useCallback((isSending: boolean) => {
    setState(prev => ({
      ...prev,
      isSending,
      error: isSending ? null : prev.error, // Clear error when starting to send
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isSending: false, // Stop sending when error occurs
    }))
  }, [])

  const setLastMessageId = useCallback((messageId: string | null) => {
    setState(prev => ({
      ...prev,
      lastMessageId: messageId,
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
    setSending,
    setError,
    setLastMessageId,
    clearError,
  }
}