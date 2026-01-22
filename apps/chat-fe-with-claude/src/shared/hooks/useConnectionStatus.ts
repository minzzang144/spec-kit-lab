import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/app/providers/socket-hooks'

export interface ConnectionStatus {
  isConnected: boolean
  isReconnecting: boolean
  connectionState: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | 'error'
  lastDisconnectTime: number | null
  reconnectAttempts: number
  error: string | null
}

export interface ConnectionMonitorOptions {
  /**
   * Time in ms to consider a disconnect as "long" - triggers different behavior
   * @default 30000 (30 seconds)
   */
  longDisconnectThreshold?: number

  /**
   * Maximum number of automatic reconnection attempts
   * @default 5
   */
  maxReconnectAttempts?: number

  /**
   * Delay between reconnection attempts in ms
   * @default 5000 (5 seconds)
   */
  reconnectDelay?: number

  /**
   * Whether to automatically attempt reconnection
   * @default true
   */
  autoReconnect?: boolean

  /**
   * Callback when connection is established
   */
  onConnect?: () => void

  /**
   * Callback when connection is lost
   */
  onDisconnect?: () => void

  /**
   * Callback when reconnection is successful
   */
  onReconnect?: () => void

  /**
   * Callback when long disconnect is detected (30+ seconds)
   */
  onLongDisconnect?: (duration: number) => void

  /**
   * Callback when connection error occurs
   */
  onError?: (error: string) => void
}

const DEFAULT_OPTIONS: Required<Omit<ConnectionMonitorOptions, 'onConnect' | 'onDisconnect' | 'onReconnect' | 'onLongDisconnect' | 'onError'>> = {
  longDisconnectThreshold: 30000, // 30 seconds
  maxReconnectAttempts: 5,
  reconnectDelay: 5000, // 5 seconds
  autoReconnect: true,
}

export function useConnectionStatus(options: ConnectionMonitorOptions = {}): ConnectionStatus {
  const { socket, isConnected } = useSocket()
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    connectionState: 'disconnected',
    lastDisconnectTime: null,
    reconnectAttempts: 0,
    error: null,
  })

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const longDisconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const disconnectStartTimeRef = useRef<number | null>(null)

  // Update connection state when socket connection changes
  useEffect(() => {
    if (isConnected) {
      const wasReconnecting = connectionStatus.isReconnecting

      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        connectionState: 'connected',
        reconnectAttempts: 0,
        error: null,
      }))

      // Clear disconnect timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = undefined
      }
      if (longDisconnectTimeoutRef.current) {
        clearTimeout(longDisconnectTimeoutRef.current)
        longDisconnectTimeoutRef.current = undefined
      }

      // Call appropriate callback
      if (wasReconnecting) {
        options.onReconnect?.()
      } else {
        options.onConnect?.()
      }

      disconnectStartTimeRef.current = null
    } else {
      // Record disconnect time if not already recorded
      if (!disconnectStartTimeRef.current) {
        disconnectStartTimeRef.current = Date.now()
      }

      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        connectionState: prev.isReconnecting ? 'reconnecting' : 'disconnected',
        lastDisconnectTime: disconnectStartTimeRef.current,
      }))

      options.onDisconnect?.()

      // Set up long disconnect detection
      if (!longDisconnectTimeoutRef.current) {
        longDisconnectTimeoutRef.current = setTimeout(() => {
          const duration = Date.now() - disconnectStartTimeRef.current!
          console.warn(`🔌 Long disconnect detected: ${duration}ms`)
          options.onLongDisconnect?.(duration)
        }, opts.longDisconnectThreshold)
      }

      // Set up auto-reconnection
      if (opts.autoReconnect && connectionStatus.reconnectAttempts < opts.maxReconnectAttempts) {
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionStatus(prev => ({
              ...prev,
              isReconnecting: true,
              connectionState: 'reconnecting',
              reconnectAttempts: prev.reconnectAttempts + 1,
            }))

            console.log(`🔄 Attempting reconnection ${connectionStatus.reconnectAttempts + 1}/${opts.maxReconnectAttempts}`)

            // Trigger reconnection (socket.io will handle this automatically)
            if (socket) {
              socket.connect()
            }

            reconnectTimeoutRef.current = undefined
          }, opts.reconnectDelay)
        }
      }
    }
  }, [isConnected, socket, opts, connectionStatus.isReconnecting, connectionStatus.reconnectAttempts, options])

  // Handle socket errors
  useEffect(() => {
    if (!socket) return

    const handleError = (error: any) => {
      console.error('🔌 Socket connection error:', error)
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection error'

      setConnectionStatus(prev => ({
        ...prev,
        connectionState: 'error',
        error: errorMessage,
      }))

      options.onError?.(errorMessage)
    }

    const handleConnectError = (error: any) => {
      console.error('🔌 Socket connect error:', error)
      handleError(error)
    }

    const handleReconnectError = (error: any) => {
      console.error('🔌 Socket reconnect error:', error)
      handleError(error)
    }

    socket.on('connect_error', handleConnectError)
    socket.on('reconnect_error', handleReconnectError)
    socket.on('error', handleError)

    return () => {
      socket.off('connect_error', handleConnectError)
      socket.off('reconnect_error', handleReconnectError)
      socket.off('error', handleError)
    }
  }, [socket, options])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (longDisconnectTimeoutRef.current) {
        clearTimeout(longDisconnectTimeoutRef.current)
      }
    }
  }, [])

  return connectionStatus
}

/**
 * Hook for detecting and handling connection timeouts specifically for chat rooms
 * Follows the 30-second timeout rule from the specification
 */
export function useChatRoomConnectionMonitor(roomId?: string) {
  const connectionStatus = useConnectionStatus({
    longDisconnectThreshold: 30000, // 30 seconds as per spec
    maxReconnectAttempts: 3,
    reconnectDelay: 5000,
    onLongDisconnect: (duration) => {
      console.warn(`🚨 Chat room connection timeout after ${duration}ms for room:`, roomId)
    },
    onReconnect: () => {
      console.log('✅ Chat room connection restored for room:', roomId)
    },
  })

  return {
    ...connectionStatus,
    isTimedOut: connectionStatus.lastDisconnectTime
      ? (Date.now() - connectionStatus.lastDisconnectTime) > 30000
      : false,
    timeoutDuration: connectionStatus.lastDisconnectTime
      ? Date.now() - connectionStatus.lastDisconnectTime
      : 0,
  }
}