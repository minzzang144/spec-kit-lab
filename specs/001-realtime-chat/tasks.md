# Tasks: 001-realtime-chat

**Input**: Design documents from `specs/001-realtime-chat/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Git worktree 병렬 개발**: 태스크에 [FE]·[BE]를 표기해, FE 워크트리에서는 `apps/chat-fe-with-cursor` 위주, BE 워크트리에서는 `apps/chat-be-with-cursor` 위주로 병렬 진행할 수 있게 구성함.

**Tests**: 스펙·요청에 테스트가 없어 테스트 태스크는 포함하지 않음.

## Format: `[ID] [P?] [FE|BE] [Story?] Description`

- **[P]**: 동시 실행 가능 (다른 파일, 미완료 태스크에 대한 의존 없음)
- **[FE]**: 프론트엔드 전용 — `apps/chat-fe-with-cursor` 워크트리
- **[BE]**: 백엔드 전용 — `apps/chat-be-with-cursor` 워크트리
- **[Story]**: 유저 스토리 (US1, US2, US3)
- 설명에는 가능한 한 **구체적 파일 경로** 포함

## Path Conventions

- **모노레포**: 루트 `pnpm-workspace.yaml`, `turbo.json`, `package.json`
- **FE**: `apps/chat-fe-with-cursor/`
- **BE**: `apps/chat-be-with-cursor/`

---

## Phase 1: Setup (공용 인프라)

**목적**: 프로젝트 루트 및 FE/BE 앱 골격. 루트(T001, T004) 완료 후 [FE](T002)와 [BE](T003)는 **서로 다른 git worktree에서 동시에** 진행 가능.

- [x] T001 Create monorepo root: `pnpm-workspace.yaml` (`packages: ["apps/*"]`), `turbo.json` (build, dev, lint, format), root `package.json` (scripts)
- [x] T002 [P] [FE] Create `apps/chat-fe-with-cursor` skeleton: `package.json` (name: `chat-fe-with-cursor` for pnpm/turbo filter), `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `playwright.config.ts`, `src/` FSD folders (app, pages, widgets, features, entities, shared), shadcn/ui init in `apps/chat-fe-with-cursor/`
- [ ] T003 [P] [BE] Create `apps/chat-be-with-cursor` skeleton: `package.json` (name: `chat-be-with-cursor` for pnpm/turbo filter), `nest-cli.json`, `tsconfig.json`, `src/` (app.module.ts, main.ts, chat/, rooms/, common/) in `apps/chat-be-with-cursor/`
- [x] T004 [P] Create root `.prettierrc`, `.prettierignore`, `eslint.config.js` (or `.eslintrc.cjs`); apps는 루트 설정 상속

---

## Phase 2: Foundational (공통 전제)

**목적**: 모든 유저 스토리에 필요한 BE Store·REST·Socket 및 FE 클라이언트·라우팅. **[BE]와 [FE] 트랙을 각각의 worktree에서 병렬로 진행.**

**⚠️ BE**: T007 → T008, T009 → T010 순서. T005는 T007 이전에 [P]로 가능.  
**⚠️ FE**: T006, T011은 [P] 가능. T012는 T011 이후.

### [BE] 트랙

- [ ] T005 [P] [BE] Define `apps/chat-be-with-cursor/src/common/constants/index.ts`: MESSAGE_MAX_LENGTH(2000), NICKNAME_MAX_LENGTH(64), ROOM_ID_LENGTH(8), socket event names per `contracts/socket-events.md`
- [ ] T007 [BE] Implement `apps/chat-be-with-cursor/src/chat/chat.store.ts`: ChatStore with `rooms: Map<roomId, Room>`, `messages: Map<roomId, Message[]>`, `users: Map<socketId, User>` per data-model.md
- [ ] T008 [BE] Implement `apps/chat-be-with-cursor/src/rooms/rooms.service.ts` (createRoom, listRooms using Store), `rooms.controller.ts` (GET /rooms, POST /rooms), `rooms.module.ts`; register in `app.module.ts`
- [ ] T009 [BE] Configure `apps/chat-be-with-cursor/src/main.ts` (CORS with FE_ORIGIN), `app.module` with ChatModule; `apps/chat-be-with-cursor/src/chat/chat.gateway.ts`: connection (User `{ socketId, nickname: null, roomId: null }` in Store), disconnect (leave_room 로직 + User 제거)
- [ ] T010 [BE] Extend `apps/chat-be-with-cursor/src/chat/chat.gateway.ts`: set_nickname, join_room (Room 없으면 error, socket.join, participants 추가, room_joined with messages, user_joined broadcast), leave_room (participants 제거, 0명이면 room 삭제·room_deleted·room_list_updated broadcast)

### [FE] 트랙

- [x] T006 [P] [FE] Define `apps/chat-fe-with-cursor/src/shared/config/constants.ts` (and event names): MESSAGE_MAX_LENGTH, NICKNAME_MAX_LENGTH, socket event strings per `contracts/socket-events.md`, `data-model.md` §4
- [x] T011 [P] [FE] Implement `apps/chat-fe-with-cursor/src/shared/api/` (getRooms, createRoom with VITE_API_URL) and `apps/chat-fe-with-cursor/src/shared/lib/socket.ts` (or similar): Socket.IO connect(VITE_WS_URL), generic emit/on; event names from shared/config
- [x] T012 [FE] Implement `apps/chat-fe-with-cursor/src/app/`: QueryClient, Router; `pages/` placeholder for Main, Lobby, Room; routes `/`, `/lobby`, `/room/:id` in `apps/chat-fe-with-cursor/src/`

**Checkpoint**: BE는 GET/POST /rooms, Socket connection/disconnect/set_nickname/join_room/leave_room 동작. FE는 API·Socket 클라이언트와 라우팅 준비.

---

## Phase 3: User Story 1 - 메인 진입 및 닉네임 설정 (P1) 🎯 MVP

**목표**: 메인에서 닉네임 입력·또는 “닉네임 없이” 시 랜덤 부여 후, 채팅방 목록/생성 화면(/lobby)까지 진행.

**Independent Test**: 메인에서 닉네임 입력 후 /lobby 진행 가능, 닉네임 없이 진행 시 `User-xxxxxxxx` 형태 랜덤 부여 후 /lobby 진행 가능.

### Implementation ([FE] 전용)

- [x] T013 [P] [FE] [US1] Implement `apps/chat-fe-with-cursor/src/pages/main/` (or Main page): 닉네임 input, “닉네임 없이 진행” 시 `User-` + `crypto.randomUUID().slice(0,8)` 부여, nickname을 sessionStorage(또는 state)에 저장 후 `/lobby`로 이동
- [x] T014 [FE] [US1] Implement `apps/chat-fe-with-cursor/src/pages/lobby/`: mount 시 socket connect(미연결이면), set_nickname(sessionStorage nickname), getRooms(TanStack Query); 방 목록 표시, “방 만들기” 버튼(onClick placeholder·US2에서 연동)

**Checkpoint**: US1 단독으로 메인→닉네임 설정→/lobby·방 목록까지 확인 가능.

---

## Phase 4: User Story 2 - 채팅방 생성 및 입장 (P1)

**목표**: 새 방 생성·기존 방 입장, 방 내 나가기, 마지막 참가자 퇴장 시 방 삭제·목록 반영.

**Independent Test**: 방 생성 후 입장, 목록에서 입장, 나가기, 마지막 퇴장 시 방 삭제·목록에서 제거 확인.

### Implementation

- [x] T015 [P] [FE] [US2] Extend `apps/chat-fe-with-cursor/src/pages/lobby/`: “방 만들기” → createRoom(nickname) 후 join_room(roomId, nickname), `/room/:id` 이동; 목록 행 클릭 → join_room(roomId, nickname), `/room/:id` 이동 in `apps/chat-fe-with-cursor/`
- [x] T016 [FE] [US2] Implement `apps/chat-fe-with-cursor/src/pages/room/` (or Room page): leave 버튼(leave_room), on user_joined/user_left 표시, on room_deleted 시 `/lobby` 리다이렉트, on room_joined(messages)로 메시지 목록 표시, on room_list_updated 시 `queryClient.invalidateQueries(['rooms'])` in `apps/chat-fe-with-cursor/`

**Checkpoint**: US1+US2로 방 생성·입장·나가기·빈 방 삭제가 E2E로 동작.

---

## Phase 5: User Story 3 - 메시지 전송 및 수신 (P1)

**목표**: 방 안에서 메시지 전송·실시간 수신, 빈 메시지·최대 길이 거부, 전송 실패 시 알림·재전송.

**Independent Test**: 한 방에서 메시지 전송 후 다른 참가자에게 3초 이내 도착, 빈 메시지·2000자 초과 거부, 오류 시 재전송 가능.

### Implementation

- [ ] T017 [P] [BE] [US3] Extend `apps/chat-be-with-cursor/src/chat/chat.gateway.ts`: send_message 핸들러 — NOT_IN_ROOM·MESSAGE_INVALID(빈/2000초과) 검사, Message 생성 후 Store messages에 push, `io.to(roomId).emit('message', msg)` and ACK in `apps/chat-be-with-cursor/`
- [x] T018 [FE] [US3] Extend `apps/chat-fe-with-cursor/src/pages/room/` (or message feature): 메시지 입력, send_message emit, on('message') 수신·목록 추가, MESSAGE_MAX_LENGTH·trim 검사·빈 메시지 전송 불가, FR-010 오류 시 안내·재전송 UI in `apps/chat-fe-with-cursor/`

