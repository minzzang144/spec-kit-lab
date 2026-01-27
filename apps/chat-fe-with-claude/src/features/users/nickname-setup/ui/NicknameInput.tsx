import type { ChangeEvent, KeyboardEvent } from 'react'
import type { NicknameValidationResult } from '../model/nicknameValidation'

export interface NicknameInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  validationResult: NicknameValidationResult | null
  disabled?: boolean
  placeholder?: string
}

export function NicknameInput({
  value,
  onChange,
  onSubmit,
  validationResult,
  disabled = false,
  placeholder = '닉네임을 입력하세요'
}: NicknameInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && onSubmit) {
      onSubmit()
    }
  }

  const hasError = validationResult && !validationResult.isValid
  const isValid = validationResult && validationResult.isValid

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            input w-full text-center text-lg py-3 px-4
            ${hasError ? 'border-red-500 focus:border-red-500 focus:shadow-red-200' : ''}
            ${isValid ? 'border-green-500 focus:border-green-500 focus:shadow-green-200' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          maxLength={20}
        />

        {/* Validation icon */}
        {validationResult && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <span className="text-green-500 text-xl">✓</span>
            ) : (
              <span className="text-red-500 text-xl">✗</span>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div className="mt-2 text-sm text-red-500 text-center">
          {validationResult.error}
        </div>
      )}

      {/* Character count */}
      <div className="mt-1 text-xs text-gray-500 text-right">
        {value.length}/20
      </div>
    </div>
  )
}