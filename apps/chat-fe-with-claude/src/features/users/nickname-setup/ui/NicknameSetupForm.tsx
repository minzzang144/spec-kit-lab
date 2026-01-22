import { useEffect } from 'react'
import { useNicknameSetup } from '../hooks/useNicknameSetup'
import { NicknameInput } from './NicknameInput'
import { RandomNicknameButton } from './RandomNicknameButton'

export interface NicknameSetupFormProps {
  onSuccess?: (nickname: string) => void
  autoGenerateInitial?: boolean
}

export function NicknameSetupForm({
  onSuccess,
  autoGenerateInitial = true
}: NicknameSetupFormProps) {
  const {
    nickname,
    validationResult,
    isCheckingAvailability,
    isCreatingUser,
    error,
    setNickname,
    generateNickname,
    submitNickname,
    canSubmit,
  } = useNicknameSetup()

  // Auto-generate initial nickname
  useEffect(() => {
    if (autoGenerateInitial && !nickname) {
      generateNickname()
    }
  }, [autoGenerateInitial, nickname, generateNickname])

  const handleSubmit = async () => {
    if (!canSubmit) return

    const success = await submitNickname(nickname)
    if (success && onSuccess) {
      onSuccess(nickname)
    }
  }

  const isLoading = isCheckingAvailability || isCreatingUser

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          채팅에 참여하기
        </h2>
        <p className="text-gray-600">
          사용하실 닉네임을 설정해주세요
        </p>
      </div>

      {/* Nickname Input */}
      <div className="space-y-4">
        <NicknameInput
          value={nickname}
          onChange={setNickname}
          onSubmit={handleSubmit}
          validationResult={validationResult}
          disabled={isLoading}
          placeholder="닉네임을 입력하세요"
        />

        {/* Random nickname button */}
        <div className="text-center">
          <RandomNicknameButton
            onGenerate={generateNickname}
            disabled={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className={`
            btn w-full py-3 text-lg font-medium rounded-lg transition-all
            ${canSubmit && !isLoading
              ? 'btn-primary hover:shadow-lg transform hover:-translate-y-0.5'
              : 'btn-secondary opacity-50 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {isCheckingAvailability ? '확인 중...' : '입장 중...'}
            </span>
          ) : (
            '채팅방 입장'
          )}
        </button>
      </div>

      {/* Help text */}
      <div className="text-center text-xs text-gray-500">
        <p>닉네임은 2-20자까지 설정 가능하며</p>
        <p>한글, 영문, 숫자, -, _ 만 사용할 수 있습니다</p>
      </div>
    </div>
  )
}