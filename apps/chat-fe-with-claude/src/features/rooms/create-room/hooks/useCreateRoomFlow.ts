import { useState, useCallback } from 'react'
import { useCreateRoomModel } from '../model/useCreateRoomModel'
import type { ChatRoom } from '@/entities/chat-room'

type CreateRoomState = 'idle' | 'creating' | 'success' | 'error'

interface CreateRoomFlowOptions {
  onRoomCreated?: (room: ChatRoom) => void
  onFlowComplete?: () => void
  autoNavigate?: boolean
}

export interface UseCreateRoomFlowResult {
  state: CreateRoomState
  error: Error | null
  createdRoom: ChatRoom | null
  createRoom: (userId: string) => Promise<void>
  reset: () => void
  dismiss: () => void
}

export const useCreateRoomFlow = (
  options: CreateRoomFlowOptions = {}
): UseCreateRoomFlowResult => {
  const { onRoomCreated, onFlowComplete, autoNavigate = true } = options

  const [state, setState] = useState<CreateRoomState>('idle')
  const [createdRoom, setCreatedRoom] = useState<ChatRoom | null>(null)

  const { createRoom: createRoomAction, error, clearError } = useCreateRoomModel()

  const createRoom = useCallback(
    async (userId: string) => {
      setState('creating')
      setCreatedRoom(null)

      try {
        const room = await createRoomAction(userId, {
          autoJoin: autoNavigate,
          onSuccess: (room) => {
            setState('success')
            setCreatedRoom(room)
            onRoomCreated?.(room)
          },
          onError: (error) => {
            setState('error')
            console.error('Room creation failed:', error)
          },
        })

        if (room && onFlowComplete) {
          // Small delay to show success state before completing
          setTimeout(() => {
            onFlowComplete()
          }, 1000)
        }
      } catch {
        setState('error')
      }
    },
    [createRoomAction, onRoomCreated, onFlowComplete, autoNavigate]
  )

  const reset = useCallback(() => {
    setState('idle')
    setCreatedRoom(null)
    clearError()
  }, [clearError])

  const dismiss = useCallback(() => {
    reset()
    onFlowComplete?.()
  }, [reset, onFlowComplete])

  return {
    state,
    error,
    createdRoom,
    createRoom,
    reset,
    dismiss,
  }
}

export default useCreateRoomFlow