# 데이터 모델: 실시간 채팅 앱

**Feature Branch**: `001-realtime-chat`
**Created**: 2026-01-21
**Phase**: 설계 완료

## 핵심 엔티티

### 1. User (사용자)

사용자는 채팅 앱을 이용하는 개인으로, 세션 기반으로 관리되며 영구 저장되지 않습니다.

```typescript
interface User {
  id: string;                    // 고유 식별자 (UUID v4)
  nickname: string;              // 사용자 닉네임 (최대 20자)
  socketId: string;              // Socket.IO 연결 ID
  currentRoomId: string | null;  // 현재 참여 중인 방 ID
  createdAt: Date;               // 접속 시간
  lastSeen: Date;                // 마지막 활동 시간
  isConnected: boolean;          // 실시간 연결 상태
}
```

**Validation Rules**:
- `nickname`: 1-20자, 한글/영문/숫자/공백만 허용
- `socketId`: Socket.IO에서 자동 생성된 연결 ID
- `id`: UUID v4 형태의 고유 식별자

**State Transitions**:
- `CREATED` → `CONNECTED` (로비 입장)
- `CONNECTED` → `IN_ROOM` (방 참여)
- `IN_ROOM` → `CONNECTED` (방 나가기)
- `*` → `DISCONNECTED` (30초 무응답 시)

**Relationships**:
- User N:1 ChatRoom (현재 참여 방)
- User 1:N Message (메시지 작성자)

### 2. ChatRoom (채팅방)

최대 5명의 사용자가 참여할 수 있는 실시간 대화 공간입니다.

```typescript
interface ChatRoom {
  id: string;                    // 고유 식별자 (UUID v4)
  name: string;                  // 자동 생성된 방 이름 ("채팅방 #001")
  participants: User[];          // 현재 참여자 목록
  messages: Message[];           // 메시지 히스토리
  maxParticipants: number;       // 최대 참여자 수 (5명)
  createdAt: Date;               // 방 생성 시간
  lastActivity: Date;            // 마지막 활동 시간 (정렬 기준)
  createdBy: string;             // 방 생성자 user ID
}
```

**Validation Rules**:
- `name`: "채팅방 #XXX" 형태 (XXX는 3자리 숫자)
- `participants`: 최대 5명까지 허용
- `messages`: 방당 제한 없음 (메모리 기반)
- `maxParticipants`: 고정값 5

**State Transitions**:
- `CREATED` → `ACTIVE` (첫 사용자 입장)
- `ACTIVE` → `FULL` (5명 도달)
- `FULL` → `ACTIVE` (사용자 퇴장)
- `ACTIVE` → `DELETED` (마지막 사용자 퇴장)

**Business Rules**:
- 모든 참여자가 나가면 자동 삭제
- 방 이름은 생성 순서대로 자동 부여
- 참여자 변경 시 모든 참여자에게 실시간 알림

**Relationships**:
- ChatRoom 1:N User (참여자들)
- ChatRoom 1:N Message (방 내 메시지들)

### 3. Message (메시지)

사용자가 채팅방에서 보내는 텍스트 데이터입니다.

```typescript
interface Message {
  id: string;                    // 고유 식별자 (UUID v4)
  content: string;               // 메시지 내용 (최대 500자)
  authorId: string;              // 작성자 user ID
  authorNickname: string;        // 작성자 닉네임 (스냅샷)
  roomId: string;                // 채팅방 ID
  createdAt: Date;               // 메시지 전송 시간
  type: MessageType;             // 메시지 유형
}

enum MessageType {
  CHAT = 'chat',                 // 일반 채팅 메시지
  SYSTEM = 'system',             // 시스템 알림 (입장/퇴장)
  NOTIFICATION = 'notification'  // 방 정보 변경 알림
}
```

**Validation Rules**:
- `content`: 1-500자, 빈 문자열 불허용
- `authorNickname`: 메시지 전송 시점의 닉네임 보존
- `type`: MessageType enum 값만 허용

**System Messages**:
- 사용자 입장: "{닉네임}님이 입장했습니다."
- 사용자 퇴장: "{닉네임}님이 나갔습니다."
- 방 생성: "채팅방이 생성되었습니다."

**Relationships**:
- Message N:1 User (작성자)
- Message N:1 ChatRoom (소속 방)

## 데이터 저장 구조

### In-Memory Storage Design

실험용으로 메모리 기반 저장소를 사용하며, 서버 재시작 시 모든 데이터가 초기화됩니다.

```typescript
// Backend Memory Store
class ChatMemoryStore {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, ChatRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // socketId → userId
  private roomCounter: number = 1; // 방 이름 자동 생성용

  // User management
  createUser(nickname: string, socketId: string): User
  getUserById(id: string): User | null
  getUserBySocketId(socketId: string): User | null
  removeUser(id: string): void
  updateUserActivity(id: string): void

  // Room management
  createRoom(createdBy: string): ChatRoom
  getRoomById(id: string): ChatRoom | null
  getAllRooms(): ChatRoom[]
  removeRoom(id: string): void
  addUserToRoom(userId: string, roomId: string): boolean
  removeUserFromRoom(userId: string, roomId: string): void

  // Message management
  addMessage(roomId: string, message: Message): void
  getRoomMessages(roomId: string): Message[]
}
```

