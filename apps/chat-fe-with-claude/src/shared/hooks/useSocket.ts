import { useContext, useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { SocketContext } from '@/app/providers/SocketProvider'

export interface SocketConnectionState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  socket: Socket | null
}

export function useSocket() {
  const socket = useContext(SocketContext)
  const [connectionState, setConnectionState] = useState<SocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    socket: null,
  })

  useEffect(() => {
    if (!socket) {
      setConnectionState(prev => ({
        ...prev,
        error: 'Socket not available',
        socket: null,
      }))
      return
    }

    setConnectionState(prev => ({
      ...prev,
      socket,
      isConnecting: !socket.connected,
    }))

    const handleConnect = () => {
      console.log('Socket connected:', socket.id)
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }))
    }

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason)
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: `Disconnected: ${reason}`,
      }))
    }

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error)
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message,
      }))
    }

    const handleReconnect = (attemptNumber: number) => {
      console.log('Socket reconnecting, attempt:', attemptNumber)
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }))
    }

    // Initial state
    if (socket.connected) {
      handleConnect()
    }

    // Event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('reconnect', handleReconnect)

    // Cleanup
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('reconnect', handleReconnect)
    }
  }, [socket])

  return connectionState
}

// Hook for emitting events with type safety
export function useSocketEmit() {
  const socket = useContext(SocketContext)

  const emit = (event: string, data?: any) => {
    if (!socket?.connected) {
      console.warn('Cannot emit event: socket not connected')
      return false
    }

    socket.emit(event, data)
    return true
  }

  return { emit, socket }
}

// Hook for listening to events
export function useSocketListener<T = any>(event: string, handler: (data: T) => void) {
  const socket = useContext(SocketContext)

  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler])
}