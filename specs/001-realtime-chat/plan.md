# Implementation Plan: 실시간 채팅 앱

**Branch**: `001-realtime-chat` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-realtime-chat/spec.md`

## Summary

**Primary Requirement**: 최대 5명이 참여할 수 있는 실시간 채팅 애플리케이션으로, 사용자는 랜덤 닉네임으로 로비에 입장하여 채팅방을 생성하거나 참여할 수 있고, 실시간으로 메시지를 주고받을 수 있습니다. 모든 사용자가 나간 방은 자동으로 삭제됩니다.

**Technical Approach**: spec-kit-lab 워크스페이스 내에서 NestJS Backend와 React Frontend를 Socket.IO로 연결하고, **Backend-First 타입 생성** 방식을 채택합니다. Backend에서 OpenAPI 스키마와 Socket.IO 타입 스키마를 자동 생성하여 Frontend에서 코드 생성 도구로 TypeScript 타입을 자동 생성합니다. 실험용으로 인메모리 데이터 저장과 세션 스토리지 기반 사용자 관리를 사용하며, Constitution의 기술 스택을 준수합니다.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 18+
**Primary Dependencies**:
- Backend: NestJS, Socket.IO, @nestjs/swagger, class-validator, class-transformer, UUID
- Frontend: React 18+, Vite, Socket.IO-client, TanStack Query, Zustand, React Hook Form, openapi-generator-cli
- Type Generation: @nestjs/swagger (OpenAPI), custom Socket.IO schema generator
- Styling: TailwindCSS, Lucide Icons
- Testing: Vitest (Frontend), Jest+Supertest (Backend), Playwright (E2E)

**Storage**: In-Memory (Map-based data structures), SessionStorage (client-side)
**Testing**: Jest + Supertest (Backend), Vitest + Testing Library (Frontend), Playwright (E2E)
**Target Platform**: Web browsers (Chrome, Firefox, Safari), Node.js server
**Project Type**: Web application (Frontend + Backend)
**Performance Goals**:
- Message latency < 1초
- Room updates < 5초
- 100 concurrent users support
- User session setup < 30초

**Constraints**:
- 실험용 (no authentication, temporary data)
- 방당 최대 5명 참여자
- 메시지 최대 500자
- 닉네임 최대 20자 (한글/영문/숫자/공백)
- 30초 연결 해제 감지

**Scale/Scope**:
- ~100 concurrent users (실험용)
- ~20 active rooms
- ~1000 messages in memory
- 5 main UI screens (로비, 닉네임 설정, 방 목록, 채팅방, 에러)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack (I)**:

Frontend:
- [x] TypeScript strict mode used
- [x] React 18+ as framework
- [x] Vite as build tool
- [x] TailwindCSS for styling (utility-first only)
- [x] shadcn/ui as component library (Lucide icons로 대체, 실험용이므로 허용)
- [x] TanStack Query for server state
- [x] Zustand for client state (UI state only)
- [x] React Hook Form for all forms

Backend:
- [x] TypeScript strict mode used
- [x] NestJS framework used
- [x] ~~PostgreSQL/SQLite~~ → In-Memory (실험용, 세션 기반 데이터)
- [x] ~~Prisma/TypeORM~~ → 직접 Map 구조 사용 (단순화)
- [x] class-validator + class-transformer for validation
- [x] ~~JWT + Passport~~ → 세션 스토리지 (실험용 단순화)
- [x] Swagger/OpenAPI documentation enabled

**Architecture Principles (II)**:

Frontend (FSD):
- [x] FSD (Feature-Sliced Design) architecture used
- [x] Layer hierarchy respected: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- [x] Higher layers only import from lower layers (no reverse imports)
- [x] Each slice has Public API via `index.ts`
- [x] Container/Presenter pattern used for complex components
- [x] Custom hooks extract business logic from components

Backend (NestJS Modular):
- [x] NestJS modular architecture followed
- [x] Each module follows standard structure (gateway, service, dto, tests - Socket.IO 중심)
- [x] Gateways handle Socket.IO events (Controllers는 HTTP API용)
- [x] Services contain all business logic
- [x] DTOs handle validation and transformation
- [x] No circular dependencies between modules

**Code Quality Rules (III)**:

Testing:
- [x] TDD approach: tests written before implementation
- [x] Frontend: 80%+ test coverage planned for `/features` and `/entities` (Vitest + Testing Library + Playwright)
- [x] Backend: 80%+ test coverage planned for services and gateways (Jest + Supertest)
- [x] ~~Backend: separate test database~~ → In-memory test fixtures

Frontend Quality:
- [x] WCAG 2.1 AA compliance planned for all UI components
- [x] Error boundaries planned (no try-catch in route handlers)
- [x] React Query handles server state (no manual fetching)
- [x] Container/Presenter pattern for complex components

Backend Quality:
- [x] Global exception filters for error handling
- [x] DTOs with class-validator for all input validation
- [x] ~~JWT authentication~~ → Session storage (실험용 단순화)
- [x] API endpoints documented with Swagger/OpenAPI
- [x] Rate limiting and CORS configured
- [x] ~~Database queries optimized~~ → In-memory 데이터 구조 최적화

General:
- [x] Magic numbers replaced with named constants
- [x] Functions under 50 lines, files under 300 lines
- [x] Proper naming conventions (PascalCase components/services, camelCase hooks, UPPER_SNAKE_CASE constants)

**Documentation Rules (IV)**:

- [x] spec.md is technology-agnostic (no React, NestJS, Prisma, etc. mentioned)
- [x] plan.md contains all technical implementation details (frameworks, libraries, architecture)
- [x] Clear separation between WHAT/WHY (spec) and HOW (plan)
- [x] API documentation generated via Swagger/OpenAPI decorators

**Development Workflow (V)**:

- [x] One task = one commit strategy planned
- [x] Conventional commits format to be used
- [x] Plan Mode workflow to be followed for implementation
- [x] Frontend verification: pnpm run type-check, lint, test, build
- [x] Backend verification: pnpm run type-check, lint, test, test:e2e, build
- [x] Manual review checklist includes backend API documentation and in-memory 구조 최적화

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**선택된 구조**: spec-kit-lab 워크스페이스 내 서브 애플리케이션 (Backend-First 타입 생성)

```text
spec-kit-lab/                         # 기존 루트 워크스페이스
├── package.json                      # 이미 설정된 워크스페이스 설정