### Frontend Session Storage

```typescript
// Frontend Session Storage
interface SessionData {
  userId: string;
  nickname: string;
  createdAt: string;
}

class SessionManager {
  private static readonly KEY = 'chat-session';

  static save(data: SessionData): void {
    sessionStorage.setItem(this.KEY, JSON.stringify(data));
  }

  static load(): SessionData | null {
    const data = sessionStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }

  static clear(): void {
    sessionStorage.removeItem(this.KEY);
  }
}
```

## Socket.IO 이벤트 데이터

### Client → Server Events

```typescript
// 로비 입장
interface JoinLobbyEvent {
  nickname?: string; // 선택적 닉네임 (없으면 랜덤 생성)
}

// 방 생성
interface CreateRoomEvent {
  // 추가 데이터 없음 (자동 생성)
}

// 방 참여
interface JoinRoomEvent {
  roomId: string;
}

// 메시지 전송
interface SendMessageEvent {
  roomId: string;
  content: string;
}

// 방 나가기
interface LeaveRoomEvent {
  roomId: string;
}
```

### Server → Client Events

```typescript
// 로비 업데이트
interface LobbyUpdateEvent {
  rooms: {
    id: string;
    name: string;
    participantCount: number;
    maxParticipants: number;
    participants: string[]; // 닉네임 배열
  }[];
}

// 방 입장 성공
interface RoomJoinedEvent {
  room: {
    id: string;
    name: string;
    participants: User[];
    messages: Message[];
  };
}

// 새 메시지 수신
interface MessageReceivedEvent {
  message: Message;
}

// 사용자 입/퇴장 알림
interface UserActivityEvent {
  type: 'joined' | 'left';
  user: {
    id: string;
    nickname: string;
  };
  roomId: string;
}

// 연결 에러
interface ErrorEvent {
  message: string;
  code?: string;
}
```

## 데이터 플로우

### 1. 사용자 로비 입장 시나리오

```
1. Frontend: sessionStorage에서 기존 세션 확인
2. 없으면 닉네임 입력 화면 표시
3. Socket 연결 후 'join-lobby' 이벤트 발송
4. Backend: User 객체 생성 및 메모리 저장
5. Backend: 현재 방 목록을 'lobby-update' 이벤트로 응답
6. Frontend: 로비 UI 업데이트
```

### 2. 방 생성 및 참여 시나리오

```
1. Frontend: 'create-room' 이벤트 발송
2. Backend: ChatRoom 객체 생성, 사용자를 참여자로 추가
3. Backend: 'room-joined' 이벤트로 방 정보 응답
4. Backend: 모든 로비 사용자에게 'lobby-update' 브로드캐스트
5. Frontend: 채팅 화면으로 전환
```

### 3. 실시간 메시지 전송 시나리오

```
1. Frontend: 'send-message' 이벤트 발송
2. Backend: Message 객체 생성, 방 메시지 목록에 추가
3. Backend: 방의 모든 참여자에게 'message-received' 브로드캐스트
4. Frontend: 실시간으로 새 메시지 UI에 표시
```

### 4. 사용자 연결 해제 및 정리 시나리오

```
1. Socket 연결 해제 또는 30초 무응답
2. Backend: 사용자가 속한 방에서 제거
3. Backend: 방 참여자들에게 'user-left' 이벤트 브로드캐스트
4. Backend: 방이 비었으면 자동 삭제
5. Backend: 로비 사용자들에게 'lobby-update' 브로드캐스트
```

## 메모리 사용량 추정

**100명 동시 접속 기준**:
- Users: 100 × 300 bytes ≈ 30KB
- ChatRooms: 20개 × 500 bytes ≈ 10KB
- Messages: 1000개 × 200 bytes ≈ 200KB
- **총 메모리 사용량**: ~250KB (충분히 가벼움)

## 확장성 고려사항

**현재 인메모리 구조의 한계**:
- 서버 재시작 시 데이터 손실
- 단일 인스턴스에서만 동작
- 메모리 사용량이 접속자 수에 비례해서 증가

**향후 확장 가능한 구조**:
- Redis로 세션 및 채팅방 데이터 저장
- PostgreSQL로 사용자 및 메시지 히스토리 영속화
- Socket.IO Redis Adapter로 다중 인스턴스 지원
- Message Queue (RabbitMQ/Kafka)로 이벤트 처리 분산

하지만 실험용 목적에서는 현재 인메모리 구조가 개발 속도와 단순성 면에서 최적입니다.
