import { useEffect, useCallback, useRef } from 'react'
import { useSocket } from '@/app/providers/socket-hooks'
import type { RoomData } from '@/generated/socket-types'
import { useLeaveRoomModel } from '../model/useLeaveRoomModel'

export interface LeaveRoomFlow {
  isLeaving: boolean
  error: string | null
  lastLeftRoom: RoomData | null
  leaveRoom: (roomId: string, options?: { silent?: boolean }) => void
  clearError: () => void
  reset: () => void
}

export function useLeaveRoomFlow(): LeaveRoomFlow {
  const { socket, isConnected } = useSocket()
  const model = useLeaveRoomModel()
  const pendingLeave = useRef<string | null>(null)

  // Socket event handlers for leave room responses
  useEffect(() => {
    if (!socket) return

    // Handle successful room leave
    const handleRoomLeft = (data: {
      room: RoomData
      message?: string
      reason?: 'user-action' | 'auto-disconnect' | 'room-deleted'
    }) => {
      console.log('✅ Successfully left room:', data.room.name, 'reason:', data.reason)
      model.finishLeaving(data.room)
      pendingLeave.current = null
    }

    // Handle leave errors
    const handleLeaveError = (data: {
      message: string
      code?: string
      roomId?: string
    }) => {
      console.error('❌ Leave room error:', data.message)
      model.setError(data.message)
      pendingLeave.current = null
    }

    // Handle forced disconnection or room deletion
    const handleForceLeave = (data: {
      room: RoomData
      reason: 'room-deleted' | 'kicked' | 'connection-timeout'
      message?: string
    }) => {
      console.log('🚪 Forced to leave room:', data.room.name, 'reason:', data.reason)
      model.finishLeaving(data.room)
      pendingLeave.current = null
    }

    socket.on('room-left', handleRoomLeft)
    socket.on('leave-room-error', handleLeaveError)
    socket.on('forced-leave', handleForceLeave)

    return () => {
      socket.off('room-left', handleRoomLeft)
      socket.off('leave-room-error', handleLeaveError)
      socket.off('forced-leave', handleForceLeave)
    }
  }, [socket, model])

  // Handle socket reconnection - resume pending leave if needed
  useEffect(() => {
    if (socket && isConnected && pendingLeave.current) {
      const roomId = pendingLeave.current
      console.log('🔄 Resuming pending leave for room:', roomId)
      socket.emit('leave-room', { roomId, reason: 'user-action' })
    }
  }, [socket, isConnected])

  const leaveRoom = useCallback((roomId: string, options: { silent?: boolean } = {}) => {
    if (!socket || !isConnected) {
      model.setError('소켓이 연결되지 않았습니다')
      return
    }

    if (!roomId) {
      model.setError('방 ID가 필요합니다')
      return
    }

    if (model.state.isLeaving) {
      console.warn('이미 방을 나가는 중입니다')
      return
    }

    console.log('🚪 Leaving room:', roomId, options)
    model.startLeaving()
    pendingLeave.current = roomId

    // Emit leave room event
    socket.emit('leave-room', {
      roomId,
      reason: 'user-action',
      silent: options.silent
    })

    // Set a timeout to handle potential network issues
    setTimeout(() => {
      if (pendingLeave.current === roomId && model.state.isLeaving) {
        console.warn('⚠️ Leave room timeout, assuming success')
        model.setError('방 나가기 처리가 지연되고 있습니다. 새로고침해주세요.')
        pendingLeave.current = null
      }
    }, 10000) // 10 second timeout
  }, [socket, isConnected, model])

  return {
    isLeaving: model.state.isLeaving,
    error: model.state.error,
    lastLeftRoom: model.state.lastLeftRoom,
    leaveRoom,
    clearError: model.clearError,
    reset: model.reset,
  }
}