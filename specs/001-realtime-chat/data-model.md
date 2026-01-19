# Data Model: 001-realtime-chat

**Branch**: `001-realtime-chat`  
**Date**: 2025-01-27

Phase 1 산출물. 스펙의 Key Entities와 요구사항을 반영한 **In-memory** 데이터 모델이다. DB·Redis 없음.

---

## 1. Entity 정의

### 1.1 User (유저)

채팅 참여 주체. **세션(소켓) 단위**로 유지된다. 인증·가입 없음.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `socketId` | `string` | O | Socket.IO `socket.id`. User의 논리적 PK. |
| `nickname` | `string` | O | 사용자 입력 또는 랜덤(`User-xxxxxxxx`). 빈 문자열 불가. |
| `roomId` | `string \| null` | - | 현재 입장한 방 ID. 없으면 `null`. 한 번에 한 방만. |

**생명주기**: 소켓 `connection` 시 생성, `disconnect` 시 제거. `roomId`는 `join_room` 시 설정, `leave_room`/`disconnect` 시 `null` 또는 제거.

**검증**:
- `nickname`: `trim` 후 길이 ≥ 1, 최대 길이는 스펙·research에 따라 별도 상수(예: 64) 가능. (스펙에 없는 경우 64로 충분.)

---

### 1.2 Room (룸)

채팅방. 시스템이 부여한 `id`(및 표시용 `name` = `Room-{id}`)로 구분.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | O | 고유 ID. `Room-` + 8자 랜덤. PK. |
| `name` | `string` | O | 목록 표시용. `Room-{id}` 또는 `id`와 동일. |
| `createdAt` | `Date` or `number` | O | 생성 시각(ISO 문자열 또는 ms). |
| `participants` | `Map<socketId, User>` or `User[]` | O | 현재 방에 있는 유저. 0명이 되면 **즉시 삭제**. |

**상태 전이**:
1. **created**: `POST /rooms` 또는 Gateway에서 생성. 생성자 1명 포함.
2. **active**: 참가자 ≥ 1. 입장/퇴장으로 참가자 집합만 변경.
3. **deleted**: 참가자 0명이 된 순간 Store에서 제거. `room_deleted` 이벤트로 로비 등에 브로드캐스트.

**검증**:
- `id`·`name`: 생성 시 중복 없음(Store에서 유일 보장).

---

### 1.3 Message (채팅/메시지)

Room 안에서 User가 보낸 메시지. 읽음 상태는 범위 외.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | O | 고유 ID. `nanoid()` 또는 `crypto.randomUUID().slice(0,12)`. |
| `roomId` | `string` | O | 소속 방 ID. |
| `senderId` | `string` | O | 보낸 유저의 `socketId`. |
| `senderNickname` | `string` | O | 전송 시점의 닉네임(표시용). |
| `text` | `string` | O | 본문. **빈 문자열·공백만 불가.** **최대 2000자.** |
| `createdAt` | `Date` or `number` | O | 전송 시각. |

**생명주기**: `send_message` 처리 시 생성 → `Room.messages`(또는 `Map<roomId, Message[]>`)에 추가 → 해당 방에 `message` 이벤트로 브로드캐스트. Room 삭제 시 메시지도 함께 제거(참조 제거).

**검증** (FR-009, research §3):
- `text`: `undefined`/`null` 불가. `String(text).trim().length` ≥ 1, ≤ `MESSAGE_MAX_LENGTH`(2000). 위반 시 400 또는 `error` 이벤트.

---

## 2. In-memory Store (ChatStore) 구조

BE 단일 인스턴스에서만 사용. 재시작 시 초기화.

```text
ChatStore (또는 chat.store.ts)
├── rooms:        Map<roomId, Room>
├── messages:     Map<roomId, Message[]>   // roomId별 메시지 목록(순서 유지)
└── users:        Map<socketId, User>      // 연결된 모든 유저(닉네임, roomId)
```

**로비(lobby)**: `roomId === null`인 유저들이 보는 “방 목록”은 `rooms`를 그대로 사용. 방 생성/삭제 시 `room_list_updated`를 “로비” 소켓들(또는 전역)에 보내서 TanStack Query `invalidateQueries(['rooms'])`를 트리거할 수 있음. (구현은 contracts·Gateway 설계에 맞춤.)

---

## 3. 관계

- **User ──(N:1)──> Room**  
  - `User.roomId`로 소속 방. 한 유저는 한 방에만.
- **Message ──(N:1)──> Room**  
  - `Message.roomId`. Room 삭제 시 해당 `Message[]` 제거.
- **Message ──(N:1)──> User**  
  - `senderId`로 발신자. 닉네임 변경을 반영하지 않으므로 `senderNickname` 스냅샷으로 충분.

---

## 4. 상수 (각 앱에 동일하게 정의, 이 문서·contracts 기준으로 통일)

**packages/ 없음.** FE는 `shared/config` 또는 `lib/constants`, BE는 `common/constants` 등에 아래 값을 **각각** 두고, 변경 시 두 앱 모두 수정.

| 이름 | 값 | 용도 |
|------|-----|------|
| `MESSAGE_MAX_LENGTH` | `2000` | 메시지 본문 최대 길이. |
| `NICKNAME_MAX_LENGTH` | `64` | (선택) 닉네임 최대. 스펙에 없으면 64 권장. |
| `ROOM_ID_LENGTH` | `8` | `Room-` 접두사 뒤 ID 길이. |

소켓 이벤트명(`join_room`, `send_message`, `message` 등)은 `contracts/socket-events.md`를 기준으로 FE/BE 각각 문자열 상수로 정의.

---

## 5. 상태 전이 다이어그램 (Room)

```text
[created] ──participants≥1──> [active]
                ^                    |
                |                    v
                └── participants=0 ──┘ [deleted] (Store에서 제거, room_deleted 브로드캐스트)
```

---

## 6. 인덱스·쿼리 (In-memory)

- **방 목록**: `Array.from(rooms.values())` 또는 `Map` 순회. `GET /rooms`에서 반환.
- **방별 메시지**: `messages.get(roomId)` 또는 `Room.messages`. `join_room` 시 입장 응답에 히스토리로 전달.
- **유저의 현재 방**: `users.get(socketId)?.roomId`.

DB 미사용으로 인덱스·마이그레이션 없음.
