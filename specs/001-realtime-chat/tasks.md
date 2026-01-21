# Tasks: 실시간 채팅 앱

**Input**: Design documents from `/specs/001-realtime-chat/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: 실험용 프로젝트로 테스트는 기본적인 단위 테스트만 포함합니다. TDD 방식을 적용하되 전체 커버리지보다는 핵심 로직에 집중합니다.

**Organization**: Frontend와 Backend를 명확히 분리하여 각각 독립적으로 커밋 가능한 태스크로 구성합니다. 각 태스크는 완료 즉시 커밋할 수 있도록 그룹화되었습니다.

**Constitution Requirements**: All tasks must follow the constitution v2.1.0:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- Frontend: spec-kit-lab/chat-fe-with-claude/ 구조 따름
- Backend: spec-kit-lab/chat-be-with-claude/ 구조 따름
- Backend-First 타입 생성 방식 적용

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 소속된 사용자 스토리 (US1, US2, US3, etc.)
- 파일 경로를 명시적으로 포함

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 초기화 및 기본 구조 생성

- [ ] T001 Create workspace structure per implementation plan (chat-fe-with-claude/, chat-be-with-claude/)
- [ ] T002 [P] Initialize Backend NestJS project in chat-be-with-claude/ with Socket.IO dependencies
- [ ] T003 [P] Initialize Frontend React+Vite project in chat-fe-with-claude/ with TypeScript
- [ ] T004 [P] Configure Backend CORS, Swagger, and basic middleware in chat-be-with-claude/src/main.ts
- [ ] T005 [P] Configure Frontend Vite proxy settings in chat-fe-with-claude/vite.config.ts
- [ ] T006 [P] Setup Backend linting and formatting in chat-be-with-claude/
- [ ] T007 [P] Setup Frontend linting and formatting in chat-fe-with-claude/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend-First 타입 생성 시스템과 핵심 인프라 구축

**⚠️ CRITICAL**: 이 단계가 완료되어야만 사용자 스토리 구현이 가능합니다

### Backend Foundational (Type Source)

- [ ] T008 Create in-memory storage system in chat-be-with-claude/src/storage/memory-store.ts
- [ ] T009 [P] Create Socket.IO gateway structure in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T010 [P] Create backend data types and DTOs in chat-be-with-claude/src/modules/ (User, ChatRoom, Message DTOs)
- [ ] T011 [P] Setup Swagger OpenAPI schema generation in chat-be-with-claude/src/main.ts
- [ ] T012 Create type schema generation endpoint in chat-be-with-claude/src/modules/type-schema/
- [ ] T013 [P] Create global exception filters in chat-be-with-claude/src/common/filters/
- [ ] T014 [P] Setup Socket.IO CORS and connection handling in chat-be-with-claude/

### Frontend Foundational (Type Consumer)

- [ ] T015 [P] Setup Frontend FSD structure (app/, pages/, widgets/, features/, entities/, shared/)
- [ ] T016 [P] Configure TailwindCSS and base styling in chat-fe-with-claude/
- [ ] T017 [P] Create type generation scripts in chat-fe-with-claude/scripts/generate-types.js
- [ ] T018 Create Socket.IO client setup in chat-fe-with-claude/src/shared/lib/socket.ts
- [ ] T019 [P] Setup TanStack Query client in chat-fe-with-claude/src/app/providers/query-provider.tsx
- [ ] T020 [P] Setup Zustand stores structure in chat-fe-with-claude/src/shared/stores/

**Checkpoint**: Foundation ready - Backend types generated, Frontend can consume types

---

## Phase 3: User Story 1 - 사용자 로비 입장 및 닉네임 설정 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 앱에 접속하여 닉네임을 설정하고 로비에 입장할 수 있다

**Independent Test**: 사용자가 앱 접속 → 닉네임 입력/생략 → 로비 화면 도달까지 독립 검증 가능

### Backend Implementation for User Story 1

- [ ] T021 [US1] Implement User entity service in chat-be-with-claude/src/modules/users/users.service.ts
- [ ] T022 [US1] Create random nickname generation logic in chat-be-with-claude/src/modules/users/nickname-generator.ts
- [ ] T023 [US1] Implement user session management in chat-be-with-claude/src/modules/users/users.service.ts
- [ ] T024 [US1] Create Socket.IO join-lobby event handler in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T025 [US1] Add user validation DTOs in chat-be-with-claude/src/modules/users/dto/

### Frontend Implementation for User Story 1

- [ ] T026 [P] [US1] Create User entity in chat-fe-with-claude/src/entities/user/
- [ ] T027 [P] [US1] Create session management store in chat-fe-with-claude/src/entities/user/model/session-store.ts
- [ ] T028 [US1] Create nickname setup feature in chat-fe-with-claude/src/features/users/nickname-setup/
- [ ] T029 [US1] Create nickname setup page in chat-fe-with-claude/src/pages/nickname-setup/
- [ ] T030 [US1] Create lobby page structure in chat-fe-with-claude/src/pages/lobby/
- [ ] T031 [US1] Implement Socket.IO connection hooks in chat-fe-with-claude/src/shared/hooks/use-socket.ts
- [ ] T032 [US1] Connect nickname setup with backend in chat-fe-with-claude/src/features/users/nickname-setup/

### Integration & Quality for User Story 1

- [ ] T033 [US1] Test Backend user creation and nickname generation
- [ ] T034 [US1] Test Frontend nickname setup flow end-to-end
- [ ] T035 [US1] Verify session storage and Socket.IO connection

**Checkpoint**: US1 완료 - 사용자가 닉네임 설정하고 로비에 입장 가능

---

## Phase 4: User Story 2 - 실시간 채팅 기능 (Priority: P1)

**Goal**: 채팅방 내에서 사용자들이 실시간으로 메시지를 주고받을 수 있다

**Independent Test**: 사용자가 메시지 입력 → 전송 → 다른 사용자에게 실시간 표시 확인

### Backend Implementation for User Story 2

- [ ] T036 [US2] Create Message entity service in chat-be-with-claude/src/modules/chat/chat.service.ts
- [ ] T037 [US2] Implement send-message Socket.IO event handler in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T038 [US2] Create message broadcasting logic in chat-be-with-claude/src/modules/chat/chat.service.ts
- [ ] T039 [US2] Add message validation and DTOs in chat-be-with-claude/src/modules/chat/dto/
- [ ] T040 [US2] Implement system messages (user join/leave) in chat-be-with-claude/src/modules/chat/chat.service.ts

### Frontend Implementation for User Story 2

- [ ] T041 [P] [US2] Create Message entity in chat-fe-with-claude/src/entities/message/
- [ ] T042 [P] [US2] Create chat input feature in chat-fe-with-claude/src/widgets/chat-input/
- [ ] T043 [US2] Create message display components in chat-fe-with-claude/src/entities/message/ui/
- [ ] T044 [US2] Create chat room page structure in chat-fe-with-claude/src/pages/chat-room/
- [ ] T045 [US2] Implement real-time message hooks in chat-fe-with-claude/src/features/chat/send-message/
- [ ] T046 [US2] Connect message sending with backend Socket.IO in chat-fe-with-claude/src/features/chat/
- [ ] T047 [US2] Implement message receiving and display logic in chat-fe-with-claude/src/pages/chat-room/

### Integration & Quality for User Story 2

- [ ] T048 [US2] Test Backend message creation and broadcasting
- [ ] T049 [US2] Test Frontend message sending and receiving flow
- [ ] T050 [US2] Verify real-time message synchronization

**Checkpoint**: US2 완료 - 채팅방에서 실시간 메시지 주고받기 가능

---

## Phase 5: User Story 3 - 채팅방 목록 조회 및 관리 (Priority: P2)

**Goal**: 로비에서 활성 채팅방 목록을 확인하고 참여자 정보를 파악할 수 있다

**Independent Test**: 로비에서 방 목록 표시, 인원수 표시, 빈 방 자동 삭제 확인

### Backend Implementation for User Story 3

- [ ] T051 [US3] Create ChatRoom entity service in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T052 [US3] Implement room list API in chat-be-with-claude/src/modules/rooms/rooms.controller.ts
- [ ] T053 [US3] Create room auto-cleanup logic in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T054 [US3] Implement room status updates in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T055 [US3] Add room management DTOs in chat-be-with-claude/src/modules/rooms/dto/

### Frontend Implementation for User Story 3

- [ ] T056 [P] [US3] Create ChatRoom entity in chat-fe-with-claude/src/entities/chat-room/
- [ ] T057 [P] [US3] Create room list widget in chat-fe-with-claude/src/widgets/room-list/
- [ ] T058 [US3] Implement room list feature in chat-fe-with-claude/src/features/rooms/room-list/
- [ ] T059 [US3] Connect room list with backend API in chat-fe-with-claude/src/entities/chat-room/api/
- [ ] T060 [US3] Update lobby page with room list in chat-fe-with-claude/src/pages/lobby/
- [ ] T061 [US3] Implement real-time room updates in chat-fe-with-claude/src/features/rooms/room-list/

### Integration & Quality for User Story 3

- [ ] T062 [US3] Test Backend room creation and management
- [ ] T063 [US3] Test Frontend room list display and updates
- [ ] T064 [US3] Verify room auto-cleanup functionality

**Checkpoint**: US3 완료 - 로비에서 채팅방 목록 조회 및 관리 가능

---

## Phase 6: User Story 4 - 새로운 채팅방 생성 (Priority: P2)

**Goal**: 사용자가 로비에서 새로운 채팅방을 생성하고 자동으로 입장할 수 있다

**Independent Test**: "새 방 만들기" 클릭 → 방 생성 → 해당 방 자동 입장 확인

### Backend Implementation for User Story 4

- [ ] T065 [US4] Implement create-room Socket.IO event in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T066 [US4] Add room creation logic in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T067 [US4] Implement automatic room joining on creation in chat-be-with-claude/src/modules/chat/chat.service.ts
- [ ] T068 [US4] Add room broadcast updates in chat-be-with-claude/src/modules/chat/chat.gateway.ts

### Frontend Implementation for User Story 4

- [ ] T069 [P] [US4] Create room creation feature in chat-fe-with-claude/src/features/rooms/create-room/
- [ ] T070 [US4] Add create room button to lobby in chat-fe-with-claude/src/pages/lobby/
- [ ] T071 [US4] Connect room creation with Socket.IO in chat-fe-with-claude/src/features/rooms/create-room/
- [ ] T072 [US4] Implement automatic room joining after creation in chat-fe-with-claude/src/features/rooms/create-room/

### Integration & Quality for User Story 4

- [ ] T073 [US4] Test Backend room creation and auto-join
- [ ] T074 [US4] Test Frontend room creation flow
- [ ] T075 [US4] Verify room appears in lobby list for other users

**Checkpoint**: US4 완료 - 새 채팅방 생성 및 자동 입장 가능

---

## Phase 7: User Story 5 - 기존 채팅방 참여 (Priority: P2)

**Goal**: 로비의 방 목록에서 원하는 채팅방을 선택하여 참여할 수 있다

**Independent Test**: 방 목록에서 방 클릭 → 해당 방 입장 → 기존 대화 내용 확인

### Backend Implementation for User Story 5

- [ ] T076 [US5] Implement join-room Socket.IO event in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T077 [US5] Add room capacity validation in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T078 [US5] Implement user join notifications in chat-be-with-claude/src/modules/chat/chat.service.ts
- [ ] T079 [US5] Add room participant management in chat-be-with-claude/src/modules/rooms/rooms.service.ts

### Frontend Implementation for User Story 5

- [ ] T080 [P] [US5] Create room joining feature in chat-fe-with-claude/src/features/chat/join-room/
- [ ] T081 [US5] Add click handlers to room list items in chat-fe-with-claude/src/widgets/room-list/
- [ ] T082 [US5] Implement room joining logic in chat-fe-with-claude/src/features/chat/join-room/
- [ ] T083 [US5] Handle room full scenarios in chat-fe-with-claude/src/features/chat/join-room/

### Integration & Quality for User Story 5

- [ ] T084 [US5] Test Backend room joining and capacity limits
- [ ] T085 [US5] Test Frontend room joining flow
- [ ] T086 [US5] Verify existing chat history display

**Checkpoint**: US5 완료 - 기존 채팅방 참여 기능 완성

---

## Phase 8: User Story 6 - 채팅방 자동 삭제 시스템 (Priority: P3)

**Goal**: 모든 참여자가 나간 채팅방을 자동으로 삭제하여 시스템 효율성 확보

**Independent Test**: 방의 마지막 사용자 나가기 → 방 자동 삭제 → 로비 목록에서 제거 확인

### Backend Implementation for User Story 6

- [ ] T087 [US6] Implement user disconnect handling in chat-be-with-claude/src/modules/chat/chat.gateway.ts
- [ ] T088 [US6] Add 30-second timeout detection in chat-be-with-claude/src/modules/users/users.service.ts
- [ ] T089 [US6] Create empty room cleanup logic in chat-be-with-claude/src/modules/rooms/rooms.service.ts
- [ ] T090 [US6] Implement leave-room event handling in chat-be-with-claude/src/modules/chat/chat.gateway.ts

### Frontend Implementation for User Story 6

- [ ] T091 [P] [US6] Create leave room feature in chat-fe-with-claude/src/features/chat/leave-room/
- [ ] T092 [US6] Add leave room button to chat page in chat-fe-with-claude/src/pages/chat-room/
- [ ] T093 [US6] Implement connection status monitoring in chat-fe-with-claude/src/shared/hooks/use-socket.ts
- [ ] T094 [US6] Handle automatic room cleanup updates in chat-fe-with-claude/src/features/rooms/room-list/

### Integration & Quality for User Story 6

- [ ] T095 [US6] Test Backend automatic user removal and room cleanup
- [ ] T096 [US6] Test Frontend leave room functionality
- [ ] T097 [US6] Verify room deletion notifications to other users

**Checkpoint**: US6 완료 - 자동 방 삭제 시스템 작동

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 사용자 경험 개선 및 시스템 안정성 확보

### Error Handling & UX

- [ ] T098 [P] Add error boundaries in chat-fe-with-claude/src/app/
- [ ] T099 [P] Implement loading states for all async operations in chat-fe-with-claude/
- [ ] T100 [P] Add connection status indicators in chat-fe-with-claude/src/shared/ui/
- [ ] T101 [P] Implement message send failure retry in chat-fe-with-claude/src/features/chat/

### Basic Testing

- [ ] T102 [P] Backend unit tests for critical services in chat-be-with-claude/src/modules/*/tests/
- [ ] T103 [P] Frontend component tests for key features in chat-fe-with-claude/src/features/*/
- [ ] T104 Basic E2E test for complete user flow in chat-fe-with-claude/tests/e2e/

### Final Integration

- [ ] T105 Run Backend verification (typecheck, lint, test, build) in chat-be-with-claude/
- [ ] T106 Run Frontend verification (typecheck, lint, test, build) in chat-fe-with-claude/
- [ ] T107 Validate quickstart.md instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 - 모든 사용자 스토리 차단
- **User Stories (Phase 3-8)**: Foundational 완료 후 병렬 또는 순차 진행 가능
- **Polish (Phase 9)**: 원하는 사용자 스토리 완료 후

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 후 독립 실행 가능
- **User Story 2 (P1)**: User Story 1 완료 후 (닉네임 설정된 사용자 필요)
- **User Story 3 (P2)**: Foundational 후 독립 실행 가능
- **User Story 4 (P2)**: User Story 3 완료 후 (방 목록 시스템 필요)
- **User Story 5 (P2)**: User Story 3, 4 완료 후 (방 생성/목록 필요)
- **User Story 6 (P3)**: User Story 5 완료 후 (방 참여/나가기 필요)

### Parallel Opportunities

#### Setup Phase (모든 [P] 태스크)
```bash
# 병렬 실행 가능:
T002 Backend 초기화
T003 Frontend 초기화
T004 Backend CORS 설정
T005 Frontend 프록시 설정
T006 Backend 린팅
T007 Frontend 린팅
```

#### Foundational Phase (일부 [P] 태스크)
```bash
# Backend 기반 완성 후 Frontend 병렬:
T009 Socket.IO 게이트웨이
T010 Backend 데이터 타입
T013 예외 필터

# 그 후:
T015 Frontend 구조
T016 TailwindCSS
T019 Query 클라이언트
T020 Zustand 스토어
```

#### User Story 내부 병렬화
각 사용자 스토리 내에서 [P] 태스크들은 병렬 실행 가능

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (닉네임 설정)
4. Complete Phase 4: User Story 2 (채팅 기능)
5. **MVP 완성**: 기본 채팅 앱으로 검증/데모 가능

### Incremental Delivery

1. **Foundation** → 타입 생성 시스템 작동
2. **+ US1** → 사용자 입장 가능 (MVP)
3. **+ US2** → 실시간 채팅 가능 (핵심 기능)
4. **+ US3** → 방 목록 조회 (사용성 향상)
5. **+ US4** → 방 생성 (완전한 기능)
6. **+ US5** → 방 참여 (소셜 기능)
7. **+ US6** → 자동 정리 (시스템 안정성)

### Parallel Team Strategy (2명 팀 기준)

**Developer A (Backend 전담)**:
- T008-T014: Backend Foundational
- T021-T025: US1 Backend
- T036-T040: US2 Backend
- 이후 순차적으로 Backend 태스크 담당

**Developer B (Frontend 전담)**:
- T015-T020: Frontend Foundational (A의 타입 생성 후)
- T026-T032: US1 Frontend
- T041-T047: US2 Frontend
- 이후 순차적으로 Frontend 태스크 담당

---

## Notes

- **[P] 태스크**: 다른 파일, 의존성 없음으로 병렬 실행 가능
- **[Story] 라벨**: 특정 사용자 스토리 추적용 매핑
- **Backend-First**: 각 스토리에서 Backend 먼저 완성 후 Frontend 진행
- **커밋 단위**: 각 태스크 완료 즉시 커밸트 (One Task = One Commit)
- **검증**: 각 체크포인트에서 스토리 독립 테스트 수행
- **실험용 단순화**: 복잡한 테스트나 보안 기능은 최소화