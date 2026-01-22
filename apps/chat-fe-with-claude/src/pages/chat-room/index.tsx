import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { SessionManager } from '@/shared/lib'
import { ROUTES } from '@/shared/constants'
import { useJoinRoomFlow } from '@/features/chat/join-room'
import { MessageListWidget } from '@/widgets/message-list'
import { SendMessageFeature } from '@/features/chat/send-message'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { isLoading, error, currentRoom, joinRoom, leaveRoom, clearError } = useJoinRoomFlow()

  useEffect(() => {
    // Check if user has a valid session
    const session = SessionManager.load()
    if (!SessionManager.isValid(session)) {
      navigate(ROUTES.NICKNAME_SETUP)
      return
    }

    if (!roomId) {
      navigate(ROUTES.LOBBY)
      return
    }

    // Automatically join the room
    console.log('Auto-joining room:', roomId)
    joinRoom(roomId)
  }, [roomId, navigate, joinRoom])

  const handleLeaveRoom = useCallback(() => {
    leaveRoom()
    navigate(ROUTES.LOBBY)
  }, [leaveRoom, navigate])

  const handleMessageSent = useCallback((content: string) => {
    console.log('✅ Message sent successfully:', content)
  }, [])

  if (!roomId) {
    return null
  }

  if (isLoading && !currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>방에 입장하는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold mb-2">방 입장 실패</h2>
            <p>{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={clearError}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              type="button"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate(ROUTES.LOBBY)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              type="button"
            >
              로비로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveRoom}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentRoom?.name || `채팅방 #${roomId}`}
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{currentRoom?.participants.length || 0}/{currentRoom?.maxParticipants || 5}</span>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full min-h-0">
        {/* Chat Messages and Input */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Container */}
          <div className="flex-1 min-h-0">
            <MessageListWidget
              roomId={roomId}
              initialMessages={currentRoom?.messages || []}
              autoScroll={true}
              showScrollToBottom={true}
              className="h-full"
            />
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0">
            <SendMessageFeature
              roomId={roomId}
              disabled={!currentRoom || isLoading}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0">
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">
              참여자 ({currentRoom?.participants.length || 0})
            </h3>
            <div className="space-y-2">
              {currentRoom?.participants.length ? (
                currentRoom.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-blue-600">
                        {participant.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {participant.nickname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.isConnected ? '온라인' : '오프라인'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">참여자가 없습니다</p>
              )}
            </div>

            {/* Room Info */}
            {currentRoom && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">방 정보</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>방 이름: {currentRoom.name}</p>
                  <p>최대 참여자: {currentRoom.maxParticipants}명</p>
                  <p>메시지 수: {currentRoom.messages.length}개</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoomPage