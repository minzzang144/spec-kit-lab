# Tasks: 실시간 채팅 앱

**Input**: Design documents from `/specs/001-realtime-chat/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**🔄 구조 변경**: 사용자 요청에 따라 **chat-fe-with-claude/와 chat-be-with-claude/를 완전히 독립된 병렬 애플리케이션**으로 분리하여 각각 커밋 단위로 그룹화했습니다.

**Backend-First 타입 생성**: Backend에서 OpenAPI와 Socket.IO 스키마를 자동 생성 → Frontend에서 자동 타입 생성

**Constitution Requirements**: All tasks must follow the constitution v2.1.0:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- Frontend: verify with pnpm run type-check, lint, test, build
- Backend: verify with pnpm run type-check, lint, test, build

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: 프로젝트 설정 (Setup)

**Purpose**: 워크스페이스 내 두 독립 애플리케이션 초기화

- [ ] T001 워크스페이스 설정 확인 및 기본 구조 준비 in spec-kit-lab/package.json
- [ ] T002 [P] NestJS 프로젝트 생성 in chat-be-with-claude/
- [ ] T003 [P] React+Vite 프로젝트 생성 in chat-fe-with-claude/

---

## Phase 2-BE: Backend 기초 인프라 (BE 독립 작업)

**Purpose**: Backend 핵심 인프라 구축 - Frontend 작업을 위한 타입 소스 생성

**⚠️ CRITICAL**: Backend 기초가 완료되어야 Frontend가 타입을 생성할 수 있음

### BE 의존성 및 설정 구성
- [ ] T004 [P] Socket.IO 의존성 설치 in chat-be-with-claude/package.json
- [ ] T005 [P] NestJS Swagger 및 기본 의존성 설치 in chat-be-with-claude/package.json
- [ ] T006 [P] 환경 설정 및 CORS 구성 in chat-be-with-claude/src/main.ts

### BE 기본 구조
- [ ] T007 [P] NestJS 모듈 구조 설정 in chat-be-with-claude/src/app.module.ts
- [ ] T008 [P] 전역 예외 필터 생성 in chat-be-with-claude/src/common/filters/
- [ ] T009 [P] Swagger OpenAPI 자동 생성 설정 in chat-be-with-claude/src/main.ts

### BE 데이터 저장소
- [ ] T010 [P] 인메모리 데이터 저장소 클래스 생성 in chat-be-with-claude/src/storage/memory-store.ts
- [ ] T011 [P] 데이터 저장소 인터페이스 정의 in chat-be-with-claude/src/storage/interfaces/

### BE 타입 스키마 모듈 (Frontend 타입 생성용)
- [ ] T012 [P] Socket.IO 타입 스키마 서비스 생성 in chat-be-with-claude/src/modules/type-schema/schema.service.ts
- [ ] T013 [P] Socket.IO 타입 스키마 컨트롤러 생성 in chat-be-with-claude/src/modules/type-schema/schema.controller.ts
- [ ] T014 Socket.IO 타입 스키마 모듈 생성 in chat-be-with-claude/src/modules/type-schema/schema.module.ts

**Checkpoint**: Backend 기초 인프라 완료 - Frontend 타입 생성 가능

---

## Phase 2-FE: Frontend 기초 인프라 (FE 독립 작업)

**Purpose**: Frontend 핵심 인프라 구축 - Backend에서 타입 생성

### FE 의존성 및 설정 구성
- [ ] T015 [P] Socket.IO Client 및 상태관리 의존성 설치 in chat-fe-with-claude/package.json
- [ ] T016 [P] TailwindCSS 및 UI 의존성 설치 in chat-fe-with-claude/package.json
- [ ] T017 [P] 타입 생성 도구 설치 및 스크립트 설정 in chat-fe-with-claude/package.json

### FE 프로젝트 설정
- [ ] T018 [P] Vite 프록시 설정 in chat-fe-with-claude/vite.config.ts
- [ ] T019 [P] TailwindCSS 설정 in chat-fe-with-claude/tailwind.config.js
- [ ] T020 [P] TypeScript 설정 in chat-fe-with-claude/tsconfig.json

### FE FSD 아키텍처 구조
- [ ] T021 [P] FSD 디렉터리 구조 생성 in chat-fe-with-claude/src/
- [ ] T022 [P] 앱 초기화 및 라우터 설정 in chat-fe-with-claude/src/app/
- [ ] T023 [P] 프로바이더 설정 (React Query, Socket) in chat-fe-with-claude/src/app/providers.tsx

### FE 타입 자동 생성 시스템
- [ ] T024 [P] OpenAPI 타입 자동 생성 스크립트 생성 in chat-fe-with-claude/scripts/generate-api-types.js
- [ ] T025 [P] Socket.IO 타입 자동 생성 스크립트 생성 in chat-fe-with-claude/scripts/generate-socket-types.js
- [ ] T026 타입 자동 생성 실행 및 테스트 in chat-fe-with-claude/src/generated/

**Checkpoint**: Frontend 기초 인프라 완료 - 두 애플리케이션 병렬 개발 가능

---

## Phase 3-BE: User Story 1 Backend - 사용자 로비 입장 및 닉네임 설정 🎯

**Goal**: Backend에서 사용자 생성, 닉네임 검증, Socket 연결 관리

### BE User Story 1 Implementation
- [ ] T027 [P] [US1] User 엔티티 DTO 클래스 생성 in chat-be-with-claude/src/modules/users/dto/
- [ ] T028 [P] [US1] 랜덤 닉네임 생성 유틸리티 생성 in chat-be-with-claude/src/common/utils/nickname-generator.ts
- [ ] T029 [US1] Users 서비스 구현 (사용자 생성, 닉네임 검증) in chat-be-with-claude/src/modules/users/users.service.ts
- [ ] T030 [US1] Users 컨트롤러 구현 in chat-be-with-claude/src/modules/users/users.controller.ts
- [ ] T031 [US1] Users 모듈 생성 및 등록 in chat-be-with-claude/src/modules/users/users.module.ts
- [ ] T032 [US1] Socket Gateway 기본 구조 생성 (연결 관리) in chat-be-with-claude/src/modules/chat/chat.gateway.ts

### BE US1 검증
- [ ] T033 [US1] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US1 완료 - 사용자 관리 및 Socket 연결 처리

---

## Phase 3-FE: User Story 1 Frontend - 사용자 로비 입장 및 닉네임 설정 🎯

**Goal**: Frontend에서 닉네임 입력, 세션 관리, 로비 화면 구현

### FE User Story 1 Implementation
- [ ] T034 [P] [US1] User 엔티티 모델 생성 in chat-fe-with-claude/src/entities/user/
- [ ] T035 [P] [US1] 세션 매니저 유틸리티 생성 in chat-fe-with-claude/src/shared/lib/session-manager.ts
- [ ] T036 [US1] Socket 연결 훅 생성 in chat-fe-with-claude/src/shared/hooks/useSocket.ts
- [ ] T037 [US1] 닉네임 설정 기능 구현 in chat-fe-with-claude/src/features/users/nickname-setup/
- [ ] T038 [US1] 닉네임 설정 페이지 구현 in chat-fe-with-claude/src/pages/nickname-setup/
- [ ] T039 [US1] 로비 페이지 기본 구조 생성 in chat-fe-with-claude/src/pages/lobby/

### FE US1 검증
- [ ] T040 [US1] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US1 완료 - 닉네임 설정하고 로비 입장 가능

---

## Phase 4-BE: User Story 3 Backend - 채팅방 목록 조회 및 관리

**Goal**: Backend에서 방 목록 API, 방 정보 관리, 실시간 업데이트

### BE User Story 3 Implementation
- [ ] T041 [P] [US3] ChatRoom 엔티티 DTO 클래스 생성 in chat-be-with-claude/src/modules/rooms/dto/
- [ ] T042 [P] [US3] 방 자동 이름 생성 유틸리티 생성 in chat-be-with-claude/src/common/utils/room-name-generator.ts
- [ ] T043 [US3] Rooms 서비스 구현 (방 목록, 방 정보 조회) in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T044 [US3] Rooms 컨트롤러 구현 in chat-be-with-claude/src/modules/rooms/rooms.controller.ts
- [ ] T045 [US3] Rooms 모듈 생성 및 등록 in chat-be-with-claude/src/modules/rooms/rooms.module.ts
- [ ] T046 [US3] Socket Gateway에 로비 업데이트 이벤트 추가 in chat-be-with-claude/src/modules/chat/chat.gateway.ts

### BE US3 검증
- [ ] T047 [US3] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US3 완료 - 방 목록 조회 및 관리 API

---

## Phase 4-FE: User Story 3 Frontend - 채팅방 목록 조회 및 관리

**Goal**: Frontend에서 방 목록 화면, 실시간 업데이트, 방 정보 표시

### FE User Story 3 Implementation
- [ ] T048 [P] [US3] ChatRoom 엔티티 모델 생성 in chat-fe-with-claude/src/entities/chat-room/
- [ ] T049 [P] [US3] Rooms API 클라이언트 생성 (TanStack Query) in chat-fe-with-claude/src/entities/chat-room/api/rooms.api.ts
- [ ] T050 [US3] 방 목록 조회 기능 구현 in chat-fe-with-claude/src/features/rooms/room-list/
- [ ] T051 [US3] 방 목록 위젯 구현 in chat-fe-with-claude/src/widgets/room-list/
- [ ] T052 [US3] 로비 페이지 방 목록 통합 in chat-fe-with-claude/src/pages/lobby/

### FE US3 검증
- [ ] T053 [US3] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US3 완료 - 방 목록 조회 및 실시간 업데이트

---

## Phase 5-BE: User Story 4 Backend - 새로운 채팅방 생성

**Goal**: Backend에서 방 생성 API, Socket 이벤트, 자동 입장 처리

### BE User Story 4 Implementation
- [ ] T054 [P] [US4] 방 생성 DTO 클래스 생성 in chat-be-with-claude/src/modules/rooms/dto/create-room.dto.ts
- [ ] T055 [US4] Rooms 서비스에 방 생성 기능 추가 in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T056 [US4] Rooms 컨트롤러에 방 생성 엔드포인트 추가 in chat-be-with-claude/src/modules/rooms/rooms.controller.ts
- [ ] T057 [US4] Socket Gateway에 방 생성 이벤트 추가 in chat-be-with-claude/src/modules/chat/chat.gateway.ts

### BE US4 검증
- [ ] T058 [US4] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US4 완료 - 방 생성 및 자동 입장 API

---

## Phase 5-FE: User Story 4 Frontend - 새로운 채팅방 생성

**Goal**: Frontend에서 방 생성 버튼, 생성 플로우, 자동 이동

### FE User Story 4 Implementation
- [ ] T059 [P] [US4] 방 생성 기능 구현 in chat-fe-with-claude/src/features/rooms/create-room/
- [ ] T060 [US4] 방 생성 버튼 및 UI 구현 in chat-fe-with-claude/src/widgets/room-list/
- [ ] T061 [US4] 로비 페이지에 방 생성 기능 통합 in chat-fe-with-claude/src/pages/lobby/

### FE US4 검증
- [ ] T062 [US4] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US4 완료 - 방 생성 버튼과 자동 입장

---

## Phase 6-BE: User Story 5 Backend - 기존 채팅방 참여

**Goal**: Backend에서 방 참여 처리, 인원 제한 검증, 참여자 관리

### BE User Story 5 Implementation
- [ ] T063 [P] [US5] 방 참여 DTO 클래스 생성 in chat-be-with-claude/src/modules/rooms/dto/join-room.dto.ts
- [ ] T064 [US5] Rooms 서비스에 방 참여 기능 추가 in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T065 [US5] Socket Gateway에 방 참여 이벤트 추가 in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T066 [US5] 방 참여자 관리 기능 구현 in chat-be-with-claude/src/modules/chat/chat.service.ts

### BE US5 검증
- [ ] T067 [US5] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US5 완료 - 방 참여 및 참여자 관리

---

## Phase 6-FE: User Story 5 Frontend - 기존 채팅방 참여

**Goal**: Frontend에서 방 클릭, 참여 플로우, 채팅방 화면 이동

### FE User Story 5 Implementation
- [ ] T068 [P] [US5] 방 참여 기능 구현 in chat-fe-with-claude/src/features/chat/join-room/
- [ ] T069 [US5] 채팅방 페이지 기본 구조 생성 in chat-fe-with-claude/src/pages/chat-room/
- [ ] T070 [US5] 방 목록에서 방 클릭 기능 추가 in chat-fe-with-claude/src/widgets/room-list/

### FE US5 검증
- [ ] T071 [US5] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US5 완료 - 방 목록에서 방 참여 가능

---

## Phase 7-BE: User Story 2 Backend - 실시간 채팅 기능

**Goal**: Backend에서 메시지 관리, Socket 브로드캐스팅, 시스템 메시지

### BE User Story 2 Implementation
- [ ] T072 [P] [US2] Message 엔티티 DTO 클래스 생성 in chat-be-with-claude/src/modules/chat/dto/
- [ ] T073 [US2] Chat 서비스에 메시지 관리 기능 추가 in chat-be-with-claude/src/modules/chat/chat.service.ts
- [ ] T074 [US2] Socket Gateway에 메시지 송수신 이벤트 추가 in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T075 [US2] 시스템 메시지 생성 기능 구현 in chat-be-with-claude/src/common/utils/system-message.ts

### BE US2 검증
- [ ] T076 [US2] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US2 완료 - 실시간 메시지 송수신 처리

---

## Phase 7-FE: User Story 2 Frontend - 실시간 채팅 기능

**Goal**: Frontend에서 채팅 입력, 메시지 표시, 실시간 업데이트

### FE User Story 2 Implementation
- [ ] T077 [P] [US2] Message 엔티티 모델 생성 in chat-fe-with-claude/src/entities/message/
- [ ] T078 [P] [US2] 채팅 입력 위젯 구현 in chat-fe-with-claude/src/widgets/chat-input/
- [ ] T079 [US2] 메시지 전송 기능 구현 in chat-fe-with-claude/src/features/chat/send-message/
- [ ] T080 [US2] 메시지 목록 표시 위젯 구현 in chat-fe-with-claude/src/widgets/message-list/
- [ ] T081 [US2] 채팅방 페이지에 채팅 기능 통합 in chat-fe-with-claude/src/pages/chat-room/

### FE US2 검증
- [ ] T082 [US2] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US2 완료 - 실시간 채팅 기능 완성

---

## Phase 8-BE: User Story 6 Backend - 채팅방 자동 삭제 시스템

**Goal**: Backend에서 연결 해제 감지, 30초 타임아웃, 빈 방 자동 삭제

### BE User Story 6 Implementation
- [ ] T083 [P] [US6] 연결 해제 감지 및 정리 기능 추가 in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T084 [US6] 빈 방 자동 삭제 기능 구현 in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T085 [US6] 30초 연결 해제 감지 시스템 구현 in chat-be-with-claude/src/modules/chat/chat.service.ts

### BE US6 검증
- [ ] T086 [US6] Backend 검증 실행 (typecheck, lint, test, build) in chat-be-with-claude/

**Checkpoint**: BE US6 완료 - 자동 방 삭제 시스템 구현

---

## Phase 8-FE: User Story 6 Frontend - 채팅방 자동 삭제 시스템

**Goal**: Frontend에서 방 나가기, 연결 상태 모니터링, 방 삭제 알림

### FE User Story 6 Implementation
- [ ] T087 [P] [US6] 방 나가기 기능 구현 in chat-fe-with-claude/src/features/chat/leave-room/
- [ ] T088 [US6] 채팅방에서 나가기 버튼 추가 in chat-fe-with-claude/src/pages/chat-room/
- [ ] T089 [US6] 연결 상태 모니터링 훅 구현 in chat-fe-with-claude/src/shared/hooks/useConnectionStatus.ts

### FE US6 검증
- [ ] T090 [US6] Frontend 검증 실행 (typecheck, lint, test, build) in chat-fe-with-claude/

**Checkpoint**: FE US6 완료 - 방 나가기 및 자동 삭제 알림

---

## Phase 9: 통합 최종 점검 (Polish)

**Purpose**: 전체 시스템 통합 및 마무리 작업

### 전체 시스템 점검
- [ ] T091 [P] 에러 처리 및 로딩 상태 개선 in chat-fe-with-claude/src/shared/ui/
- [ ] T092 [P] 전체 시스템 통합 테스트 실행
- [ ] T093 [P] 성능 최적화 및 메모리 사용량 검증
- [ ] T094 [P] README.md 및 문서 업데이트 in chat-fe-with-claude/, chat-be-with-claude/

**Checkpoint**: 전체 시스템 완성 - 배포 준비 완료

---

## Dependencies & Execution Order

### Phase Dependencies (FE/BE 독립 구조)

- **Phase 1**: 즉시 시작 가능
- **Phase 2-BE**: Phase 1 완료 후 시작 (타입 소스 생성)
- **Phase 2-FE**: Phase 2-BE 완료 후 시작 (타입 생성 의존)
- **Phase 3+ BE/FE**: 각각 독립적으로 진행 가능, 사용자 스토리 순서 권장

### User Story Dependencies (권장 순서)

1. **US1** (P1): 사용자 입장 - 모든 기능의 기초
2. **US3** (P2): 방 목록 - 방 시스템의 기초
3. **US4** (P2): 방 생성 - US3 완료 후
4. **US5** (P2): 방 참여 - US4 완료 후
5. **US2** (P1): 채팅 기능 - US5 완료 후 (방 참여 필요)
6. **US6** (P3): 자동 삭제 - US2 완료 후 (전체 플로우 필요)

### Parallel Opportunities (완전 독립 FE/BE)

#### 같은 User Story 내 FE/BE 병렬
```bash
# User Story 1 병렬 예시:
Backend: T027-T033 (BE US1 태스크들)
Frontend: T034-T040 (FE US1 태스크들)
→ 동시 작업 후 통합 테스트
```

#### Phase 내 [P] 태스크들
```bash
# Setup Phase 병렬:
T002 Backend 프로젝트 생성
T003 Frontend 프로젝트 생성

# Backend 기초 병렬:
T004, T005, T006 의존성 및 설정
T007, T008, T009 구조 및 필터
T010, T011, T012, T013 저장소 및 스키마

# Frontend 기초 병렬:
T015, T016, T017 의존성 및 도구
T018, T019, T020 설정들
T021, T022, T023 구조 및 프로바이더
T024, T025 타입 생성 스크립트
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. **Phase 1**: 프로젝트 설정
2. **Phase 2-BE**: Backend 기초 (타입 소스)
3. **Phase 2-FE**: Frontend 기초 (타입 시스템)
4. **Phase 3**: US1 완료 (닉네임 + 로비)
5. **Phase 7**: US2 완료 (실시간 채팅)
6. **MVP 검증**: 기본 채팅 앱으로 데모 가능

### Full Feature Incremental

1. **Foundation** → 타입 생성 시스템
2. **+ US1** → 사용자 입장 (MVP 기초)
3. **+ US3** → 방 목록 조회 (방 시스템 기초)
4. **+ US4** → 방 생성 (능동적 참여)
5. **+ US5** → 방 참여 (소셜 기능)
6. **+ US2** → 실시간 채팅 (핵심 완성)
7. **+ US6** → 자동 삭제 (시스템 완성)

### Parallel Team Strategy

