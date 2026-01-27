import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Users, LogOut } from 'lucide-react'
import { SessionManager, type SessionData } from '@/shared/lib/session-manager'
import { useSocket } from '@/app/providers/socket-hooks'
import { RoomListWidget } from '@/widgets/room-list'

export function LobbyPage() {
  const navigate = useNavigate()
  const [userSession, setUserSession] = useState<SessionData | null>(null)
  const { isConnected, connectionStatus, error: socketError } = useSocket()

  useEffect(() => {
    // Check if user has a valid session
    const session = SessionManager.load()
    if (!session?.nickname) {
      navigate('/nickname-setup')
      return
    }

    // Use setTimeout to avoid direct setState in effect
    setTimeout(() => {
      setUserSession(session)
      console.log('User session:', session)
    }, 0)
  }, [navigate])

  const handleLogout = () => {
    SessionManager.clear()
    navigate('/nickname-setup')
  }

  const handleRoomCreated = useCallback(
    (roomId: string) => {
      console.log('Room created:', roomId)
    },
    []
  )

  const handleRoomJoin = useCallback(
    (roomId: string) => {
      console.log('Joined room:', roomId)
    },
    []
  )

  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">채팅 로비</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-600">
                  {isConnected ? '연결됨' : connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
                </span>
              </div>

              {/* User Nickname */}
              <div className="flex items-center space-x-2 text-gray-700">
                <Users className="w-4 h-4" />
                <span className="font-medium">{userSession.nickname}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요, {userSession.nickname}님! 👋
          </h2>
          <p className="text-gray-600">
            채팅방을 만들거나 기존 채팅방에 참여하세요
          </p>
        </div>

        {/* Connection Error */}
        {socketError && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <div>
                  <p className="text-red-800 font-medium">연결 오류</p>
                  <p className="text-red-600 text-sm">{socketError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room List Widget */}
        <div className="max-w-6xl mx-auto">
          <RoomListWidget
            currentUserId={userSession?.userId || null}
            currentUserNickname={userSession?.nickname || null}
            onRoomCreated={handleRoomCreated}
            onRoomJoin={handleRoomJoin}
          />

          {/* User Guide */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-bold text-blue-900 mb-2">💡 사용 방법</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• 새 채팅방을 만들거나 기존 채팅방을 클릭하여 참여하세요</li>
                <li>• 각 채팅방은 최대 5명까지 참여할 수 있습니다</li>
                <li>• 방 목록은 실시간으로 업데이트됩니다</li>
                <li>• 모든 참여자가 나가면 방은 자동으로 삭제됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LobbyPage