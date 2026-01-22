import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { SessionManager } from '@/shared/lib'
import { ROUTES } from '@/shared/constants'

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

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

    console.log('Joining room:', roomId, 'as user:', session)
  }, [roomId, navigate])

  if (!roomId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            채팅방 #{roomId}
          </h1>
          <p className="text-gray-600 mb-8">
            실시간 채팅 기능이 곧 여기에 추가됩니다
          </p>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-gray-500">
              채팅 메시지와 참여자 목록이 여기에 표시됩니다...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoomPage