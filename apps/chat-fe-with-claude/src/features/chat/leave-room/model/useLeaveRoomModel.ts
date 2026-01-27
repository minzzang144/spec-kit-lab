import { useState, useCallback } from 'react'
import type { RoomData } from '@/generated/socket-types'

export interface LeaveRoomState {
  isLeaving: boolean
  error: string | null
  lastLeftRoom: RoomData | null
}

export interface LeaveRoomModel {
  state: LeaveRoomState
  startLeaving: () => void
  finishLeaving: (room: RoomData) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
}

const initialState: LeaveRoomState = {
  isLeaving: false,
  error: null,
  lastLeftRoom: null,
}

export function useLeaveRoomModel(): LeaveRoomModel {
  const [state, setState] = useState<LeaveRoomState>(initialState)

  const startLeaving = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLeaving: true,
      error: null,
    }))
  }, [])

  const finishLeaving = useCallback((room: RoomData) => {
    setState(prev => ({
      ...prev,
      isLeaving: false,
      error: null,
      lastLeftRoom: room,
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isLeaving: false,
      error,
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state,
    startLeaving,
    finishLeaving,
    setError,
    clearError,
    reset,
  }
}