├── chat-fe-with-claude/              # React Frontend 애플리케이션
│   ├── src/
│   │   ├── app/                      # 앱 초기화, 프로바이더, 라우팅
│   │   │   ├── App.tsx              # 메인 앱 컴포넌트
│   │   │   ├── providers.tsx        # React Query, Zustand 프로바이더
│   │   │   └── router.tsx           # 라우팅 설정
│   │   ├── pages/                    # 페이지 레벨 컴포넌트
│   │   │   ├── lobby/               # 로비 페이지 (방 목록)
│   │   │   ├── chat-room/           # 채팅방 페이지
│   │   │   ├── nickname-setup/      # 닉네임 설정 페이지
│   │   │   └── error/               # 에러 페이지
│   │   ├── widgets/                  # 독립적 UI 블록
│   │   │   ├── header/              # 앱 헤더
│   │   │   ├── room-list/           # 방 목록 위젯
│   │   │   └── chat-input/          # 채팅 입력 위젯
│   │   ├── features/                 # 사용자 상호작용 기능
│   │   │   ├── chat/                # 채팅 관련 기능
│   │   │   │   ├── send-message/    # 메시지 전송
│   │   │   │   ├── join-room/       # 방 참여
│   │   │   │   └── leave-room/      # 방 나가기
│   │   │   ├── rooms/               # 방 관련 기능
│   │   │   │   ├── create-room/     # 방 생성
│   │   │   │   └── room-list/       # 방 목록 관리
│   │   │   └── users/               # 사용자 관련 기능
│   │   │       ├── nickname-setup/  # 닉네임 설정
│   │   │       └── session-manager/ # 세션 관리
│   │   ├── entities/                 # 비즈니스 엔티티
│   │   │   ├── user/                # 사용자 엔티티
│   │   │   ├── chat-room/           # 채팅방 엔티티
│   │   │   └── message/             # 메시지 엔티티
│   │   ├── generated/               # 🔄 Backend에서 자동 생성된 코드
│   │   │   ├── api/                # OpenAPI에서 생성된 HTTP API 클라이언트
│   │   │   ├── socket-types.ts     # Socket.IO 이벤트 타입
│   │   │   └── models/             # 데이터 모델 타입
│   │   └── shared/                 # 공용 코드 (타입 제외)
│   │       ├── lib/                # 유틸리티 라이브러리
│   │       ├── ui/                 # 공용 UI 컴포넌트
│   │       └── hooks/              # 커스텀 훅
│   ├── public/                       # 정적 파일
│   ├── tests/                        # 테스트 파일
│   │   ├── unit/                    # 단위 테스트
│   │   ├── integration/             # 통합 테스트
│   │   └── e2e/                     # End-to-End 테스트
│   ├── package.json                  # Frontend 의존성 + 타입 생성 스크립트
│   │                                #   "generate-types": "openapi-generator + socket-schema fetch"
│   │                                #   "dev": "pnpm generate-types && vite"
│   ├── vite.config.ts               # Vite 설정 (프록시 포함)
│   ├── tailwind.config.js           # TailwindCSS 설정
│   ├── tsconfig.json                # TypeScript 설정
│   ├── vitest.config.ts             # 테스트 설정
│   └── .gitignore                   # generated/ 폴더 제외

