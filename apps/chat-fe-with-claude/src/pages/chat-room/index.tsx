import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SessionManager } from '@/shared/lib'
import { ROUTES } from '@/shared/constants'
import { useJoinRoomFlow } from '@/features/chat/join-room'
import { ArrowLeft, Users, Send, Loader2 } from 'lucide-react'

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { isLoading, error, currentRoom, joinRoom, leaveRoom, clearError } = useJoinRoomFlow()
  const [messageInput, setMessageInput] = useState('')

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

  const handleLeaveRoom = () => {
    leaveRoom()
    navigate(ROUTES.LOBBY)
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    // TODO: Implement message sending
    console.log('Sending message:', messageInput)
    setMessageInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
      <header className="bg-white border-b border-gray-200 px-4 py-3">
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
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {currentRoom?.messages && currentRoom.messages.length > 0 ? (
                currentRoom.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg max-w-xs ${
                      message.type === 'system'
                        ? 'bg-gray-100 text-gray-600 text-center mx-auto text-sm'
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    {message.type !== 'system' && (
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {message.authorNickname}
                      </div>
                    )}
                    <div className={message.type === 'system' ? 'text-gray-600' : 'text-gray-800'}>
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>아직 메시지가 없습니다.</p>
                  <p>첫 번째 메시지를 보내보세요!</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                type="button"
              >
                <Send className="w-4 h-4" />
                <span>전송</span>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {messageInput.length}/500
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">참여자 ({currentRoom?.participants.length || 0})</h3>
          <div className="space-y-2">
            {currentRoom?.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {participant.nickname.charAt(0)}
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
            )) || (
              <p className="text-sm text-gray-500">참여자가 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoomPage