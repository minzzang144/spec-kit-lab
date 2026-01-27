import { useEffect, useCallback } from 'react'
import { useSocket } from '@/app/providers/socket-hooks'
import type { RoomData } from '@/generated/socket-types'
import { useJoinRoomModel } from '../model/useJoinRoomModel'

export interface JoinRoomFlow {
  isLoading: boolean
  error: string | null
  currentRoom: RoomData | null
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  clearError: () => void
}

export function useJoinRoomFlow(): JoinRoomFlow {
  const { socket, isConnected } = useSocket()
  const model = useJoinRoomModel()

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    // Handle successful room join
    const handleRoomJoined = (data: { room: RoomData }) => {
      console.log('✅ Successfully joined room:', data.room.name)
      model.setCurrentRoom(data.room)
    }

    // Handle join errors
    const handleError = (data: { message: string; code?: string }) => {
      console.error('❌ Join room error:', data.message)
      model.setError(data.message)
    }

    // Handle user activity in room
    const handleUserActivity = (data: { type: 'joined' | 'left'; user: { id: string; nickname: string }; roomId: string }) => {
      console.log(`👤 User ${data.type}: ${data.user.nickname} in room ${data.roomId}`)
    }

    socket.on('room-joined', handleRoomJoined)
    socket.on('error', handleError)
    socket.on('user-activity', handleUserActivity)

    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('error', handleError)
      socket.off('user-activity', handleUserActivity)
    }
  }, [socket, model])

  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) {
      model.setError('소켓이 연결되지 않았습니다')
      return
    }

    if (!roomId) {
      model.setError('방 ID가 필요합니다')
      return
    }

    console.log('🚪 Joining room:', roomId)
    model.joinRoom(roomId)
    socket.emit('join-room', { roomId })
  }, [socket, isConnected, model])

  const leaveRoom = useCallback(() => {
    if (!socket || !isConnected || !model.state.currentRoom) {
      return
    }

    const roomId = model.state.currentRoom.id
    console.log('🚪 Leaving room:', roomId)
    socket.emit('leave-room', { roomId })
    model.leaveRoom()
  }, [socket, isConnected, model])

  return {
    isLoading: model.state.isLoading,
    error: model.state.error,
    currentRoom: model.state.currentRoom,
    joinRoom,
    leaveRoom,
    clearError: model.clearError,
  }
}