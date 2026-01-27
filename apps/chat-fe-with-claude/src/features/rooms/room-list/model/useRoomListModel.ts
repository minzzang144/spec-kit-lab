import { useCallback } from 'react'
import { useRoomsQuery, useJoinRoomMutation, type RoomSummary } from '@/entities/chat-room'

interface UseRoomListModelResult {
  rooms: RoomSummary[]
  isLoading: boolean
  error: Error | null
  joinRoom: (roomId: string, userId: string) => Promise<void>
  isJoining: boolean
  refetch: () => void
}

export const useRoomListModel = (): UseRoomListModelResult => {
  const {
    data: rooms = [],
    isLoading,
    error,
    refetch,
  } = useRoomsQuery()

  const joinRoomMutation = useJoinRoomMutation()

  const joinRoom = useCallback(
    async (roomId: string, userId: string) => {
      await joinRoomMutation.mutateAsync({
        roomId,
        payload: { userId },
      })
    },
    [joinRoomMutation]
  )

  return {
    rooms,
    isLoading,
    error: error as Error | null,
    joinRoom,
    isJoining: joinRoomMutation.isPending,
    refetch,
  }
}

export default useRoomListModel