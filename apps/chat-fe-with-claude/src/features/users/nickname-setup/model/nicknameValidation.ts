export interface NicknameValidationResult {
  isValid: boolean
  error?: string
}

export const NICKNAME_CONSTRAINTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 20,
  PATTERN: /^[가-힣a-zA-Z0-9_-]+$/,
  FORBIDDEN_WORDS: [
    'admin', 'system', 'guest', 'anonymous', 'null', 'undefined',
    '관리자', '시스템', '운영자'
  ]
} as const

export function validateNickname(nickname: string): NicknameValidationResult {
  if (!nickname || nickname.trim().length === 0) {
    return {
      isValid: false,
      error: '닉네임을 입력해주세요.'
    }
  }

  const trimmedNickname = nickname.trim()

  if (trimmedNickname.length < NICKNAME_CONSTRAINTS.MIN_LENGTH) {
    return {
      isValid: false,
      error: `닉네임은 최소 ${NICKNAME_CONSTRAINTS.MIN_LENGTH}자 이상이어야 합니다.`
    }
  }

  if (trimmedNickname.length > NICKNAME_CONSTRAINTS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `닉네임은 최대 ${NICKNAME_CONSTRAINTS.MAX_LENGTH}자까지 입력 가능합니다.`
    }
  }

  if (!NICKNAME_CONSTRAINTS.PATTERN.test(trimmedNickname)) {
    return {
      isValid: false,
      error: '닉네임은 한글, 영문, 숫자, -, _ 만 사용 가능합니다.'
    }
  }

  if (NICKNAME_CONSTRAINTS.FORBIDDEN_WORDS.some(word =>
    trimmedNickname.toLowerCase().includes(word.toLowerCase())
  )) {
    return {
      isValid: false,
      error: '사용할 수 없는 닉네임입니다.'
    }
  }

  return {
    isValid: true
  }
}