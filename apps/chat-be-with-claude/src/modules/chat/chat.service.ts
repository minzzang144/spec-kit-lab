import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { MemoryStore } from '../../storage/memory-store';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import {
  Message,
  MessageType,
  MessageStatus,
  CreateMessageInput,
  MessageQueryOptions,
  MessagesResult,
  MessageStats,
} from './interfaces/message.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto, GetMessageStatsDto } from './dto/get-messages.dto';

/**
 * 채팅 관련 비즈니스 로직 서비스
 *
 * 방 참여자 관리, 메시지 처리, Socket 연결 관리 등의 기능을 담당합니다.
 * User Story 5: 기존 채팅방 참여 기능의 참여자 관리를 구현합니다.
 */
@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly memoryStore: MemoryStore,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 모듈 초기화 시 연결 타임아웃 모니터 시작
   */
  onModuleInit() {
    this.startConnectionTimeoutMonitor();
  }

  /**
   * 방 참여자 목록을 조회합니다.
   * @param roomId 방 ID
   */
  getRoomParticipants(roomId: string) {
    if (!roomId) {
      throw new BadRequestException('방 ID가 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    return {
      roomId: room.id,
      roomName: room.name,
      participants: room.participants.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        connectedAt: p.connectedAt,
        isConnected: !!p.socketId,
        socketId: p.socketId,
      })),
      participantCount: room.participants.length,
      maxParticipants: 5, // RoomsService.MAX_PARTICIPANTS와 동기화
    };
  }

  /**
   * 방의 특정 참여자 정보를 조회합니다.
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  getRoomParticipant(roomId: string, userId: string) {
    if (!roomId || !userId) {
      throw new BadRequestException('방 ID와 사용자 ID가 모두 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    const participant = room.participants.find((p) => p.id === userId);
    if (!participant) {
      throw new NotFoundException(
        `방에서 해당 사용자를 찾을 수 없습니다. (사용자 ID: ${userId})`,
      );
    }

    return {
      id: participant.id,
      nickname: participant.nickname,
      connectedAt: participant.connectedAt,
      isConnected: !!participant.socketId,
      socketId: participant.socketId,
      roomId: room.id,
      roomName: room.name,
    };
  }

  /**
   * 사용자가 특정 방에 참여 중인지 확인합니다.
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  isUserInRoom(roomId: string, userId: string): boolean {
    if (!roomId || !userId) {
      return false;
    }

    try {
      const room = this.memoryStore.getRoom(roomId);
      if (!room) {
        return false;
      }

      return room.participants.some((p) => p.id === userId);
    } catch (error) {
      this.logger.warn(
        `Error checking if user ${userId} is in room ${roomId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * 방의 연결된 참여자들에게 브로드캐스트할 Socket ID 목록을 조회합니다.
   * @param roomId 방 ID
   * @param excludeSocketId 제외할 Socket ID (선택적)
   */
  getRoomConnectedSocketIds(
    roomId: string,
    excludeSocketId?: string,
  ): string[] {
    try {
      const room = this.memoryStore.getRoom(roomId);
      if (!room) {
        return [];
      }

      return room.participants
        .filter((p) => p.socketId && p.socketId !== excludeSocketId)
        .map((p) => p.socketId as string);
    } catch (error) {
      this.logger.error(
        `Error getting connected socket IDs for room ${roomId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * 방 참여자 수 통계를 조회합니다.
   * @param roomId 방 ID
   */
  getRoomParticipantStats(roomId: string) {
    try {
      const room = this.memoryStore.getRoom(roomId);
      if (!room) {
        throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
      }

      const connectedParticipants = room.participants.filter(
        (p) => !!p.socketId,
      );
      const disconnectedParticipants = room.participants.filter(
        (p) => !p.socketId,
      );

      return {
        roomId: room.id,
        roomName: room.name,
        totalParticipants: room.participants.length,
        connectedParticipants: connectedParticipants.length,
        disconnectedParticipants: disconnectedParticipants.length,
        maxParticipants: 5, // RoomsService.MAX_PARTICIPANTS와 동기화
        isFull: room.participants.length >= 5,
        connectionRate:
          room.participants.length > 0
            ? Math.round(
                (connectedParticipants.length / room.participants.length) * 100,
              )
            : 0,
      };
    } catch (error) {
      this.logger.error(
        `Error getting participant stats for room ${roomId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 사용자의 Socket ID를 업데이트합니다 (연결/해제 시 사용).
   * @param userId 사용자 ID
   * @param socketId Socket ID (null이면 연결 해제)
   */
  updateUserSocketConnection(userId: string, socketId: string | null): void {
    try {
      const user = this.memoryStore.getUser(userId);
      if (!user) {
        this.logger.warn(
          `Cannot update socket connection for non-existent user: ${userId}`,
        );
        return;
      }

      // 사용자의 Socket ID 업데이트 (메모리 저장소에서 직접)
      if (socketId) {
        this.memoryStore.setUserSocket(userId, socketId);
      } else {
        this.memoryStore.removeSocketMapping(user.socketId || '');
      }

      // 참여 중인 방들에서도 Socket ID 업데이트
      const rooms = this.memoryStore.getAllRooms();
      rooms.forEach((room) => {
        const participant = room.participants.find((p) => p.id === userId);
        if (participant) {
          participant.socketId = socketId || undefined;
          this.logger.debug(
            `Updated socket ID for user ${user.nickname} in room ${room.name}: ${socketId || 'disconnected'}`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Error updating socket connection for user ${userId}:`,
        error,
      );
    }
  }

  /**
   * 연결이 해제된 사용자를 모든 방에서 제거합니다.
   * @param userId 사용자 ID
   */
  removeDisconnectedUserFromAllRooms(userId: string): string[] {
    const removedFromRooms: string[] = [];

    try {
      const rooms = this.memoryStore.getAllRooms();

      for (const room of rooms) {
        const isParticipant = room.participants.some((p) => p.id === userId);
        if (isParticipant) {
          try {
            const success = this.roomsService.removeUserFromRoom(
              room.id,
              userId,
            );
            if (success) {
              removedFromRooms.push(room.name);
              this.logger.log(
                `Removed disconnected user ${userId} from room ${room.name}`,
              );
            }
          } catch (error) {
            this.logger.error(
              `Failed to remove user ${userId} from room ${room.id}:`,
              error,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error removing disconnected user ${userId} from rooms:`,
        error,
      );
    }

    return removedFromRooms;
  }

  /**
   * 30초 연결 해제 감지 시스템 (User Story 6)
   * 주기적으로 비활성 사용자들을 체크하고 정리합니다.
   */
  startConnectionTimeoutMonitor(): void {
    const TIMEOUT_CHECK_INTERVAL = 10000; // 10초마다 체크
    const CONNECTION_TIMEOUT = 30000; // 30초 타임아웃

    setInterval(() => {
      this.checkAndCleanupInactiveUsers(CONNECTION_TIMEOUT);
    }, TIMEOUT_CHECK_INTERVAL);

    this.logger.log(
      `Connection timeout monitor started (${CONNECTION_TIMEOUT / 1000}s timeout)`,
    );
  }

  /**
   * 비활성 사용자들을 체크하고 정리합니다.
   * @param timeoutMs 타임아웃 시간 (밀리초)
   * @private
   */
  private checkAndCleanupInactiveUsers(timeoutMs: number): void {
    try {
      const now = new Date();
      const stats = this.usersService.getStats();
      const allUsers = this.usersService.findAll();

      this.logger.debug(
        `Checking ${allUsers.length} users for connection timeout...`,
      );

      const timedOutUsers: Array<{ id: string; nickname: string }> = [];

      for (const user of allUsers) {
        // 연결된 사용자는 건너뛰기
        if (user.socketId) {
          continue;
        }

        // 마지막 활동 시간 확인
        const lastActivity = user.lastSeen || user.createdAt;
        const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

        if (timeSinceLastActivity > timeoutMs) {
          timedOutUsers.push({ id: user.id, nickname: user.nickname });
        }
      }

      // 타임아웃된 사용자들 정리
      for (const { id, nickname } of timedOutUsers) {
        this.logger.log(
          `User ${nickname} (${id}) timed out after ${timeoutMs / 1000}s, removing...`,
        );

        try {
          // 모든 방에서 제거
          const removedFromRooms = this.removeDisconnectedUserFromAllRooms(id);

          // 사용자 완전 제거
          this.usersService.removeUser(id);

          this.logger.log(
            `Cleaned up timed out user ${nickname}, removed from ${removedFromRooms.length} rooms`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to cleanup timed out user ${nickname}:`,
            error,
          );
        }
      }

      if (timedOutUsers.length > 0) {
        this.logger.log(
          `Connection timeout check completed: ${timedOutUsers.length} users cleaned up`,
        );
      } else {
        this.logger.debug(
          `Connection timeout check completed: no users timed out`,
        );
      }
    } catch (error) {
      this.logger.error('Error during connection timeout check:', error);
    }
  }

  /**
   * 연결 상태 통계를 조회합니다.
   * @returns 연결 상태별 사용자 수
   */
  getConnectionStats(): {
    totalUsers: number;
    connectedUsers: number;
    disconnectedUsers: number;
    roomParticipants: number;
    lobbyOnlyUsers: number;
  } {
    try {
      const allUsers = this.usersService.findAll();
      const connectedUsers = allUsers.filter((u) => !!u.socketId);
      const disconnectedUsers = allUsers.filter((u) => !u.socketId);

      // 방에 참여 중인 사용자 수 계산
      const rooms = this.memoryStore.getAllRooms();
      const allRoomParticipants = new Set<string>();

      rooms.forEach((room) => {
        room.participants.forEach((p) => {
          allRoomParticipants.add(p.id);
        });
      });

      const roomParticipants = allRoomParticipants.size;
      const lobbyOnlyUsers = allUsers.length - roomParticipants;

      return {
        totalUsers: allUsers.length,
        connectedUsers: connectedUsers.length,
        disconnectedUsers: disconnectedUsers.length,
        roomParticipants,
        lobbyOnlyUsers,
      };
    } catch (error) {
      this.logger.error('Error getting connection stats:', error);
      return {
        totalUsers: 0,
        connectedUsers: 0,
        disconnectedUsers: 0,
        roomParticipants: 0,
        lobbyOnlyUsers: 0,
      };
    }
  }

  /**
   * 방의 활동 시간을 업데이트합니다.
   * @param roomId 방 ID
   */
  updateRoomActivity(roomId: string): void {
    try {
      const room = this.memoryStore.getRoom(roomId);
      if (room) {
        room.lastActivity = new Date();
        this.logger.debug(`Updated activity time for room ${room.name}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to update room activity for ${roomId}:`, error);
    }
  }

  // === 메시지 관련 메서드들 (User Story 2) ===

  /**
   * 새 메시지를 생성합니다.
   * @param sendMessageDto 메시지 전송 데이터
   * @param senderId 발신자 사용자 ID
   * @param senderNickname 발신자 닉네임
   */
  createMessage(
    sendMessageDto: SendMessageDto,
    senderId: string,
    senderNickname: string,
  ): Message {
    if (!sendMessageDto.roomId || !sendMessageDto.content.trim()) {
      throw new BadRequestException('방 ID와 메시지 내용이 필요합니다.');
    }

    // 방 존재 여부 확인
    const room = this.memoryStore.getRoom(sendMessageDto.roomId);
    if (!room) {
      throw new NotFoundException(
        `방을 찾을 수 없습니다. (ID: ${sendMessageDto.roomId})`,
      );
    }

    // 사용자가 방에 참여 중인지 확인
    const isUserInRoom = this.isUserInRoom(sendMessageDto.roomId, senderId);
    if (!isUserInRoom) {
      throw new BadRequestException(
        '방에 참여한 후 메시지를 전송할 수 있습니다.',
      );
    }

    // 메시지 생성
    const messageInput: CreateMessageInput = {
      roomId: sendMessageDto.roomId,
      senderId,
      senderNickname,
      content: sendMessageDto.content.trim(),
      type: MessageType.USER,
      metadata: sendMessageDto.metadata,
    };

    const message = this.memoryStore.createMessage(messageInput);
    this.logger.log(
      `Message created by ${senderNickname} in room ${room.name}: ${message.content.substring(0, 50)}...`,
    );

    return message;
  }

  /**
   * 시스템 메시지를 생성합니다 (사용자 입장/퇴장 알림 등).
   * @param roomId 방 ID
   * @param content 시스템 메시지 내용
   * @param systemMessageType 시스템 메시지 세부 타입
   */
  createSystemMessage(
    roomId: string,
    content: string,
    systemMessageType:
      | 'user_joined'
      | 'user_left'
      | 'room_created'
      | 'room_deleted'
      | 'other' = 'other',
  ): Message {
    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    const messageInput: CreateMessageInput = {
      roomId,
      senderId: null,
      senderNickname: null,
      content: content.trim(),
      type: MessageType.SYSTEM,
      systemMessageType,
    };

    const message = this.memoryStore.createMessage(messageInput);
    this.logger.debug(
      `System message created in room ${room.name}: ${content}`,
    );

    return message;
  }

  /**
   * 방의 메시지 목록을 조회합니다.
   * @param getMessagesDto 메시지 조회 옵션
   */
  getMessages(getMessagesDto: GetMessagesDto): MessagesResult {
    if (!getMessagesDto.roomId) {
      throw new BadRequestException('방 ID가 필요합니다.');
    }

    const room = this.memoryStore.getRoom(getMessagesDto.roomId);
    if (!room) {
      throw new NotFoundException(
        `방을 찾을 수 없습니다. (ID: ${getMessagesDto.roomId})`,
      );
    }

    const queryOptions: MessageQueryOptions = {
      roomId: getMessagesDto.roomId,
      fromDate: getMessagesDto.fromDate
        ? new Date(getMessagesDto.fromDate)
        : undefined,
      toDate: getMessagesDto.toDate
        ? new Date(getMessagesDto.toDate)
        : undefined,
      limit: getMessagesDto.limit || 50,
      offset: getMessagesDto.offset || 0,
      messageTypes: getMessagesDto.messageTypes,
    };

    const result = this.memoryStore.queryMessages(queryOptions);
    this.logger.debug(
      `Retrieved ${result.messages.length} messages from room ${room.name}`,
    );

    return result;
  }

  /**
   * 특정 메시지를 조회합니다.
   * @param messageId 메시지 ID
   */
  getMessage(messageId: string): Message {
    if (!messageId) {
      throw new BadRequestException('메시지 ID가 필요합니다.');
    }

    const message = this.memoryStore.getMessage(messageId);
    if (!message) {
      throw new NotFoundException(
        `메시지를 찾을 수 없습니다. (ID: ${messageId})`,
      );
    }

    return message;
  }

  /**
   * 방의 메시지 통계를 조회합니다.
   * @param getMessageStatsDto 메시지 통계 조회 옵션
   */
  getMessageStats(getMessageStatsDto: GetMessageStatsDto): MessageStats {
    if (!getMessageStatsDto.roomId) {
      throw new BadRequestException('방 ID가 필요합니다.');
    }

    const room = this.memoryStore.getRoom(getMessageStatsDto.roomId);
    if (!room) {
      throw new NotFoundException(
        `방을 찾을 수 없습니다. (ID: ${getMessageStatsDto.roomId})`,
      );
    }

    const stats = this.memoryStore.getMessageStats(getMessageStatsDto.roomId);
    if (!stats) {
      throw new NotFoundException(
        `방의 메시지 통계를 조회할 수 없습니다. (ID: ${getMessageStatsDto.roomId})`,
      );
    }

    return stats;
  }

  /**
   * 메시지 상태를 업데이트합니다 (읽음 확인 등).
   * @param messageId 메시지 ID
   * @param status 새로운 메시지 상태
   */
  updateMessageStatus(messageId: string, status: MessageStatus): boolean {
    if (!messageId) {
      throw new BadRequestException('메시지 ID가 필요합니다.');
    }

    const success = this.memoryStore.updateMessageStatus(messageId, status);
    if (!success) {
      throw new NotFoundException(
        `메시지를 찾을 수 없습니다. (ID: ${messageId})`,
      );
    }

    this.logger.debug(`Message ${messageId} status updated to: ${status}`);
    return true;
  }

  /**
   * 메시지를 삭제합니다 (관리자 기능).
   * @param messageId 메시지 ID
   */
  deleteMessage(messageId: string): boolean {
    if (!messageId) {
      throw new BadRequestException('메시지 ID가 필요합니다.');
    }

    const message = this.memoryStore.getMessage(messageId);
    if (!message) {
      throw new NotFoundException(
        `메시지를 찾을 수 없습니다. (ID: ${messageId})`,
      );
    }

    const success = this.memoryStore.deleteMessage(messageId);
    if (success) {
      this.logger.log(`Message deleted: ${messageId}`);
    }

    return success;
  }

  /**
   * 방의 최근 메시지 목록을 간단히 조회합니다 (빠른 조회용).
   * @param roomId 방 ID
   * @param limit 조회할 메시지 수 (기본: 50)
   */
  getRecentMessages(roomId: string, limit: number = 50): Message[] {
    if (!roomId) {
      throw new BadRequestException('방 ID가 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    const messages = this.memoryStore.getRoomMessages(roomId, limit);
    this.logger.debug(
      `Retrieved ${messages.length} recent messages from room ${room.name}`,
    );

    return messages;
  }

  /**
   * 오래된 메시지들을 정리합니다 (메모리 관리).
   * @param olderThanDays 몇 일 이전 메시지를 삭제할지 (기본: 30일)
   */
  cleanOldMessages(olderThanDays: number = 30): number {
    const olderThan = new Date();
    olderThan.setDate(olderThan.getDate() - olderThanDays);

    const deletedCount = this.memoryStore.cleanOldMessages(olderThan);

    if (deletedCount > 0) {
      this.logger.log(
        `Cleaned up ${deletedCount} messages older than ${olderThanDays} days`,
      );
    }

    return deletedCount;
  }
}
