import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../../storage/memory-store';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';

/**
 * 채팅 관련 비즈니스 로직 서비스
 *
 * 방 참여자 관리, 메시지 처리, Socket 연결 관리 등의 기능을 담당합니다.
 * User Story 5: 기존 채팅방 참여 기능의 참여자 관리를 구현합니다.
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly memoryStore: MemoryStore,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

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
      participants: room.participants.map(p => ({
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

    const participant = room.participants.find(p => p.id === userId);
    if (!participant) {
      throw new NotFoundException(`방에서 해당 사용자를 찾을 수 없습니다. (사용자 ID: ${userId})`);
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

      return room.participants.some(p => p.id === userId);
    } catch (error) {
      this.logger.warn(`Error checking if user ${userId} is in room ${roomId}:`, error);
      return false;
    }
  }

  /**
   * 방의 연결된 참여자들에게 브로드캐스트할 Socket ID 목록을 조회합니다.
   * @param roomId 방 ID
   * @param excludeSocketId 제외할 Socket ID (선택적)
   */
  getRoomConnectedSocketIds(roomId: string, excludeSocketId?: string): string[] {
    try {
      const room = this.memoryStore.getRoom(roomId);
      if (!room) {
        return [];
      }

      return room.participants
        .filter(p => p.socketId && p.socketId !== excludeSocketId)
        .map(p => p.socketId as string);
    } catch (error) {
      this.logger.error(`Error getting connected socket IDs for room ${roomId}:`, error);
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

      const connectedParticipants = room.participants.filter(p => !!p.socketId);
      const disconnectedParticipants = room.participants.filter(p => !p.socketId);

      return {
        roomId: room.id,
        roomName: room.name,
        totalParticipants: room.participants.length,
        connectedParticipants: connectedParticipants.length,
        disconnectedParticipants: disconnectedParticipants.length,
        maxParticipants: 5, // RoomsService.MAX_PARTICIPANTS와 동기화
        isFull: room.participants.length >= 5,
        connectionRate: room.participants.length > 0
          ? Math.round((connectedParticipants.length / room.participants.length) * 100)
          : 0,
      };
    } catch (error) {
      this.logger.error(`Error getting participant stats for room ${roomId}:`, error);
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
        this.logger.warn(`Cannot update socket connection for non-existent user: ${userId}`);
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
      rooms.forEach(room => {
        const participant = room.participants.find(p => p.id === userId);
        if (participant) {
          participant.socketId = socketId || undefined;
          this.logger.debug(
            `Updated socket ID for user ${user.nickname} in room ${room.name}: ${socketId || 'disconnected'}`
          );
        }
      });
    } catch (error) {
      this.logger.error(`Error updating socket connection for user ${userId}:`, error);
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
        const isParticipant = room.participants.some(p => p.id === userId);
        if (isParticipant) {
          try {
            const success = this.roomsService.removeUserFromRoom(room.id, userId);
            if (success) {
              removedFromRooms.push(room.name);
              this.logger.log(`Removed disconnected user ${userId} from room ${room.name}`);
            }
          } catch (error) {
            this.logger.error(`Failed to remove user ${userId} from room ${room.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error removing disconnected user ${userId} from rooms:`, error);
    }

    return removedFromRooms;
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
}