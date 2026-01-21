/**
 * Socket.IO 이벤트 계약 정의
 *
 * 이 파일은 Frontend와 Backend에서 공유되는 Socket.IO 이벤트 타입을 정의합니다.
 * 실시간 통신에 사용되는 모든 이벤트의 페이로드 구조를 명세합니다.
 */

// ============================================================================
// 기본 데이터 타입
// ============================================================================

export interface User {
  id: string;
  nickname: string;
  socketId: string;
  currentRoomId: string | null;
  createdAt: string; // ISO 8601 date string
  lastSeen: string;
  isConnected: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: User[];
  messages: Message[];
  maxParticipants: number;
  createdAt: string;
  lastActivity: string;
  createdBy: string;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  authorNickname: string;
  roomId: string;
  createdAt: string;
  type: MessageType;
}

export enum MessageType {
  CHAT = 'chat',
  SYSTEM = 'system',
  NOTIFICATION = 'notification'
}

// ============================================================================
// Client → Server 이벤트 (클라이언트가 서버로 보내는 이벤트)
// ============================================================================

export interface ClientToServerEvents {
  // 로비 입장 - 사용자가 처음 앱에 접속할 때
  'join-lobby': (data: JoinLobbyPayload) => void;

  // 방 생성 - 새로운 채팅방을 만들 때
  'create-room': () => void;

  // 방 참여 - 기존 채팅방에 입장할 때
  'join-room': (data: JoinRoomPayload) => void;

  // 방 나가기 - 현재 채팅방을 떠날 때
  'leave-room': (data: LeaveRoomPayload) => void;

  // 메시지 전송 - 채팅방에서 메시지를 보낼 때
  'send-message': (data: SendMessagePayload) => void;

  // 연결 상태 핑 - 클라이언트 생존 신호
  'ping': () => void;
}

export interface JoinLobbyPayload {
  nickname?: string; // 닉네임 미제공 시 랜덤 생성
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
}

// ============================================================================
// Server → Client 이벤트 (서버가 클라이언트로 보내는 이벤트)
// ============================================================================

export interface ServerToClientEvents {
  // 로비 업데이트 - 방 목록이 변경될 때
  'lobby-update': (data: LobbyUpdatePayload) => void;

  // 방 입장 성공 - 사용자가 성공적으로 방에 입장했을 때
  'room-joined': (data: RoomJoinedPayload) => void;

  // 방 나가기 성공 - 사용자가 방을 성공적으로 나갔을 때
  'room-left': (data: RoomLeftPayload) => void;

  // 새 메시지 수신 - 채팅방에 새 메시지가 도착했을 때
  'message-received': (data: MessageReceivedPayload) => void;

  // 사용자 입장 알림 - 다른 사용자가 방에 입장했을 때
  'user-joined': (data: UserJoinedPayload) => void;

  // 사용자 퇴장 알림 - 다른 사용자가 방을 나갔을 때
  'user-left': (data: UserLeftPayload) => void;

  // 방 정보 업데이트 - 방의 참여자나 정보가 변경될 때
  'room-updated': (data: RoomUpdatedPayload) => void;

  // 에러 발생 - 요청 처리 중 에러가 발생했을 때
  'error': (data: ErrorPayload) => void;

  // 사용자 정보 업데이트 - 사용자 세션 정보가 확정될 때
  'user-updated': (data: UserUpdatedPayload) => void;

  // 연결 상태 폰 - 서버 생존 응답
  'pong': () => void;
}

export interface LobbyUpdatePayload {
  rooms: {
    id: string;
    name: string;
    participantCount: number;
    maxParticipants: number;
    participants: string[]; // 참여자 닉네임 배열
    lastActivity: string;
  }[];
}

export interface RoomJoinedPayload {
  room: {
    id: string;
    name: string;
    participants: {
      id: string;
      nickname: string;
      isConnected: boolean;
    }[];
    messages: Message[];
    maxParticipants: number;
    createdAt: string;
  };
  user: {
    id: string;
    nickname: string;
  };
}

export interface RoomLeftPayload {
  roomId: string;
  userId: string;
}

export interface MessageReceivedPayload {
  message: Message;
}

export interface UserJoinedPayload {
  user: {
    id: string;
    nickname: string;
  };
  roomId: string;
}

export interface UserLeftPayload {
  user: {
    id: string;
    nickname: string;
  };
  roomId: string;
}

export interface RoomUpdatedPayload {
  room: {
    id: string;
    name: string;
    participantCount: number;
    maxParticipants: number;
    participants: {
      id: string;
      nickname: string;
      isConnected: boolean;
    }[];
    lastActivity: string;
  };
}

export interface UserUpdatedPayload {
  user: {
    id: string;
    nickname: string;
    currentRoomId: string | null;
  };
}

export interface ErrorPayload {
  message: string;
  code?: ErrorCode;
  details?: any;
}

// ============================================================================
// 에러 코드 정의
// ============================================================================

export enum ErrorCode {
  // 인증/세션 관련
  INVALID_NICKNAME = 'INVALID_NICKNAME',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // 방 관련
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  NOT_IN_ROOM = 'NOT_IN_ROOM',
  ALREADY_IN_ROOM = 'ALREADY_IN_ROOM',

  // 메시지 관련
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY = 'MESSAGE_EMPTY',
  MESSAGE_INVALID = 'MESSAGE_INVALID',

  // 연결 관련
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // 일반 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// ============================================================================
// Socket.IO 타입 확장
// ============================================================================

// Socket.IO 서버에서 사용할 전체 이벤트 맵
export interface InterServerEvents {
  // 현재는 단일 인스턴스이므로 비어있음
  // 향후 다중 인스턴스 지원 시 추가
}

// Socket 데이터 (소켓별 메타데이터)
export interface SocketData {
  userId?: string;
  nickname?: string;
  currentRoomId?: string | null;
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

// 이벤트 이름만 추출하는 유틸리티 타입
export type ClientEventNames = keyof ClientToServerEvents;
export type ServerEventNames = keyof ServerToClientEvents;

// 이벤트별 페이로드 타입 추출
export type EventPayload<T extends ClientEventNames> = Parameters<ClientToServerEvents[T]>[0];
export type ServerEventPayload<T extends ServerEventNames> = Parameters<ServerToClientEvents[T]>[0];

// ============================================================================
// 유효성 검증 스키마 (클라이언트/서버 공통)
// ============================================================================

export const ValidationRules = {
  nickname: {
    minLength: 1,
    maxLength: 20,
    pattern: /^[\uAC00-\uD7A3a-zA-Z0-9\s]+$/, // 한글, 영문, 숫자, 공백
  },
  message: {
    minLength: 1,
    maxLength: 500,
  },
  room: {
    maxParticipants: 5,
    namePrefix: '채팅방 #',
  },
} as const;