├── chat-be-with-claude/              # NestJS Backend 애플리케이션
│   ├── src/
│   │   ├── main.ts                  # 애플리케이션 엔트리포인트
│   │   ├── app.module.ts            # 루트 모듈
│   │   ├── modules/                 # 기능별 모듈
│   │   │   ├── chat/                # 채팅 모듈
│   │   │   │   ├── chat.gateway.ts  # Socket.IO 게이트웨이
│   │   │   │   ├── chat.service.ts  # 채팅 비즈니스 로직
│   │   │   │   ├── chat.module.ts   # 채팅 모듈 정의
│   │   │   │   ├── dto/             # 데이터 전송 객체
│   │   │   │   └── tests/           # 채팅 모듈 테스트
│   │   │   ├── rooms/               # 방 관리 모듈
│   │   │   │   ├── rooms.controller.ts # HTTP API 컨트롤러
│   │   │   │   ├── rooms.service.ts    # 방 관리 서비스
│   │   │   │   ├── rooms.module.ts     # 방 모듈 정의
│   │   │   │   ├── dto/                # 방 관련 DTO
│   │   │   │   └── tests/              # 방 모듈 테스트
│   │   │   ├── users/               # 사용자 관리 모듈
│   │   │   │   ├── users.controller.ts # HTTP API 컨트롤러
│   │   │   │   ├── users.service.ts    # 사용자 서비스
│   │   │   │   ├── users.module.ts     # 사용자 모듈
│   │   │   │   ├── dto/                # 사용자 관련 DTO
│   │   │   │   └── tests/              # 사용자 모듈 테스트
│   │   │   ├── server/              # 서버 상태 모듈
│   │   │   │   ├── server.controller.ts # 헬스체크, 통계 API
│   │   │   │   ├── server.service.ts    # 서버 상태 서비스
│   │   │   │   └── server.module.ts     # 서버 모듈
│   │   │   └── type-schema/         # 🔄 타입 스키마 생성 모듈
│   │   │       ├── schema.controller.ts # Socket.IO 타입 스키마 API
│   │   │       ├── schema.service.ts    # 타입 스키마 생성 서비스
│   │   │       └── schema.module.ts     # 타입 스키마 모듈
│   │   ├── common/                  # 공통 유틸리티
│   │   │   ├── filters/             # 예외 필터
│   │   │   ├── guards/              # 가드 (실험용으로 최소화)
│   │   │   ├── interceptors/        # 인터셉터
│   │   │   ├── pipes/               # 파이프 (유효성 검증)
│   │   │   └── decorators/          # 커스텀 데코레이터
│   │   ├── storage/                 # 인메모리 데이터 저장소
│   │   │   ├── memory-store.ts      # 메인 데이터 저장소 클래스
│   │   │   └── interfaces/          # 저장소 인터페이스
│   │   └── types/                   # 백엔드 전용 타입
│   ├── test/                        # 테스트 디렉터리
│   │   ├── unit/                    # 단위 테스트
│   │   ├── integration/             # 통합 테스트
│   │   └── e2e/                     # E2E API 테스트
│   ├── package.json                 # Backend 의존성 + Swagger 설정
│   ├── nest-cli.json               # NestJS CLI 설정
│   ├── tsconfig.json               # TypeScript 설정
│   ├── jest.config.js              # Jest 테스트 설정
│   └── swagger.json                # 🔄 자동 생성된 OpenAPI 스펙

