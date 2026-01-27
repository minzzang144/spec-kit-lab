/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { createContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/shared/constants'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: ConnectionStatus
  error: string | null
  connect: () => void
  disconnect: () => void
}

export const SocketContext = createContext<SocketContextValue | null>(null)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)

  const connect = () => {
    if (socket?.connected) return

    setConnectionStatus('connecting')
    setError(null)

    const newSocket: Socket = io(SOCKET_URL, {
      autoConnect: true,
      timeout: 20000,
      forceNew: false,
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
      setConnectionStatus('connected')
      setError(null)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      setConnectionStatus('disconnected')

      if (reason === 'io server disconnect') {
        // Server disconnected the client, need manual reconnect
        setError('Server disconnected the connection')
      } else if (reason === 'transport close') {
        setError('Connection lost, trying to reconnect...')
      }
    })

    newSocket.on('connect_error', (err) => {
      console.error('🔥 Socket connection error:', err.message)
      setConnectionStatus('error')
      setError(err.message)
      setIsConnected(false)
    })

    // Application-specific error handling
    newSocket.on('error', (errorData: unknown) => {
      console.error('🔥 Application error:', errorData)
      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
        setError((errorData as { message: string }).message)
      } else {
        setError('Application error occurred')
      }
    })

    setSocket(newSocket)
  }

  const disconnect = () => {
    if (socket) {
      console.log('🔌 Manually disconnecting socket')
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      setError(null)
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  const contextValue: SocketContextValue = {
    socket,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider