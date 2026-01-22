import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useLeaveRoomFlow } from '../hooks/useLeaveRoomFlow'
import { LeaveRoomButton } from './LeaveRoomButton'

export interface LeaveRoomFeatureProps {
  /**
   * The ID of the room to leave
   */
  roomId: string

  /**
   * Button variant
   */
  variant?: 'back' | 'exit'

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether to navigate automatically after leaving
   */
  autoNavigate?: boolean

  /**
   * Custom navigation path after leaving (defaults to lobby)
   */
  navigateToAfterLeave?: string

  /**
   * Whether to leave silently (without broadcasting to other users)
   */
  silent?: boolean

  /**
   * Callback called when room is successfully left
   */
  onRoomLeft?: (roomData: any) => void

  /**
   * Callback called when leave operation fails
   */
  onLeaveError?: (error: string) => void

  /**
   * Custom button text (for 'exit' variant with lg size)
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

export function LeaveRoomFeature({
  roomId,
  variant = 'back',
  size = 'md',
  autoNavigate = true,
  navigateToAfterLeave = ROUTES.LOBBY,
  silent = false,
  onRoomLeft,
  onLeaveError,
  children,
  className,
}: LeaveRoomFeatureProps) {
  const navigate = useNavigate()
  const { isLeaving, error, lastLeftRoom, leaveRoom, clearError } = useLeaveRoomFlow()

  const handleLeaveRoom = useCallback(() => {
    if (!roomId) {
      console.error('Cannot leave room: roomId is required')
      return
    }

    leaveRoom(roomId, { silent })
  }, [roomId, leaveRoom, silent])

  // Handle successful room leave
  useEffect(() => {
    if (lastLeftRoom && lastLeftRoom.id === roomId) {
      console.log('✅ Successfully left room:', lastLeftRoom.name)

      // Call callback if provided
      onRoomLeft?.(lastLeftRoom)

      // Auto-navigate if enabled
      if (autoNavigate) {
        navigate(navigateToAfterLeave)
      }
    }
  }, [lastLeftRoom, roomId, onRoomLeft, autoNavigate, navigate, navigateToAfterLeave])

  // Handle leave errors
  useEffect(() => {
    if (error) {
      console.error('❌ Leave room error:', error)
      onLeaveError?.(error)

      // Auto-clear error after showing it
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, onLeaveError, clearError])

  return (
    <LeaveRoomButton
      variant={variant}
      size={size}
      isLeaving={isLeaving}
      disabled={!roomId || isLeaving}
      onClick={handleLeaveRoom}
      className={className}
    >
      {children}
    </LeaveRoomButton>
  )
}