└── specs/001-realtime-chat/         # 이 프로젝트 명세서 (참고용)
    ├── spec.md                     # 요구사항 명세
    ├── plan.md                     # 기술 설계 (이 문서)
    ├── research.md                 # 기술 연구
    ├── data-model.md               # 데이터 모델
    └── contracts/                  # 참고용 계약 정의
```

**Structure Decision**:
- **spec-kit-lab 워크스페이스**: 기존 루트 워크스페이스 활용
- **Backend-First 타입 생성**: NestJS에서 OpenAPI + Socket.IO 스키마 자동 생성 → Frontend에서 자동 타입 생성
- **FSD 아키텍처**: 프론트엔드는 Feature-Sliced Design 적용 (`generated/` 폴더 추가)
- **NestJS 모듈러**: 백엔드는 기능별 모듈로 분리 + 타입 스키마 모듈 추가
- **Shared 제거**: 중앙화된 타입 관리 대신 Backend 소스 오브 트루스 방식

## Complexity Tracking

**실험용 단순화로 인한 Constitution 변경사항**:

| Constitution 원칙              | 적용된 변경사항                        | 단순화 이유                                    | 향후 확장 가능성                    |
| ----------------------------- | ------------------------------------ | --------------------------------------------- | -------------------------------- |
| PostgreSQL/SQLite DB          | In-Memory Map 구조                   | 실험용으로 영구 저장 불필요, 빠른 개발 속도    | Redis → PostgreSQL 점진적 이전 가능 |
| Prisma/TypeORM ORM            | 직접 Map 기반 데이터 접근              | 단순한 CRUD만 필요, ORM 설정 복잡성 제거       | 필요 시 Prisma 도입 용이            |
| JWT + Passport 인증           | SessionStorage 기반 세션               | 사용자 요구 "실험용이라서 인증 안해도 됨"      | JWT 인증 시스템 추가 구현 가능       |
| shadcn/ui 컴포넌트 라이브러리   | Lucide icons만 사용                   | 실험용이므로 아이콘만으로 충분한 UI             | shadcn/ui 컴포넌트 점진적 도입 가능   |

**정당성**:
- **사용자 명시적 요구사항**: "실험용", "Redis까지 사용하지 않아도 괜찮아", "사용자 인증까지 안해도 될 것 같아"
- **핵심 기능 집중**: 실시간 채팅 구현에 집중하여 부가적 복잡성 제거
- **확장 가능한 설계**: 모든 단순화는 향후 Constitution 준수 기술로 마이그레이션 가능하도록 설계

**Constitution 핵심 원칙 준수**:
- ✅ TypeScript strict mode 유지
- ✅ React 18 + NestJS 아키텍처 유지
- ✅ TailwindCSS + TanStack Query + Zustand 유지
- ✅ 테스트 커버리지 목표 유지
- ✅ 코드 품질 규칙 유지
