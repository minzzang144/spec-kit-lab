import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoomListModel } from '../model/useRoomListModel'

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
  const { joinRoom, isJoining } = useRoomListModel()

  const handleRoomClick = useCallback(
    async (roomId: string, isFull: boolean) => {
      if (!currentUserId) {
        onError?.(new Error('User not logged in'))
        return
      }

      if (isFull) {
        onError?.(new Error('Room is full'))
        return
      }

      try {
        await joinRoom(roomId, currentUserId)
        onRoomJoin?.(roomId)
        navigate(`/chat/${roomId}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error('Failed to join room')
        onError?.(errorMessage)
      }
    },
    [currentUserId, joinRoom, navigate, onRoomJoin, onError]
  )

  return {
    handleRoomClick,
    isJoining,
  }
}

export default useRoomSelection