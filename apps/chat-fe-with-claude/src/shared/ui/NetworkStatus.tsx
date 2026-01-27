import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'

export function NetworkStatusIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus()
  const [showOfflineToast, setShowOfflineToast] = useState(false)

  useEffect(() => {
    if (!isOnline && !showOfflineToast) {
      const timer = setTimeout(() => setShowOfflineToast(true), 0)
      const hideTimer = setTimeout(() => setShowOfflineToast(false), 5000)
      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    } else if (isOnline && showOfflineToast) {
      const timer = setTimeout(() => setShowOfflineToast(false), 0)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOfflineToast])

  if (!showOfflineToast && isOnline) {
    return null
  }

  return (
    <div
      className={`
        fixed top-4 left-4 z-50 max-w-sm bg-white border rounded-lg shadow-lg p-4 transition-all duration-300
        ${!isOnline ? 'border-red-200 bg-red-50' : isSlowConnection ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}
      `}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {!isOnline ? (
            <WifiOff className="w-5 h-5 text-red-600" />
          ) : (
            <Wifi className={`w-5 h-5 ${isSlowConnection ? 'text-yellow-600' : 'text-green-600'}`} />
          )}
        </div>

        <div className="flex-1">
          <p className={`text-sm font-medium ${
            !isOnline ? 'text-red-900' : isSlowConnection ? 'text-yellow-900' : 'text-green-900'
          }`}>
            {!isOnline
              ? '인터넷 연결 끊김'
              : isSlowConnection
                ? '인터넷 연결이 느림'
                : '인터넷 연결 복구됨'
            }
          </p>
          <p className={`text-xs mt-1 ${
            !isOnline ? 'text-red-700' : isSlowConnection ? 'text-yellow-700' : 'text-green-700'
          }`}>
            {!isOnline
              ? '일부 기능이 제한될 수 있습니다.'
              : isSlowConnection
                ? '데이터 사용량을 확인해보세요.'
                : '모든 기능이 정상적으로 작동합니다.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}