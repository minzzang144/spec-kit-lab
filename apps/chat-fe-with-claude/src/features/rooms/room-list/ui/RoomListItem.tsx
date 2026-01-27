import { Users, Clock } from 'lucide-react'
import type { RoomSummary } from '@/entities/chat-room'

interface RoomListItemProps {
  room: RoomSummary
  onClick: (roomId: string, isFull: boolean) => void
  disabled?: boolean
}

export const RoomListItem = ({ room, onClick, disabled = false }: RoomListItemProps) => {
  const isFull = room.participantCount >= room.maxParticipants
  const isEmpty = room.participantCount === 0

  const handleClick = () => {
    if (!disabled) {
      onClick(room.id, isFull)
    }
  }

  const getStatusColor = () => {
    if (isFull) return 'text-red-600 bg-red-50'
    if (isEmpty) return 'text-gray-500 bg-gray-50'
    return 'text-green-600 bg-green-50'
  }

  const getHoverEffect = () => {
    if (disabled || isFull) return 'cursor-not-allowed'
    return 'hover:bg-gray-50 cursor-pointer'
  }

  return (
    <div
      className={`
        p-4 border border-gray-200 rounded-lg transition-colors
        ${getHoverEffect()}
        ${disabled ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={disabled || isFull ? -1 : 0}
      aria-disabled={disabled || isFull}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Room Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">{room.name}</h3>
        <div
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${getStatusColor()}
          `}
        >
          {room.participantCount}/{room.maxParticipants}
        </div>
      </div>

      {/* Room Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>
            {room.participantCount === 0
              ? '참여자 없음'
              : `${room.participantCount}명 참여중`}
          </span>
        </div>

        {isFull && (
          <div className="flex items-center gap-1 text-red-600">
            <Clock size={16} />
            <span>방이 가득참</span>
          </div>
        )}
      </div>

      {/* Participants Preview */}
      {room.participants.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">참여자</div>
          <div className="flex flex-wrap gap-1">
            {room.participants.slice(0, 3).map((nickname, index) => (
              <span
                key={`${room.id}-participant-${index}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {nickname}
              </span>
            ))}
            {room.participants.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{room.participants.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Join Indication */}
      {!isFull && !disabled && (
        <div className="mt-3 text-center">
          <span className="text-sm text-blue-600 font-medium">클릭하여 참여</span>
        </div>
      )}
    </div>
  )
}

export default RoomListItem