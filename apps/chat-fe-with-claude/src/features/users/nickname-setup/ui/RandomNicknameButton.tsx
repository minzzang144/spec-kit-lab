export interface RandomNicknameButtonProps {
  onGenerate: () => void
  disabled?: boolean
}

export function RandomNicknameButton({ onGenerate, disabled = false }: RandomNicknameButtonProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className={`
        btn btn-ghost text-sm py-2 px-4 rounded-lg transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
      `}
      type="button"
    >
      <span className="mr-2">🎲</span>
      랜덤 닉네임 생성
    </button>
  )
}