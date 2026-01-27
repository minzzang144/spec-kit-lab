/**
 * 채팅 메시지 관련 인터페이스 정의
 * User Story 2: 실시간 채팅 메시지 기능 구현을 위한 타입 정의
 */

/**
 * 메시지 타입 열거형
 */
export enum MessageType {
  /** 일반 사용자 메시지 */
  USER = 'user',
  /** 시스템 메시지 (사용자 입장/퇴장 등) */
  SYSTEM = 'system',
  /** 공지 메시지 */
  ANNOUNCEMENT = 'announcement'
}

/**
 * 메시지 상태 열거형
 */
export enum MessageStatus {
  /** 전송됨 */
  SENT = 'sent',
  /** 전달됨 */
  DELIVERED = 'delivered',
  /** 읽음 */
  READ = 'read'
}

/**
 * 기본 메시지 인터페이스
 */
export interface Message {
  /** 메시지 고유 ID */
  id: string;

  /** 메시지가 속한 채팅방 ID */
  roomId: string;

  /** 발신자 사용자 ID (시스템 메시지의 경우 null 가능) */
  senderId: string | null;

  /** 발신자 닉네임 */
  senderNickname: string | null;

  /** 메시지 내용 */
  content: string;

  /** 메시지 타입 */
  type: MessageType;

  /** 메시지 상태 */
  status: MessageStatus;

  /** 메시지 생성 시간 */
  createdAt: Date;

  /** 메시지 수정 시간 (선택적) */
  updatedAt?: Date;

  /** 추가 메타데이터 (선택적) */
  metadata?: Record<string, any>;
}

/**
 * 사용자 메시지 인터페이스 (일반 채팅 메시지)
 */
export interface UserMessage extends Omit<Message, 'senderId' | 'senderNickname' | 'type'> {
  senderId: string;
  senderNickname: string;
  type: MessageType.USER;
}

/**
 * 시스템 메시지 인터페이스 (입장/퇴장 알림 등)
 */
export interface SystemMessage extends Omit<Message, 'senderId' | 'senderNickname' | 'type'> {
  senderId: null;
  senderNickname: null;
  type: MessageType.SYSTEM;
  /** 시스템 메시지 세부 타입 */
  systemMessageType: 'user_joined' | 'user_left' | 'room_created' | 'room_deleted' | 'other';
}

/**
 * 메시지 생성 입력 데이터
 */
export interface CreateMessageInput {
  roomId: string;
  senderId: string | null;
  senderNickname: string | null;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  systemMessageType?: 'user_joined' | 'user_left' | 'room_created' | 'room_deleted' | 'other';
}

/**
 * 메시지 조회 필터 옵션
 */
export interface MessageQueryOptions {
  /** 조회할 방 ID */
  roomId: string;
  /** 조회 시작 시간 (선택적) */
  fromDate?: Date;
  /** 조회 종료 시간 (선택적) */
  toDate?: Date;
  /** 조회할 메시지 개수 제한 (기본: 50) */
  limit?: number;
  /** 건너뛸 메시지 개수 (페이지네이션) */
  offset?: number;
  /** 메시지 타입 필터 (선택적) */
  messageTypes?: MessageType[];
}

/**
 * 메시지 조회 결과
 */
export interface MessagesResult {
  /** 메시지 목록 */
  messages: Message[];
  /** 전체 메시지 수 */
  totalCount: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrevious: boolean;
  /** 조회 옵션 */
  queryOptions: MessageQueryOptions;
}

/**
 * 실시간 메시지 전송 이벤트 데이터
 */
export interface MessageBroadcastData {
  /** 전송된 메시지 */
  message: Message;
  /** 방 ID */
  roomId: string;
  /** 방 이름 */
  roomName: string;
  /** 브로드캐스트 시간 */
  timestamp: string;
}

/**
 * 메시지 통계 정보
 */
export interface MessageStats {
  /** 방 ID */
  roomId: string;
  /** 전체 메시지 수 */
  totalMessages: number;
  /** 사용자 메시지 수 */
  userMessages: number;
  /** 시스템 메시지 수 */
  systemMessages: number;
  /** 가장 최근 메시지 시간 */
  lastMessageAt: Date | null;
  /** 가장 오래된 메시지 시간 */
  firstMessageAt: Date | null;
}