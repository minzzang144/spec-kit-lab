const ADJECTIVES = [
  '친절한', '빠른', '행복한', '똑똑한', '귀여운',
  '용감한', '재미있는', '멋진', '신비한', '활발한',
  '조용한', '따뜻한', '시원한', '밝은', '어두운',
  '높은', '낮은', '크고', '작은', '새로운',
  '오래된', '젊은', '늙은', '강한', '약한'
]

const NOUNS = [
  '고양이', '강아지', '토끼', '호랑이', '사자',
  '곰', '여우', '늑대', '독수리', '올빼미',
  '펭귄', '돌고래', '고래', '상어', '거북이',
  '나비', '벌', '개미', '거미', '잠자리',
  '꽃', '나무', '달', '별', '바다'
]

export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]

  return `${adjective}${noun}`
}

export function isValidNickname(nickname: string): boolean {
  if (!nickname || typeof nickname !== 'string') return false
  if (nickname.length < 1 || nickname.length > 20) return false

  // Only allow Korean, English, numbers, and spaces
  const regex = /^[가-힣a-zA-Z0-9\s]+$/
  return regex.test(nickname.trim())
}

export function sanitizeNickname(nickname: string): string {
  return nickname.trim().slice(0, 20)
}

export default {
  generateRandomNickname,
  isValidNickname,
  sanitizeNickname,
}