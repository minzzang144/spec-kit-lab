import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [connectionType, setConnectionType] = useState<string | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Check connection type if available
    const updateConnectionInfo = () => {
      const connection = (navigator as unknown as { connection?: {
        effectiveType?: string
        type?: string
        addEventListener?: (type: string, listener: () => void) => void
        removeEventListener?: (type: string, listener: () => void) => void
      } }).connection
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || null)
        setIsSlowConnection(connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')
      }
    }

    // Set up event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection details if supported
    const connection = (navigator as unknown as { connection?: {
      effectiveType?: string
      type?: string
      addEventListener?: (type: string, listener: () => void) => void
      removeEventListener?: (type: string, listener: () => void) => void
    } }).connection
    if (connection) {
      updateConnectionInfo()
      connection.addEventListener?.('change', updateConnectionInfo)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener?.('change', updateConnectionInfo)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isSlowConnection, connectionType }
}