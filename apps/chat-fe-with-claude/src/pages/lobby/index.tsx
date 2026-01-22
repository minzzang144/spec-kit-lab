import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionManager } from '@/shared/lib'
import { ROUTES } from '@/shared/constants'

export function LobbyPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has a valid session
    const session = SessionManager.load()
    if (!SessionManager.isValid(session)) {
      navigate(ROUTES.NICKNAME_SETUP)
      return
    }

    console.log('User session:', session)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            채팅 로비
          </h1>
          <p className="text-gray-600 mb-8">
            채팅방을 만들거나 기존 채팅방에 참여하세요
          </p>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-gray-500">
              곧 채팅방 목록과 생성 기능이 여기에 표시됩니다...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage