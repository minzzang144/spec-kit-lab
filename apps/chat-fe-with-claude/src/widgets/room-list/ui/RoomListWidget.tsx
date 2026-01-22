import { useState, useCallback } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import {
  useRoomListModel,
  useRoomSelection,
  RoomListContent,
} from '@/features/rooms/room-list'

interface RoomListWidgetProps {
  currentUserId: string | null
  currentUserNickname: string | null
  onCreateRoom?: () => void
  onRoomJoin?: (roomId: string) => void
  className?: string
}

export const RoomListWidget = ({
  currentUserId,
  currentUserNickname,
  onCreateRoom,
  onRoomJoin,
  className = '',
}: RoomListWidgetProps) => {
  const [error, setError] = useState<Error | null>(null)
  const { rooms, isLoading, error: fetchError, refetch } = useRoomListModel()

  const { handleRoomClick, isJoining } = useRoomSelection({
    currentUserId,
    onRoomJoin,
    onError: setError,
  })

  const handleRefresh = useCallback(() => {
    setError(null)
    refetch()
  }, [refetch])

  const handleCreateRoom = useCallback(() => {
    if (!currentUserId) {
      setError(new Error('로그인이 필요합니다'))
      return
    }
    onCreateRoom?.()
  }, [currentUserId, onCreateRoom])

  // Clear error after a few seconds
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">채팅방 목록</h1>
          {currentUserNickname && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {currentUserNickname}
            </span>
          )}
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={!currentUserId || isJoining}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="새 채팅방 만들기"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">새 방 만들기</span>
        </button>
      </div>

      {/* Error Alert */}
      {(error || fetchError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">오류가 발생했습니다</p>
              <p className="text-red-600 text-sm mt-1">
                {(error || fetchError)?.message}
              </p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* User Guide */}
      {!currentUserId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">닉네임 설정이 필요합니다</p>
              <p className="text-yellow-700 text-sm mt-1">
                채팅방에 참여하거나 새 방을 만들려면 먼저 닉네임을 설정해주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Room List Content */}
      <RoomListContent
        rooms={rooms}
        isLoading={isLoading}
        error={fetchError as Error | null}
        onRoomClick={handleRoomClick}
        onRefresh={handleRefresh}
        isJoining={isJoining}
      />

      {/* Real-time Status */}
      {rooms.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>실시간 업데이트 중</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomListWidget