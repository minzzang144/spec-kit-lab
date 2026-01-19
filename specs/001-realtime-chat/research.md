# Research: 001-realtime-chat

**Branch**: `001-realtime-chat`  
**Date**: 2025-01-27

Phase 0 산출물. Technical Context의 확정 사항 및 기술 선택 근거를 정리한다.

---

## 1. NestJS + Socket.IO (실시간 채팅)

**Decision**: `@nestjs/websockets`, `@nestjs/platform-socket.io`를 사용해 NestJS에서 Socket.IO Gateway를 구현한다. 방(room) 단위 브로드캐스트는 `socket.join(roomId)`, `server.to(roomId).emit(...)` 패턴을 사용한다.

**Rationale**:

- Nest 공식: Socket.IO용 `@nestjs/platform-socket.io`를 쓰면 Gateway가 HTTP와 동일 포트에서 WebSocket을 제공하며, 의존성 주입·가드·파이프를 그대로 사용 가능.
- `@WebSocketGateway({ cors: true })`로 CORS를 열고, `@SubscribeMessage('event')`로 클라이언트 이벤트를 처리.
- `socket.join(roomId)` / `socket.leave(roomId)`로 방 참가·퇴장을 표현하고, `this.server.to(roomId).emit('message', payload)`로 방 단위 브로드캐스트.
- 실험용이므로 네임스페이스 분리·Redis adapter는 사용하지 않고, 단일 Gateway·단일 인스턴스로 충분.

**Alternatives considered**:

- `ws` 어댑터: Socket.IO 대비 재연결·폴백이 없어 클라이언트 복원력이 낮음. 채팅에서는 Socket.IO 선택.
- Redis Adapter: 다중 인스턴스·세로 확장 시 필요. 현재 스펙은 단일 인스턴스·실험용이므로 제외.

