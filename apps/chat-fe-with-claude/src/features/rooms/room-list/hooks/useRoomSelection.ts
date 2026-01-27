import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJoinRoomFlow } from '@/features/chat/join-room'

interface UseRoomSelectionProps {
  currentUserId: string | null
  onRoomJoin?: (roomId: string) => void
  onError?: (error: Error) => void
}

export const useRoomSelection = ({
  currentUserId,
  onRoomJoin,
  onError,
}: UseRoomSelectionProps) => {
  const navigate = useNavigate()
  const { isLoading } = useJoinRoomFlow()

  const handleRoomClick = useCallback(
    (roomId: string, isFull: boolean) => {
      if (!currentUserId) {
        onError?.(new Error('User not logged in'))
        return
      }

      if (isFull) {
        onError?.(new Error('Room is full'))
        return
      }

      try {
        // Use Socket.IO based room joining instead of HTTP API
        onRoomJoin?.(roomId)
        navigate(`/chat/${roomId}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error('Failed to join room')
        onError?.(errorMessage)
      }
    },
    [currentUserId, navigate, onRoomJoin, onError]
  )

  return {
    handleRoomClick,
    isJoining: isLoading,
  }
}

export default useRoomSelection