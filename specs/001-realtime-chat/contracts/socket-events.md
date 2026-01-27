# Socket.IO Events Contract

**Branch**: `001-realtime-chat`  
**Namespace**: 기본 `/` (단일 Gateway).

**통일**: 이벤트명·페이로드·에러 코드는 **이 문서를 기준**으로 FE/BE 각각 구현. 공용 패키지 없이, FE(`shared/config` 등)·BE(`common/constants` 등)에 동일한 문자열·타입을 두고 유지.

---

## 1. 연결 및 공통

- **connect**: 클라이언트 연결 시. 서버는 `connection`에서 `users`에 `{ socketId, nickname, roomId: null }` 등록. `nickname`은 **핸드셰이크 auth 또는 첫 `join_room`/`set_nickname`에서 받을 수 있음.** (선택: `set_nickname` 이벤트로 닉네임만 먼저 설정.)
- **disconnect**: 퇴장과 동일. `roomId`가 있으면 `leave_room` 로직 실행 → 참가자 0이면 방 삭제, `room_deleted` 브로드캐스트.

---

## 2. 클라이언트 → 서버 (emit)

### `set_nickname`

연결 후 닉네임만 설정. (메인에서 “닉네임 없이 진행”이면 서버가 랜덤 부여 후 이 이벤트 불필요.)

| Payload | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `nickname` | `string` | O | `trim` 후 1~64자. |

**서버 동작**: `users.get(socketId).nickname = payload.nickname`. ACK 또는 `nickname_set` 수신.

---

### `join_room`

기존 방 입장. (방 생성은 `POST /rooms` 후 이 이벤트로 같은 `roomId`에 join.)

| Payload | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `roomId` | `string` | O | 입장할 방 ID. |
| `nickname` | `string` | O | 입장 시 사용할 닉네임. 기존에 `set_nickname`으로 설정했으면 중복 전달 가능. |

**서버 동작**:
1. `rooms.has(roomId)` 없으면 에러.
2. `socket.join(roomId)`, `users.get(socketId).roomId = roomId`, `users.get(socketId).nickname = nickname` (갱신).
3. `Room.participants`에 해당 User 추가.
4. 해당 방에 `user_joined { nickname, socketId }` 브로드캐스트.
5. **입장한 소켓에만** `room_joined { room, messages }` ACK. `messages`는 `messages.get(roomId)` 히스토리.

**에러**: 방 없음 → `error { code: 'ROOM_NOT_FOUND', roomId }`.

---

### `leave_room`

현재 방 퇴장.

| Payload | - | (없거나 `{}`) |

**서버 동작**:
1. `user = users.get(socketId)`, `roomId = user?.roomId`. 없으면 no-op 또는 `error { code: 'NOT_IN_ROOM' }`.
2. `socket.leave(roomId)`, `user.roomId = null`, `Room.participants`에서 제거.
3. 해당 방에 `user_left { nickname, socketId }` 브로드캐스트.
4. 참가자 0이면 `rooms.delete(roomId)`, `messages.delete(roomId)`, 로비(또는 전역)에 `room_deleted { roomId }` 브로드캐스트.
5. `leave_room_ok` ACK (선택).

---

### `send_message`

방 내 메시지 전송.

| Payload | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `text` | `string` | O | 본문. `trim` 후 1~2000자. |

**서버 동작**:
1. `user = users.get(socketId)`, `roomId = user?.roomId`. 없으면 `error { code: 'NOT_IN_ROOM' }`.
2. `text` 검증: 빈 문자열·2000초과 → `error { code: 'MESSAGE_INVALID', reason }`.
3. `Message` 생성 → `messages.get(roomId).push(msg)`.
4. `io.to(roomId).emit('message', msg)`.
5. ACK `msg` (또는 `message_sent`). 전송 실패 시 클라이언트는 FR-010에 따라 재전송 UI.

**에러**: `error { code: 'MESSAGE_INVALID'|'NOT_IN_ROOM', reason?: string }`.

---

## 3. 서버 → 클라이언트 (on)

### `message`

방에 새 메시지가 올 때. (본인 포함 방 전체에 브로드캐스트.)

```ts
{ id, roomId, senderId, senderNickname, text, createdAt }
```

---

### `user_joined`

방에 다른 유저가 들어왔을 때.

```ts
{ nickname: string, socketId: string }
```

---

### `user_left`

방에서 다른 유저가 나갔을 때.

```ts
{ nickname: string, socketId: string }
```

---

### `room_deleted`

방이 삭제됐을 때(참가자 0). 해당 방에 있던 소켓 + 로비(또는 전역)에 브로드캐스트.

```ts
{ roomId: string }
```

---

### `room_list_updated`

(선택) 방 생성/삭제 시 로비에 알림. 클라이언트는 `queryClient.invalidateQueries(['rooms'])`로 `GET /rooms` 재요청.

```ts
{}  // 페이로드 없거나 { reason: 'created'|'deleted', roomId? }
```

---

### `room_joined`

`join_room` ACK. 입장한 소켓에만. 기존 메시지 히스토리 포함.

```ts
{ room: Room, messages: Message[] }
```

---

### `error`

에러 응답.

```ts
{ code: string, reason?: string, roomId?: string }
// code: 'ROOM_NOT_FOUND' | 'NOT_IN_ROOM' | 'MESSAGE_INVALID' | ...
```

---

## 4. 플로우 요약

1. **메인 → 닉네임 설정**  
   - 옵션 A: `set_nickname { nickname }`  
   - 옵션 B: “닉네임 없이”면 서버가 `connect` 시점에 랜덤 부여(또는 `join_room` 시 부여).

2. **방 생성**  
   - `POST /rooms` with `{ nickname }` → `201 { room, user }`  
   - 클라이언트: `join_room { roomId: room.id, nickname }` → `room_joined { room, messages }`.

3. **방 목록 → 입장**  
   - `GET /rooms` → 목록 표시.  
   - 입장: `join_room { roomId, nickname }` → `room_joined { room, messages }`.

4. **메시지**  
   - `send_message { text }` → 서버가 `message` 브로드캐스트.

5. **나가기**  
   - `leave_room` → `user_left` 방송, 참가자 0이면 `room_deleted` + Store에서 방 제거.

6. **연결 끊김**  
   - `disconnect` 시 `leave_room`과 동일 처리.
