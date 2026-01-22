import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MemoryStore, ChatRoom } from '../../storage/memory-store';
import { RoomNameGenerator } from '../../common/utils/room-name-generator';
import {
  ChatRoomListDto,
  ChatRoomListResponseDto,
  ChatRoomDto,
  ChatRoomDetailResponseDto,
  ChatRoomParticipantDto,
  CreateRoomResponseDto,
} from './dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * 채팅방 관리 서비스
 *
 * 채팅방 생성, 조회, 삭제 및 참여자 관리를 담당합니다.
 * User Story 3: 채팅방 목록 조회 및 관리 기능을 구현합니다.
 */
@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  // 방당 최대 참여자 수 (데이터 모델 설계에 따름)
  private static readonly MAX_PARTICIPANTS = 5;

  constructor(private readonly memoryStore: MemoryStore) {}

  /**
   * 모든 채팅방 목록을 조회합니다.
   * 참여자 수, 상태 정보를 포함하여 반환합니다.
   */
  getAllRooms(): ChatRoomListResponseDto {
    try {
      const rooms = this.memoryStore.getAllRooms();

      const roomList: ChatRoomListDto[] = rooms
        .map((room) => this.mapToRoomListDto(room))
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()); // 최신 활동 순으로 정렬

      return {
        rooms: roomList,
        totalCount: roomList.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get all rooms', error);
      throw error;
    }
  }

  /**
   * 특정 채팅방의 상세 정보를 조회합니다.
   * @param roomId 조회할 방 ID
   * @param currentUserId 현재 사용자 ID (선택적)
   */
  getRoomById(
    roomId: string,
    currentUserId?: string,
  ): ChatRoomDetailResponseDto {
    if (!roomId) {
      throw new BadRequestException('방 ID가 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    const roomDto = this.mapToRoomDto(room);

    // 현재 사용자 관련 정보 추가
    let isCurrentUserParticipant = false;
    let isCurrentUserCreator = false;

    if (currentUserId) {
      isCurrentUserParticipant = room.participants.some(
        (p) => p.id === currentUserId,
      );
      // createdBy 정보는 현재 memory store에 없으므로 첫 번째 참여자를 생성자로 간주
      isCurrentUserCreator =
        room.participants.length > 0 &&
        room.participants[0].id === currentUserId;
    }

    return {
      ...roomDto,
      isCurrentUserParticipant,
      isCurrentUserCreator,
    };
  }

  /**
   * 새로운 채팅방을 생성합니다.
   * @param creatorId 방을 생성하는 사용자 ID
   */
  createRoom(creatorId: string): CreateRoomResponseDto {
    if (!creatorId) {
      throw new BadRequestException('생성자 ID가 필요합니다.');
    }

    // 생성자 사용자 확인
    const creator = this.memoryStore.getUser(creatorId);
    if (!creator) {
      throw new NotFoundException(
        `사용자를 찾을 수 없습니다. (ID: ${creatorId})`,
      );
    }

    try {
      // 기존 방 이름들을 가져와서 다음 사용 가능한 이름 생성
      const existingRooms = this.memoryStore.getAllRooms();
      const existingRoomNames = existingRooms.map((room) => room.name);

      const newRoomName =
        RoomNameGenerator.generateNextAvailableRoomName(existingRoomNames);
      if (!newRoomName) {
        throw new BadRequestException(
          '더 이상 방을 생성할 수 없습니다. (최대 999개)',
        );
      }

      // 새 방 생성
      const roomId = uuidv4();
      const now = new Date();

      const newRoom: ChatRoom = {
        id: roomId,
        name: newRoomName,
        createdAt: now,
        lastActivity: now,
        participants: [creator], // 생성자를 첫 번째 참여자로 추가
        messages: [],
      };

      // 메모리 저장소에 방 추가
      const createdRoom = this.memoryStore.createRoom(newRoom);

      this.logger.log(
        `Room created: ${newRoomName} by ${creator.nickname} (${creatorId})`,
      );

      return {
        roomId: createdRoom.id,
        roomName: createdRoom.name,
        success: true,
        message: `${newRoomName}이 생성되었습니다.`,
        createdAt: createdRoom.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create room for user ${creatorId}`, error);
      throw error;
    }
  }

  /**
   * 사용자를 채팅방에 추가합니다.
   * @param roomId 방 ID
   * @param userId 참여할 사용자 ID
   */
  addUserToRoom(roomId: string, userId: string): boolean {
    if (!roomId || !userId) {
      throw new BadRequestException('방 ID와 사용자 ID가 모두 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    const user = this.memoryStore.getUser(userId);
    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. (ID: ${userId})`);
    }

    // 이미 참여 중인지 확인
    const isAlreadyParticipant = room.participants.some((p) => p.id === userId);
    if (isAlreadyParticipant) {
      this.logger.warn(`User ${userId} is already in room ${roomId}`);
      return false;
    }

    // 방 인원 제한 확인
    if (room.participants.length >= RoomsService.MAX_PARTICIPANTS) {
      throw new BadRequestException(
        `방이 가득 찼습니다. (최대 ${RoomsService.MAX_PARTICIPANTS}명)`,
      );
    }

    try {
      const success = this.memoryStore.addUserToRoom(roomId, user);
      if (success) {
        this.logger.log(`User ${user.nickname} joined room ${room.name}`);
      }
      return success;
    } catch (error) {
      this.logger.error(
        `Failed to add user ${userId} to room ${roomId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 사용자를 채팅방에서 제거합니다.
   * @param roomId 방 ID
   * @param userId 제거할 사용자 ID
   */
  removeUserFromRoom(roomId: string, userId: string): boolean {
    if (!roomId || !userId) {
      throw new BadRequestException('방 ID와 사용자 ID가 모두 필요합니다.');
    }

    const room = this.memoryStore.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`방을 찾을 수 없습니다. (ID: ${roomId})`);
    }

    try {
      const success = this.memoryStore.removeUserFromRoom(roomId, userId);
      if (success) {
        const user = this.memoryStore.getUser(userId);
        this.logger.log(
          `User ${user?.nickname || userId} left room ${room.name}`,
        );

        // 방이 비어있으면 자동 삭제 (User Story 6 구현 예정이지만 기본 로직 추가)
        const updatedRoom = this.memoryStore.getRoom(roomId);
        if (updatedRoom && updatedRoom.participants.length === 0) {
          this.memoryStore.deleteRoom(roomId);
          this.logger.log(`Empty room deleted: ${room.name} (${roomId})`);
        }
      }
      return success;
    } catch (error) {
      this.logger.error(
        `Failed to remove user ${userId} from room ${roomId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 사용자가 현재 참여 중인 방을 조회합니다.
   * @param userId 사용자 ID
   */
  getUserCurrentRoom(userId: string): ChatRoomDto | null {
    if (!userId) {
      throw new BadRequestException('사용자 ID가 필요합니다.');
    }

    const rooms = this.memoryStore.getAllRooms();
    const currentRoom = rooms.find((room) =>
      room.participants.some((p) => p.id === userId),
    );

    return currentRoom ? this.mapToRoomDto(currentRoom) : null;
  }

  /**
   * 빈 방들을 정리합니다.
   */
  cleanupEmptyRooms(): number {
    try {
      const beforeCount = this.memoryStore.getAllRooms().length;
      this.memoryStore.cleanupEmptyRooms();
      const afterCount = this.memoryStore.getAllRooms().length;
      const deletedCount = beforeCount - afterCount;

      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} empty rooms`);
      }

      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup empty rooms', error);
      throw error;
    }
  }

  /**
   * 방 통계 정보를 조회합니다.
   */
  getRoomStats(): {
    totalRooms: number;
    activeRooms: number;
    fullRooms: number;
    totalParticipants: number;
    averageParticipantsPerRoom: number;
  } {
    const rooms = this.memoryStore.getAllRooms();
    const activeRooms = rooms.filter((room) => room.participants.length > 0);
    const fullRooms = rooms.filter(
      (room) => room.participants.length >= RoomsService.MAX_PARTICIPANTS,
    );
    const totalParticipants = rooms.reduce(
      (sum, room) => sum + room.participants.length,
      0,
    );

    return {
      totalRooms: rooms.length,
      activeRooms: activeRooms.length,
      fullRooms: fullRooms.length,
      totalParticipants,
      averageParticipantsPerRoom:
        rooms.length > 0 ? totalParticipants / rooms.length : 0,
    };
  }

  // Private helper methods

  /**
   * ChatRoom을 ChatRoomListDto로 변환합니다.
   */
  private mapToRoomListDto(room: ChatRoom): ChatRoomListDto {
    return {
      id: room.id,
      name: room.name,
      participantCount: room.participants.length,
      maxParticipants: RoomsService.MAX_PARTICIPANTS,
      participantNicknames: room.participants.map((p) => p.nickname),
      isFull: room.participants.length >= RoomsService.MAX_PARTICIPANTS,
      lastActivity: room.lastActivity,
    };
  }

  /**
   * ChatRoom을 ChatRoomDto로 변환합니다.
   */
  private mapToRoomDto(room: ChatRoom): ChatRoomDto {
    const participants: ChatRoomParticipantDto[] = room.participants.map(
      (p) => ({
        id: p.id,
        nickname: p.nickname,
        createdAt: p.connectedAt,
        isConnected: !!p.socketId, // socketId가 있으면 연결된 상태로 간주
      }),
    );

    return {
      id: room.id,
      name: room.name,
      participants,
      participantCount: room.participants.length,
      maxParticipants: RoomsService.MAX_PARTICIPANTS,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      createdBy: room.participants.length > 0 ? room.participants[0].id : '', // 첫 번째 참여자를 생성자로 간주
    };
  }
}
