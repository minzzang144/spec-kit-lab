import { RefreshCw, AlertCircle, Inbox } from 'lucide-react'
import type { RoomSummary } from '@/entities/chat-room'
import { RoomListItem } from './RoomListItem'

interface RoomListContentProps {
  rooms: RoomSummary[]
  isLoading: boolean
  error: Error | null
  onRoomClick: (roomId: string, isFull: boolean) => void
  onRefresh: () => void
  isJoining?: boolean
}

export const RoomListContent = ({
  rooms,
  isLoading,
  error,
  onRoomClick,
  onRefresh,
  isJoining = false,
}: RoomListContentProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">방 목록을 불러오는 중...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
        <p className="text-red-600 mb-4">방 목록을 불러오지 못했습니다</p>
        <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // Empty state
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Inbox className="w-8 h-8 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">현재 활성 채팅방이 없습니다</p>
        <p className="text-sm text-gray-500 mb-4">새 방을 만들어 대화를 시작해보세요!</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          새로고침
        </button>
      </div>
    )
  }

  // Rooms list
  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          활성 채팅방 ({rooms.length})
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="새로고침"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Joining overlay */}
      {isJoining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-900">채팅방에 참여하는 중...</span>
          </div>
        </div>
      )}

      {/* Rooms grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomListItem
            key={room.id}
            room={room}
            onClick={onRoomClick}
            disabled={isJoining}
          />
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>실시간으로 업데이트됩니다</p>
      </div>
    </div>
  )
}

export default RoomListContent