**2명 팀 (Backend 1명 + Frontend 1명)**:
- Setup 함께 진행
- Backend 개발자: 모든 BE 태스크 순차 진행
- Frontend 개발자: 타입 생성 후 모든 FE 태스크 순차 진행
- 주기적 통합 및 검증

**더 큰 팀**:
- Backend 팀: BE 태스크들을 User Story별 병렬 작업
- Frontend 팀: FE 태스크들을 User Story별 병렬 작업
- DevOps: 통합, 테스팅, 배포 지원

---

## Summary

**총 태스크 수**: 94개
- **Backend 전용**: 47개 태스크 (독립적)
- **Frontend 전용**: 43개 태스크 (독립적)
- **공통/통합**: 4개 태스크

**핵심 특징**:
- ✅ **FE/BE 완전 독립**: chat-fe-with-claude/와 chat-be-with-claude/ 각각 독립 개발 가능
- ✅ **커밋 단위 그룹화**: 각 태스크 = 1개 커밋으로 세분화
- ✅ **Backend-First 타입 생성**: BE에서 타입 소스 생성 → FE에서 자동 생성
- ✅ **사용자 스토리 기반**: 각 US별로 독립 완성 및 테스트 가능
- ✅ **병렬 개발 최적화**: [P] 태스크들과 FE/BE 분리로 최대 병렬성 확보

**병렬 개발 기회**:
- Phase 1: 3개 태스크 중 2개 병렬
- Phase 2-BE: 11개 태스크 중 9개 병렬 가능
- Phase 2-FE: 12개 태스크 중 9개 병렬 가능
- 각 User Story: BE와 FE 완전 병렬 진행 가능