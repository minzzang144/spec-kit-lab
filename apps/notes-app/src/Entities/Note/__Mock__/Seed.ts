import type { Note } from '../Type';

export const INITIAL_NOTE_LIST: Note[] = [
  {
    id: '1',
    title: '프로젝트 기획 회의록',
    content:
      '2026년 1분기 프로젝트 기획 회의 내용 정리. 주요 논의 사항: 일정, 리소스 배분, 마일스톤 설정.',
    categoryId: 'cat-1',
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: '2',
    title: 'TypeScript 학습 노트',
    content:
      'TypeScript 5.x의 새로운 기능 정리. Decorators, const type parameters, satisfies operator 등.',
    categoryId: 'cat-2',
    createdAt: '2026-02-09T14:30:00.000Z',
    updatedAt: '2026-02-09T15:00:00.000Z',
  },
  {
    id: '3',
    title: '장보기 목록',
    content: '우유, 달걀, 빵, 과일, 채소, 닭가슴살',
    categoryId: 'cat-3',
    createdAt: '2026-02-08T10:00:00.000Z',
    updatedAt: '2026-02-08T10:00:00.000Z',
  },
  {
    id: '4',
    title: 'React 19 마이그레이션 체크리스트',
    content:
      '1. use() hook 도입\n2. ref forwarding 자동화 확인\n3. Concurrent features 테스트\n4. 서드파티 라이브러리 호환성 확인',
    categoryId: 'cat-2',
    createdAt: '2026-02-07T16:00:00.000Z',
    updatedAt: '2026-02-08T11:00:00.000Z',
  },
  {
    id: '5',
    title: '주간 미팅 안건',
    content:
      '이번 주 진행 상황 공유, 다음 주 계획 수립, 블로커 논의, 코드 리뷰 일정 조율.',
    categoryId: 'cat-1',
    createdAt: '2026-02-06T08:00:00.000Z',
    updatedAt: '2026-02-06T08:00:00.000Z',
  },
  {
    id: '6',
    title: '미분류 메모',
    content: '나중에 정리할 내용',
    categoryId: 'uncategorized',
    createdAt: '2026-02-05T12:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
  },
];
