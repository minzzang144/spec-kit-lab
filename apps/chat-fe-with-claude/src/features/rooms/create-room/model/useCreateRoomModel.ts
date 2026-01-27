import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateRoomMutation, type ChatRoom } from '@/entities/chat-room'

interface CreateRoomOptions {
  autoJoin?: boolean
  onSuccess?: (room: ChatRoom) => void
  onError?: (error: Error) => void
}

interface UseCreateRoomModelResult {
  createRoom: (userId: string, options?: CreateRoomOptions) => Promise<ChatRoom | null>
  isCreating: boolean
  error: Error | null
  clearError: () => void
}

export const useCreateRoomModel = (): UseCreateRoomModelResult => {
  const [error, setError] = useState<Error | null>(null)
  const navigate = useNavigate()
  const createRoomMutation = useCreateRoomMutation()

  const createRoom = useCallback(
    async (userId: string, options: CreateRoomOptions = {}): Promise<ChatRoom | null> => {
      const { autoJoin = true, onSuccess, onError } = options

      try {
        setError(null)

        const newRoom = await createRoomMutation.mutateAsync({
          createdBy: userId,
        })

        // Call success callback if provided
        onSuccess?.(newRoom)

        // Auto-join the created room by default
        if (autoJoin) {
          navigate(`/chat/${newRoom.id}`)
        }

        return newRoom
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('Failed to create room')
        setError(errorInstance)
        onError?.(errorInstance)
        return null
      }
    },
    [createRoomMutation, navigate]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    createRoom,
    isCreating: createRoomMutation.isPending,
    error,
    clearError,
  }
}

export default useCreateRoomModel