**Checkpoint**: US1~US3 완료 시 quickstart 기준 E2E(메인→닉네임→방 생성→메시지 송수신→나가기) 검증 가능.

---

## Phase 6: Polish & Cross-Cutting

**목적**: 공통 UI 정리, 문서·quickstart 검증.

- [ ] T019 [P] [FE] Apply shadcn/ui (Button, Input, 리스트 등) to Main, Lobby, Room in `apps/chat-fe-with-cursor/`
- [ ] T020 [P] Run `quickstart.md` 절차(build, dev, test) 검증; 필요 시 `README`·문서 보완 at repo root or `specs/001-realtime-chat/`

---

## Dependencies & Execution Order

### Phase 의존

- **Phase 1**: 선행 없음. T001, T004(루트) 후 T002 [FE], T003 [BE]를 **서로 다른 worktree에서 [P]로 진행** 가능.
- **Phase 2**: Phase 1 완료 후. [BE] T007→T008, T009→T010; [FE] T006·T011 [P] 후 T012.
- **Phase 3~5**: Phase 2 완료 후. US1→US2→US3 순서. US2·US3 내 [BE]와 [FE]는 **각 스토리 내에서 [P]로 병렬** 가능.
- **Phase 6**: Phase 3~5 원하는 범위 완료 후.

### Git Worktree 병렬 전략

- **worktree 1 (루트·공유)**: `T001`, `T004` 수행. 필요 시 `T002`까지 여기서 진행 가능.
- **worktree 2 [FE]**: `apps/chat-fe-with-cursor`만 수정. `T002`(또는 루트에서 완료 후) → `T006`, `T011`, `T012` → `T013`, `T014` → `T015`, `T016` → `T018`, `T019`. 루트 `package.json`/`turbo` 변경은 worktree 1과 조율.
- **worktree 3 [BE]**: `apps/chat-be-with-cursor`만 수정. `T003` → `T005`, `T007`, `T008`, `T009`, `T010` → `T017`.  
- **충돌 최소화**: 루트 설정·스크립트는 한 워크트리에서만 변경; FE/BE 디렉터리는 각 전용 워크트리에서만 편집.

### 스토리별 [BE]/[FE] 병렬

- **US1**: [FE]만 (T013, T014).
- **US2**: [FE] (T015, T016). [BE]는 Phase 2에서 이미 반영.
- **US3**: T017 [BE], T018 [FE] → **동시 진행 [P]**.

---

## Parallel Example (Git Worktree)

### Phase 1 이후

```bash
# worktree-fe (예: ../spec-kit-lab-fe)
git worktree add ../spec-kit-lab-fe 001-realtime-chat
cd ../spec-kit-lab-fe
# T002, T006, T011, T012, T013, T014, T015, T016, T018, T019

# worktree-be (예: ../spec-kit-lab-be)
git worktree add ../spec-kit-lab-be 001-realtime-chat
cd ../spec-kit-lab-be
# T003, T005, T007, T008, T009, T010, T017
```

### Phase 5 (US3) 병렬

- [BE] T017: `apps/chat-be-with-cursor/.../chat.gateway.ts` — send_message
- [FE] T018: `apps/chat-fe-with-cursor/.../room` — 메시지 입력·수신·검증·재전송

---

## Implementation Strategy

### MVP (US1만)

1. Phase 1 완료  
2. Phase 2 완료 (FE: API·Socket·라우팅; BE: Store·REST·Gateway)  
3. Phase 3 (US1) 완료  
4. **검증**: 메인→닉네임→/lobby·방 목록  
5. 필요 시 배포/데모

### 단계별 전달

1. Phase 1+2 → 기반 완료  
2. +US1 → 닉네임·로비 (MVP)  
3. +US2 → 방 생성·입장·나가기  
4. +US3 → 메시지 송수신  
5. +Polish → quickstart·문서

### Git Worktree + 병렬 팀

1. 한 명이 Phase 1(루트) 수행.  
2. Phase 2부터:  
   - **담당 FE**: worktree-fe에서 T002, T006, T011, T012  
   - **담당 BE**: worktree-be에서 T003, T005, T007, T008, T009, T010  
3. Phase 3: FE만 T013, T014.  
4. Phase 4: FE만 T015, T016.  
5. Phase 5: BE T017와 FE T018 **동시 진행**.  
6. Phase 6: FE T019, 공용 T020.

---

## Notes

- [P] = 다른 파일·독립 작업으로 동시 실행 가능.  
- [FE]/[BE] = git worktree 할당용.  
- [USn] = 유저 스토리 추적.  
- 상수·이벤트명: `data-model.md` §4, `contracts/socket-events.md`, `contracts/openapi.yaml` 기준으로 FE `shared/config`, BE `common/constants`에 **동일 값** 유지.  
- 루트(eslint, prettier, turbo) 변경은 한 워크트리에서만 수행해 머지 충돌을 줄일 것.
