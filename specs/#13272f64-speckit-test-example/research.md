# Research: Simple Todo List

**Feature**: Simple Todo List
**Date**: 2026-01-29
**Branch**: `spec/#13272f64-speckit-test-example`

## Research Summary

이 기능은 간단한 할 일 목록 애플리케이션으로, 스펙에 명시된 대로 **로컬 저장소**를 사용하는 **단일 사용자** 환경입니다. 백엔드 없이 프론트엔드만으로 구현 가능합니다.

---

## Decision 1: 데이터 저장 방식

**Decision**: Browser LocalStorage 사용

**Rationale**:
- 스펙의 Assumptions에 "데이터는 로컬 환경에 저장됨 (서버 동기화 제외)" 명시
- 100개 항목 저장 요구사항 (SC-003)을 충족 (LocalStorage 5MB 한도 충분)
- 새로고침 후 데이터 유지 요구사항 (SC-004) 충족
- 별도 백엔드 서버 불필요로 구현 단순화

**Alternatives Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| IndexedDB | 100개 항목에 과도한 복잡성, 비동기 API 불필요 |
| Backend API + DB | 스펙에서 명시적으로 서버 동기화 제외 |
| SessionStorage | 브라우저 종료 시 데이터 손실 |

---

## Decision 2: 상태 관리

**Decision**: Zustand 사용 (Constitution 준수)

**Rationale**:
- Constitution에서 Client State는 Zustand 사용 필수
- Todo 목록은 UI 상태로 분류 (서버 상태 아님 - 백엔드 없음)
- LocalStorage와의 동기화를 위한 persist middleware 활용 가능
- 간단한 상태 구조에 적합

**Alternatives Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| TanStack Query | 서버 상태 관리용 - 백엔드 없음 |
| React Context | Constitution에서 Zustand 지정 |
| Redux | 과도한 보일러플레이트, Constitution 위반 |

---

## Decision 3: 프로젝트 구조

**Decision**: `apps/todo-app` 에 단일 프론트엔드 프로젝트 생성

**Rationale**:
- 사용자 요청: "apps/* 하위에 새로운 앱을 만들어서 진행"
- 기존 패턴 준수 (`chat-fe-with-claude`, `chat-fe-with-cursor` 등)
- 백엔드 불필요 (로컬 저장)
- FSD (Feature-Sliced Design) 아키텍처 적용

**Structure**:
```
apps/todo-app/
├── src/
│   ├── app/           # 앱 초기화, 프로바이더
│   ├── pages/         # TodoPage
│   ├── features/      # todo-crud (추가/완료/삭제)
│   ├── entities/      # todo (모델, 스토어)
│   └── shared/        # UI 컴포넌트, 유틸리티
└── tests/
```

---

## Decision 4: Todo Item 식별자

**Decision**: UUID (crypto.randomUUID()) 사용

**Rationale**:
- 고유성 보장
- 브라우저 내장 API로 외부 의존성 없음
- 정렬은 createdAt 타임스탬프로 처리 (생성 역순)

**Alternatives Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| Auto-increment | LocalStorage에서 동기화 복잡 |
| Date.now() | 동시 생성 시 충돌 가능성 |
| nanoid | 외부 의존성 추가 불필요 |

---

## Decision 5: UI 컴포넌트

**Decision**: shadcn/ui + TailwindCSS (Constitution 준수)

**Rationale**:
- Constitution에서 필수 지정
- 일관된 디자인 시스템
- 접근성(WCAG 2.1 AA) 기본 지원

**Components to Use**:
- Input: 할 일 텍스트 입력
- Button: 추가/삭제 버튼
- Checkbox: 완료 상태 토글
- Card: 할 일 항목 컨테이너

---

## Technical Stack Summary

| Category | Choice | Constitution |
|----------|--------|--------------|
| Language | TypeScript (strict) | ✅ |
| Framework | React 18+ | ✅ |
| Build Tool | Vite | ✅ |
| Styling | TailwindCSS | ✅ |
| Components | shadcn/ui | ✅ |
| State | Zustand | ✅ |
| Storage | LocalStorage | N/A (no backend) |
| Testing | Vitest + Testing Library | ✅ |
| Architecture | FSD | ✅ |

---

## NEEDS CLARIFICATION Resolution

모든 기술적 결정이 완료되었습니다. NEEDS CLARIFICATION 항목 없음.
