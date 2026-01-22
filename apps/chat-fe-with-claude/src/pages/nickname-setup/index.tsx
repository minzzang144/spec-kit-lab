import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MessageSquare } from 'lucide-react'
import { SessionManager, generateRandomNickname, isValidNickname, sanitizeNickname } from '@/shared/lib'
import { ROUTES } from '@/shared/constants'

export function NicknameSetupPage() {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user already has a session
    const existingSession = SessionManager.load()
    if (SessionManager.isValid(existingSession)) {
      navigate(ROUTES.LOBBY)
    }
  }, [navigate])

  const handleStart = async () => {
    setIsLoading(true)

    try {
      let finalNickname = nickname.trim()

      // Generate random nickname if none provided
      if (!finalNickname) {
        finalNickname = generateRandomNickname()
      } else {
        finalNickname = sanitizeNickname(finalNickname)
      }

      // Validate nickname
      if (!isValidNickname(finalNickname)) {
        throw new Error('유효하지 않은 닉네임입니다. 한글, 영문, 숫자, 공백만 사용할 수 있습니다.')
      }

      // Create session data
      const sessionData = {
        userId: SessionManager.generateUserId(),
        nickname: finalNickname,
        createdAt: new Date().toISOString(),
      }

      // Save to session storage
      SessionManager.save(sessionData)

      // Navigate to lobby
      navigate(ROUTES.LOBBY)
    } catch (error) {
      console.error('Failed to start session:', error)
      alert(error instanceof Error ? error.message : '세션 시작에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {/* App Icon */}
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            실시간 채팅
          </h1>
          <p className="text-gray-600 mb-8">
            닉네임을 입력하고 채팅을 시작하세요
          </p>

          {/* Nickname Input */}
          <div className="mb-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="닉네임을 입력하세요 (선택사항)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={20}
                className="input pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              입력하지 않으면 랜덤 닉네임이 생성됩니다
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                시작하는 중...
              </div>
            ) : (
              '채팅 시작하기'
            )}
          </button>
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