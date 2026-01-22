import { useState, useCallback } from 'react'
import type { RoomData } from '@/generated/socket-types'

interface JoinRoomState {
  isLoading: boolean
  error: string | null
  currentRoom: RoomData | null
}

export interface JoinRoomModel {
  state: JoinRoomState
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  clearError: () => void
  setCurrentRoom: (room: RoomData | null) => void
  setError: (error: string) => void
  setLoading: (isLoading: boolean) => void
}

export function useJoinRoomModel(): JoinRoomModel {
  const [state, setState] = useState<JoinRoomState>({
    isLoading: false,
    error: null,
    currentRoom: null,
  })

  const joinRoom = useCallback((roomId: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }))
  }, [])

  const leaveRoom = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      currentRoom: null,
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  const setCurrentRoom = useCallback((room: RoomData | null) => {
    setState(prev => ({
      ...prev,
      currentRoom: room,
      isLoading: false,
      error: null,
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }))
  }, [])

  return {
    state,
    joinRoom,
    leaveRoom,
    clearError,
    setCurrentRoom,
    setError,
    setLoading,
  }
}