**Ref**: [NestJS WebSockets / Gateways](https://docs.nestjs.com/websockets/gateways), [Socket.IO Rooms](https://socket.io/docs/v4/rooms)

---

## 2. pnpm + Turborepo 모노레포

**Decision**: 루트에 `pnpm-workspace.yaml`(`packages: ["apps/*"]`만), `turbo.json`으로 `build`/`lint`/`dev`/`test` 파이프라인을 정의한다. **packages/는 두지 않고** FE·BE만 `apps/chat-fe`, `apps/chat-be`에 둔다. 상수·이벤트명·타입은 각 앱에 두고, **contracts·data-model을 기준으로 동일하게 유지**한다.

**Rationale**:

- `packages: ["apps/*"]`만으로 pnpm 워크스페이스 구성. `workspace:*` 등 공용 패키지 의존성 없음.
- `turbo.json`의 `build`는 앱별 독립( `^build` 제거 또는 앱만 포함). `dev`는 `cache: false`, `persistent: true`.
- Prettier·ESLint는 **루트 공통 설정**을 앱이 상속. 상수·이벤트명은 **각 앱이 동일한 값**을 보관하고, `contracts/`, `data-model.md`가 단일 기준.

**Alternatives considered**:

- Yarn/npm workspaces: pnpm이 디스크·설치 속도 면에서 유리하고, 사용자 스펙에 pnpm 명시.
- Nx: Turborepo만으로 태스크·캐시가 충분하고, 설정이 더 단순해 Turborepo 선택.

**Ref**: [Turborepo – Structuring a repository](https://turbo.build/repo/docs/guides/structuring-a-repository), [pnpm workspaces](https://pnpm.io/workspaces)

---

## 3. 메시지 최대 길이 및 빈 메시지

**Decision**: **최대 길이 2000자(UTF-16 코드 유닛 기준)**. 빈 문자열·공백만 있는 메시지는 전송 불가(백엔드·프론트엔드 모두 검사).

**Rationale**:

- 스펙: “메시지 최대 길이·형식은 별도 제약 없이 텍스트 최대 길이 정도만 전제. 구체 수치는 기획/구현 단계에서 정한다.”
- 2000자: 일반 채팅·SNS보다 짧고, 실험·도배 방지에 적당. **각 앱(FE: `shared/config` 또는 `lib/constants`, BE: `common/constants`)에 `MESSAGE_MAX_LENGTH = 2000`을 동일하게 정의.** `data-model.md` §4·contracts를 기준으로 통일.
- 빈 메시지: `text`가 `undefined`/`null`이거나 `String(text).trim().length === 0`이면 400·에러 이벤트로 거절. FR-009 충족.

**Alternatives considered**:

- 10000자: 실험용에는 과하고, 향후 필요 시 상수만 변경하면 됨.
- 정규식 기반 포맷 제한: 스펙에서 이모지·첨부 등 고급 형식은 범위 외이므로, 길이와 trim만 검사.

---

## 4. 랜덤 닉네임 형식

**Decision**: `"User-" + crypto.randomUUID().slice(0, 8)` 형태(예: `User-a1b2c3d4`). 중복 허용, 필요 시 접미사(예: 기존과 겹치면 `-2`)를 붙여 구분 가능하게 한다.

**Rationale**:

- 스펙: “닉네임 없이 진행 시 랜덤 닉네임”, “겹침 허용, 필요 시 숫자 등으로 구분”.
- `crypto.randomUUID()`: Node·브라우저 내장, 별도 패키지 없음. 8자로 짧고 읽기 쉬움.
- 같은 방 내에서만 “구분 가능”이면 되므로, 우선 `User-xxxxxxxx` 부여하고, 같은 방에 동일 닉이 있으면 `User-xxxxxxxx-2` 등으로 뒤에 붙이는 전략으로 구현. (구체 전략은 `chat.store`·닉네임 부여 로직에서 결정.)

**Alternatives considered**:

- `faker`/`@faker-js/faker`: 의존성 추가. 실험용에는 UUID 8자로 충분.
- “Guest 1, 2, 3…”: 전역 카운터 필요·다중 탭 이슈. UUID 기반이 더 단순.

---

## 5. 채팅방 시스템 부여 이름

**Decision**: `"Room-" + nanoid(8)` 또는 `crypto.randomUUID().slice(0, 8)`(예: `Room-a1b2c3d4`). 목록·입장 화면에는 이 ID를 그대로 표기한다. “대화방 1”처럼 순번을 쓰지 않는다.

**Rationale**:

- 스펙: “시스템이 부여한 이름 또는 코드(예: 대화방 1, Room-xyz)로만 구분. 사용자 입력 없음.”
- “대화방 1”은 서버 재시작·순서 변경 시 의미가 달라질 수 있음. `Room-{id}` 형태가 고유하고, URL·클라이언트 라우팅(`/room/:id`)과 맞추기 좋음.
- `nanoid`는 짧고 URL-safe. 의존성 최소화를 원하면 `crypto.randomUUID().slice(0, 8)`로 통일해도 됨. (구현 시 하나로 통일.)

**Alternatives considered**:

- “대화방 1, 2, 3”: 전역 카운터·영속화 이슈. 실험용 in-memory에서는 ID가 더 단순.
- “Channel-#xxx”: 네이밍만 다를 뿐, ID 기반과 동일. `Room-` 접두사가 의도가 더 분명.

---

## 6. FE 스택 보조 선택 (이미 스펙에 포함된 항목 정리)

| 항목 | 결정 | 비고 |
|------|------|------|
| Vite + React + TS | 사용 | CRA 대비 빠른 HMR·빌드. |
| Socket.IO client | `socket.io-client` | Nest `@nestjs/platform-socket.io`와 버전 호환 유지. |
| TanStack Query | 방 목록 `GET /rooms` 등 REST 캐시·리페치. Socket 이벤트 수신 시 `queryClient.invalidateQueries(['rooms'])`로 목록 갱신. | |
| React Hook Form | 닉네임 입력, 메시지 입력(필요 시). | 폼 규모가 작아 Zod 등 스키마는 선택. |
| Tailwind + shadcn/ui | 공통 스타일·버튼·인풋·리스트 등. | FSD `shared/ui`에 shadcn 컴포넌트. |
| Vitest | FE 단위·컴포넌트 테스트. | |
| Playwright | E2E: 메인→닉네임→방 생성→메시지 송수신→나가기. | |

---

## 7. BE 스택 보조 선택

| 항목 | 결정 | 비고 |
|------|------|------|
| NestJS | `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/websockets`, `@nestjs/platform-socket.io` | HTTP: `RoomsController`(GET/POST), WS: `ChatGateway`. |
| In-memory Store | `ChatStore`(또는 `chat.store.ts`)에 `Map<roomId, Room>`, `Map<roomId, Message[]>`, `Map<socketId, User>` 등. | 재시작 시 초기화. 실험용 전제. |
| CORS | `main.ts`에서 `app.enableCors({ origin: process.env.FE_ORIGIN || 'http://localhost:5173' })` 등. | Vite 기본 포트 5173. |

---

## 8. 공통: Prettier, ESLint

**Decision**: 루트에 `.prettierrc`, `.prettierignore`, `eslint.config.js`(또는 `.eslintrc.cjs`)를 두고, `turbo.json`에 `lint`·`format` 태스크를 정의. **`apps/chat-fe`, `apps/chat-be`는 루트 설정을 상속**하고, 앱별로 필요한 규칙만 override. (packages/ 없음.)

**Rationale**:

- **각각 설정, 루트로 통일**: 포맷·린트는 루트 한 곳에서 관리하고, 앱은 그걸 쓰면 됨. 품질 일관성 확보. Turborepo `lint`로 각 앱에서 `pnpm run lint` 실행·캐시.

---

## 9. NEEDS CLARIFICATION 해소 요약

- **Language/Version**: TypeScript 5.x (FE, BE) — 확정.
- **Primary Dependencies**: NestJS, Vite+React, Socket.IO, TanStack Query, React Hook Form, Tailwind, shadcn/ui — 확정.
- **Storage**: In-memory — 확정(DB/Redis 없음).
- **Testing**: Vitest, Playwright (FE), Jest (BE) — 확정.
- **Target Platform**: Web, Node.js — 확정.
- **Project Type**: web (monorepo) — 확정.
- **Performance Goals**: SC-001~004 — 스펙대로, 추가 연구 없음.
- **Constraints**: 실험용, rate limit·인증·DB 없음 — 확정.
- **Scale/Scope**: 단일 BE 인스턴스 — 확정.
