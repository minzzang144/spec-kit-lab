// Random nickname generator for users
const ADJECTIVES = [
  '귀여운', '멋진', '빠른', '똑똑한', '용감한', '친절한', '재미있는', '활발한',
  '조용한', '차분한', '밝은', '따뜻한', '시원한', '상쾌한', '달콤한', '향긋한',
  '포근한', '부드러운', '튼튼한', '건강한', '행복한', '즐거운', '신나는', '평화로운'
]

const NOUNS = [
  '고양이', '강아지', '토끼', '햄스터', '거북이', '물고기', '새', '나비',
  '꽃', '나무', '별', '달', '해', '구름', '바람', '비', '눈', '무지개',
  '사과', '바나나', '딸기', '포도', '오렌지', '수박', '복숭아', '체리',
  '커피', '차', '우유', '쿠키', '케이크', '빵', '피자', '파스타'
]

const NUMBERS = ['1', '2', '3', '7', '8', '9', '77', '88', '99', '123']

export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]

  // 70% chance to include number, 30% without number
  const includeNumber = Math.random() < 0.7

  return includeNumber ? `${adjective}${noun}${number}` : `${adjective}${noun}`
}

export function generateMultipleNicknames(count: number = 3): string[] {
  const nicknames = new Set<string>()

  while (nicknames.size < count) {
    nicknames.add(generateRandomNickname())
  }

  return Array.from(nicknames)
}