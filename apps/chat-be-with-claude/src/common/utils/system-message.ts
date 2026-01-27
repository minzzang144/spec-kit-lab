import { v4 as uuidv4 } from 'uuid';
import {
  MessageType,
  MessageStatus,
} from '../../modules/chat/interfaces/message.interface';

/**
 * 시스템 메시지 생성 유틸리티
 * User Story 2: 실시간 채팅에서 사용자 입장/퇴장 등 시스템 이벤트 메시지 생성
 */

/**
 * 시스템 메시지 템플릿
 */
export enum SystemMessageTemplate {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  ROOM_CREATED = 'room_created',
  ROOM_CLOSED = 'room_closed',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_RESTORED = 'connection_restored',
}

/**
 * 시스템 메시지 템플릿별 내용
 */
const SYSTEM_MESSAGE_TEMPLATES: Record<
  SystemMessageTemplate,
  (params: any) => string
> = {
  [SystemMessageTemplate.USER_JOINED]: (params: { nickname: string }) =>
    `${params.nickname}님이 채팅방에 참여했습니다.`,
  [SystemMessageTemplate.USER_LEFT]: (params: { nickname: string }) =>
    `${params.nickname}님이 채팅방을 나갔습니다.`,
  [SystemMessageTemplate.ROOM_CREATED]: (params: {
    roomName: string;
    creatorNickname: string;
  }) =>
    `채팅방 '${params.roomName}'이 ${params.creatorNickname}님에 의해 생성되었습니다.`,
  [SystemMessageTemplate.ROOM_CLOSED]: (params: { roomName: string }) =>
    `채팅방 '${params.roomName}'이 자동으로 삭제되었습니다. (모든 사용자 퇴장)`,
  [SystemMessageTemplate.CONNECTION_LOST]: (params: { nickname: string }) =>
    `${params.nickname}님의 연결이 끊어졌습니다.`,
  [SystemMessageTemplate.CONNECTION_RESTORED]: (params: { nickname: string }) =>
    `${params.nickname}님의 연결이 복구되었습니다.`,
};

/**
 * 시스템 메시지 생성 인터페이스
 */
export interface SystemMessageData {
  id: string;
  roomId: string;
  senderId: null;
  senderNickname: null;
  content: string;
  type: MessageType.SYSTEM;
  status: MessageStatus.SENT;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * 시스템 메시지 생성기 클래스
 */
export class SystemMessageGenerator {
  /**
   * 시스템 메시지 생성
   */
  static createSystemMessage(
    roomId: string,
    template: SystemMessageTemplate,
    params: any,
    metadata?: Record<string, any>,
  ): SystemMessageData {
    const messageTemplate = SYSTEM_MESSAGE_TEMPLATES[template];
    if (!messageTemplate) {
      throw new Error(`Unknown system message template: ${template}`);
    }

    return {
      id: `msg-${uuidv4()}`,
      roomId,
      senderId: null,
      senderNickname: null,
      content: messageTemplate(params),
      type: MessageType.SYSTEM,
      status: MessageStatus.SENT,
      createdAt: new Date(),
      metadata,
    };
  }

  /**
   * 사용자 입장 메시지
   */
  static createUserJoinedMessage(
    roomId: string,
    nickname: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.USER_JOINED,
      { nickname },
      { eventType: 'user_joined', userNickname: nickname },
    );
  }

  /**
   * 사용자 퇴장 메시지
   */
  static createUserLeftMessage(
    roomId: string,
    nickname: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.USER_LEFT,
      { nickname },
      { eventType: 'user_left', userNickname: nickname },
    );
  }

  /**
   * 방 생성 메시지
   */
  static createRoomCreatedMessage(
    roomId: string,
    roomName: string,
    creatorNickname: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.ROOM_CREATED,
      { roomName, creatorNickname },
      { eventType: 'room_created', roomName, creatorNickname },
    );
  }

  /**
   * 방 삭제 메시지
   */
  static createRoomClosedMessage(
    roomId: string,
    roomName: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.ROOM_CLOSED,
      { roomName },
      { eventType: 'room_closed', roomName },
    );
  }

  /**
   * 연결 끊어짐 메시지
   */
  static createConnectionLostMessage(
    roomId: string,
    nickname: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.CONNECTION_LOST,
      { nickname },
      { eventType: 'connection_lost', userNickname: nickname },
    );
  }

  /**
   * 연결 복구 메시지
   */
  static createConnectionRestoredMessage(
    roomId: string,
    nickname: string,
  ): SystemMessageData {
    return this.createSystemMessage(
      roomId,
      SystemMessageTemplate.CONNECTION_RESTORED,
      { nickname },
      { eventType: 'connection_restored', userNickname: nickname },
    );
  }

  /**
   * 유효한 시스템 메시지 템플릿인지 확인
   */
  static isValidTemplate(template: string): template is SystemMessageTemplate {
    return Object.values(SystemMessageTemplate).includes(
      template as SystemMessageTemplate,
    );
  }

  /**
   * 사용 가능한 시스템 메시지 템플릿 목록 반환
   */
  static getAvailableTemplates(): SystemMessageTemplate[] {
    return Object.values(SystemMessageTemplate);
  }
}

/**
 * 편의를 위한 단축 함수들
 */
export const createUserJoinedMessage = (
  roomId: string,
  nickname: string,
): SystemMessageData =>
  SystemMessageGenerator.createUserJoinedMessage(roomId, nickname);
export const createUserLeftMessage = (
  roomId: string,
  nickname: string,
): SystemMessageData =>
  SystemMessageGenerator.createUserLeftMessage(roomId, nickname);
export const createRoomCreatedMessage = (
  roomId: string,
  roomName: string,
  creatorNickname: string,
): SystemMessageData =>
  SystemMessageGenerator.createRoomCreatedMessage(
    roomId,
    roomName,
    creatorNickname,
  );
export const createRoomClosedMessage = (
  roomId: string,
  roomName: string,
): SystemMessageData =>
  SystemMessageGenerator.createRoomClosedMessage(roomId, roomName);
export const createConnectionLostMessage = (
  roomId: string,
  nickname: string,
): SystemMessageData =>
  SystemMessageGenerator.createConnectionLostMessage(roomId, nickname);
export const createConnectionRestoredMessage = (
  roomId: string,
  nickname: string,
): SystemMessageData =>
  SystemMessageGenerator.createConnectionRestoredMessage(roomId, nickname);
