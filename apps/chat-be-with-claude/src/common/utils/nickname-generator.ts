/**
 * 랜덤 닉네임 생성 유틸리티
 * - 형용사 + 명사 조합으로 귀여운 닉네임 생성
 * - 최대 20자 제한에 맞춰 설계
 * - 한글 기반으로 친근한 느낌의 닉네임
 */

const ADJECTIVES = [
  '귀여운',
  '재미있는',
  '멋진',
  '똑똑한',
  '용감한',
  '친절한',
  '활발한',
  '착한',
  '밝은',
  '예쁜',
  '잘생긴',
  '웃긴',
  '신나는',
  '따뜻한',
  '시원한',
  '달콤한',
  '상큼한',
  '깔끔한',
  '느긋한',
  '빠른',
  '조용한',
  '신중한',
  '대담한',
  '순수한',
  '정직한',
  '성실한',
  '열정적인',
  '창의적인',
  '지혜로운',
  '유쾌한',
];

const ANIMALS = [
  '고양이',
  '강아지',
  '토끼',
  '햄스터',
  '다람쥐',
  '코알라',
  '판다',
  '곰',
  '사자',
  '호랑이',
  '코끼리',
  '기린',
  '얼룩말',
  '캥거루',
  '돌고래',
  '펭귄',
  '부엉이',
  '독수리',
  '참새',
  '비둘기',
  '앵무새',
  '거북이',
  '개구리',
  '나비',
  '꿀벌',
  '무당벌레',
  '사슴',
  '늑대',
  '여우',
  '너구리',
  '오리',
  '백조',
  '물개',
  '바다표범',
  '고래',
  '상어',
  '문어',
  '해파리',
  '미어캣',
  '알파카',
];

const OBJECTS = [
  '구름',
  '별',
  '달',
  '태양',
  '바람',
  '눈꽃',
  '무지개',
  '번개',
  '천둥',
  '파도',
  '모래',
  '바위',
  '산',
  '강',
  '호수',
  '바다',
  '숲',
  '꽃',
  '나무',
  '풀',
  '사탕',
  '초콜릿',
  '케이크',
  '쿠키',
  '아이스크림',
  '젤리',
  '마시멜로',
  '커피',
  '차',
  '우유',
  '주스',
  '물',
  '꿀',
  '설탕',
  '소금',
  '후추',
  '연필',
  '지우개',
  '책',
  '공책',
  '가방',
  '모자',
  '신발',
  '옷',
  '목도리',
];

/**
 * 배열에서 랜덤한 요소를 선택합니다.
 */
function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * 랜덤 닉네임을 생성합니다.
 * @param maxLength 최대 길이 (기본값: 20)
 * @returns 생성된 닉네임
 */
export function generateRandomNickname(maxLength: number = 20): string {
  let nickname: string;
  let attempts = 0;
  const maxAttempts = 50; // 무한 루프 방지

  do {
    const adjective = getRandomElement(ADJECTIVES);
    const noun = getRandomElement([...ANIMALS, ...OBJECTS]);
    nickname = `${adjective}${noun}`;
    attempts++;

    // 최대 시도 횟수에 도달하면 강제로 줄임
    if (attempts >= maxAttempts && nickname.length > maxLength) {
      nickname = nickname.substring(0, maxLength);
      break;
    }
  } while (nickname.length > maxLength);

  return nickname;
}

/**
 * 닉네임이 유효한지 검증합니다.
 * @param nickname 검증할 닉네임
 * @returns 유효성 검사 결과
 */
export function validateNickname(nickname: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 길이 검증
  if (nickname.length < 1) {
    errors.push('닉네임은 최소 1자 이상이어야 합니다');
  }
  if (nickname.length > 20) {
    errors.push('닉네임은 최대 20자까지 가능합니다');
  }

  // 문자 검증 (한글, 영문, 숫자, 공백만 허용)
  const nicknameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
  if (!nicknameRegex.test(nickname)) {
    errors.push('닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다');
  }

  // 공백만으로 구성된 경우 검증
  if (nickname.trim().length === 0) {
    errors.push('닉네임은 공백만으로 구성될 수 없습니다');
  }

  // 연속 공백 검증
  if (nickname.includes('  ')) {
    errors.push('닉네임에 연속된 공백은 사용할 수 없습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 고유한 닉네임을 생성합니다 (중복 방지용).
 * @param existingNicknames 기존 닉네임 목록
 * @param maxLength 최대 길이
 * @param maxAttempts 최대 시도 횟수
 * @returns 고유한 닉네임
 */
export function generateUniqueNickname(
  existingNicknames: string[],
  maxLength: number = 20,
  maxAttempts: number = 100,
): string {
  let attempts = 0;
  let nickname: string;

  const existingSet = new Set(
    existingNicknames.map((nick) => nick.toLowerCase()),
  );

  do {
    nickname = generateRandomNickname(maxLength);
    attempts++;

    // 최대 시도 횟수에 도달하면 숫자를 추가하여 고유성 보장
    if (attempts >= maxAttempts) {
      const baseNickname = generateRandomNickname(maxLength - 3);
      let counter = 1;

      do {
        nickname = `${baseNickname}${counter}`;
        counter++;
      } while (
        existingSet.has(nickname.toLowerCase()) &&
        counter <= 999 // 숫자도 3자리까지만
      );

      break;
    }
  } while (existingSet.has(nickname.toLowerCase()));

  return nickname;
}

/**
 * 닉네임 생성기의 통계 정보를 반환합니다.
 */
export function getNicknameGeneratorStats() {
  return {
    totalCombinations: ADJECTIVES.length * (ANIMALS.length + OBJECTS.length),
    adjectiveCount: ADJECTIVES.length,
    nounCount: ANIMALS.length + OBJECTS.length,
    animalCount: ANIMALS.length,
    objectCount: OBJECTS.length,
    averageLength: Math.round(
      ADJECTIVES.reduce((sum, adj) => sum + adj.length, 0) / ADJECTIVES.length +
        [...ANIMALS, ...OBJECTS].reduce((sum, noun) => sum + noun.length, 0) /
          (ANIMALS.length + OBJECTS.length),
    ),
  };
}
