import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { SessionManager } from '@/shared/lib/session-manager'
import { NicknameSetupForm } from '@/features/users/nickname-setup'

export function NicknameSetupPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user already has a session
    const existingSession = SessionManager.load()
    if (existingSession?.nickname) {
      navigate('/lobby')
    }
  }, [navigate])

  const handleSuccess = (nickname: string) => {
    console.log('Nickname setup successful:', nickname)
    navigate('/lobby')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {/* App Icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>

          {/* Nickname Setup Form */}
          <NicknameSetupForm
            onSuccess={handleSuccess}
            autoGenerateInitial={true}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          최대 5명까지 참여할 수 있는 실시간 채팅방을 만들거나 참여하세요
        </p>
      </div>
    </div>
  )
}

export default NicknameSetupPage