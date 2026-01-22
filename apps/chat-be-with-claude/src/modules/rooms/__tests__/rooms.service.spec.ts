import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomsService } from '../rooms.service';
import { MemoryStore, ChatRoom, User } from '../../../storage/memory-store';
import { RoomNameGenerator } from '../../../common/utils/room-name-generator';
import { v4 as uuidv4 } from 'uuid';

// UUID 모킹
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-room-id-1234'),
}));

describe('RoomsService', () => {
  let service: RoomsService;
  let memoryStore: MemoryStore;

  // 테스트 데이터
  const mockUser1: User = {
    id: 'user-1',
    nickname: '귀여운펭귄',
    connectedAt: new Date('2026-01-22T10:00:00Z'),
    socketId: 'socket-1',
  };

  const mockUser2: User = {
    id: 'user-2',
    nickname: '멋진사자',
    connectedAt: new Date('2026-01-22T10:01:00Z'),
    socketId: 'socket-2',
  };

  const mockRoom1: ChatRoom = {
    id: 'room-1',
    name: '채팅방 #001',
    createdAt: new Date('2026-01-22T10:00:00Z'),
    lastActivity: new Date('2026-01-22T10:30:00Z'),
    participants: [mockUser1, mockUser2],
    messages: [],
  };

  const mockRoom2: ChatRoom = {
    id: 'room-2',
    name: '채팅방 #002',
    createdAt: new Date('2026-01-22T10:05:00Z'),
    lastActivity: new Date('2026-01-22T10:25:00Z'),
    participants: [mockUser1],
    messages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, MemoryStore],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    memoryStore = module.get<MemoryStore>(MemoryStore);

    // 테스트 데이터 준비
    memoryStore.createUser(mockUser1);
    memoryStore.createUser(mockUser2);
  });

  afterEach(() => {
    memoryStore.clear();
  });

  describe('getAllRooms', () => {
    it('should return all rooms sorted by last activity', async () => {
      memoryStore.createRoom(mockRoom1);
      memoryStore.createRoom(mockRoom2);

      const result = await service.getAllRooms();

      expect(result.rooms).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.timestamp).toBeDefined();

      // 최신 활동 순으로 정렬되어야 함 (mockRoom1이 더 최근)
      expect(result.rooms[0].name).toBe('채팅방 #001');
      expect(result.rooms[1].name).toBe('채팅방 #002');

      // 첫 번째 방 검증
      expect(result.rooms[0]).toMatchObject({
        id: 'room-1',
        name: '채팅방 #001',
        participantCount: 2,
        maxParticipants: 5,
        participantNicknames: ['귀여운펭귄', '멋진사자'],
        isFull: false,
      });
    });

    it('should return empty list when no rooms exist', async () => {
      const result = await service.getAllRooms();

      expect(result.rooms).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getRoomById', () => {
    beforeEach(() => {
      memoryStore.createRoom(mockRoom1);
    });

    it('should return room details for valid room ID', async () => {
      const result = await service.getRoomById('room-1');

      expect(result).toMatchObject({
        id: 'room-1',
        name: '채팅방 #001',
        participantCount: 2,
        maxParticipants: 5,
        createdBy: 'user-1', // 첫 번째 참여자가 생성자로 간주
      });

      expect(result.participants).toHaveLength(2);
      expect(result.participants[0]).toMatchObject({
        id: 'user-1',
        nickname: '귀여운펭귄',
        isConnected: true,
      });
    });

    it('should include current user information when provided', async () => {
      const result = await service.getRoomById('room-1', 'user-1');

      expect(result.isCurrentUserParticipant).toBe(true);
      expect(result.isCurrentUserCreator).toBe(true);
    });

    it('should return false for current user flags when user is not participant', async () => {
      const result = await service.getRoomById('room-1', 'non-participant');

      expect(result.isCurrentUserParticipant).toBe(false);
      expect(result.isCurrentUserCreator).toBe(false);
    });

    it('should throw BadRequestException for empty room ID', async () => {
      await expect(service.getRoomById('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent room', async () => {
      await expect(service.getRoomById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRoom', () => {
    it('should create a new room successfully', async () => {
      const result = await service.createRoom('user-1');

      expect(result).toMatchObject({
        roomId: 'test-room-id-1234',
        roomName: '채팅방 #001',
        success: true,
        message: '채팅방 #001이 생성되었습니다.',
      });
      expect(result.createdAt).toBeDefined();

      // 방이 실제로 생성되었는지 확인
      const createdRoom = memoryStore.getRoom('test-room-id-1234');
      expect(createdRoom).toBeDefined();
      expect(createdRoom?.participants).toHaveLength(1);
      expect(createdRoom?.participants[0].id).toBe('user-1');
    });

    it('should generate next available room name', async () => {
      // 기존 방들 생성
      memoryStore.createRoom({ ...mockRoom1, name: '채팅방 #001' });
      memoryStore.createRoom({ ...mockRoom2, name: '채팅방 #003' });

      const result = await service.createRoom('user-2');

      expect(result.roomName).toBe('채팅방 #002'); // #002가 비어있으므로 이것이 할당됨
    });

    it('should throw BadRequestException for empty creator ID', async () => {
      await expect(service.createRoom('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent creator', async () => {
      await expect(service.createRoom('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when all room numbers are used', async () => {
      // RoomNameGenerator의 generateNextAvailableRoomName을 모킹하여 null 반환
      jest.spyOn(RoomNameGenerator, 'generateNextAvailableRoomName').mockReturnValue(null);

      await expect(service.createRoom('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addUserToRoom', () => {
    beforeEach(() => {
      memoryStore.createRoom({ ...mockRoom1, participants: [mockUser1] });
    });

    it('should add user to room successfully', async () => {
      const result = await service.addUserToRoom('room-1', 'user-2');

      expect(result).toBe(true);

      const room = memoryStore.getRoom('room-1');
      expect(room?.participants).toHaveLength(2);
      expect(room?.participants.some(p => p.id === 'user-2')).toBe(true);
    });

    it('should return false when user is already in room', async () => {
      const result = await service.addUserToRoom('room-1', 'user-1');

      expect(result).toBe(false);
    });

    it('should throw BadRequestException when room is full', async () => {
      // 방을 가득 채우기 (5명)
      const fullRoom = {
        ...mockRoom1,
        participants: [
          mockUser1,
          mockUser2,
          { ...mockUser1, id: 'user-3', nickname: 'user3' },
          { ...mockUser1, id: 'user-4', nickname: 'user4' },
          { ...mockUser1, id: 'user-5', nickname: 'user5' },
        ],
      };
      memoryStore.updateRoom('room-1', fullRoom);

      // 추가 사용자 생성
      const extraUser = { ...mockUser1, id: 'user-6', nickname: 'user6' };
      memoryStore.createUser(extraUser);

      await expect(service.addUserToRoom('room-1', 'user-6')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid parameters', async () => {
      await expect(service.addUserToRoom('', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.addUserToRoom('room-1', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent room or user', async () => {
      await expect(service.addUserToRoom('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.addUserToRoom('room-1', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUserFromRoom', () => {
    beforeEach(() => {
      memoryStore.createRoom(mockRoom1);
    });

    it('should remove user from room successfully', async () => {
      const result = await service.removeUserFromRoom('room-1', 'user-2');

      expect(result).toBe(true);

      const room = memoryStore.getRoom('room-1');
      expect(room?.participants).toHaveLength(1);
      expect(room?.participants.some(p => p.id === 'user-2')).toBe(false);
    });

    it('should delete room when last user leaves', async () => {
      // 먼저 한 명을 제거
      await service.removeUserFromRoom('room-1', 'user-2');

      // 마지막 사용자 제거
      await service.removeUserFromRoom('room-1', 'user-1');

      // 방이 삭제되었는지 확인
      const room = memoryStore.getRoom('room-1');
      expect(room).toBeUndefined();
    });

    it('should throw BadRequestException for invalid parameters', async () => {
      await expect(service.removeUserFromRoom('', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.removeUserFromRoom('room-1', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent room', async () => {
      await expect(service.removeUserFromRoom('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserCurrentRoom', () => {
    beforeEach(() => {
      memoryStore.createRoom(mockRoom1);
    });

    it('should return current room for user', async () => {
      const result = await service.getUserCurrentRoom('user-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('room-1');
      expect(result?.name).toBe('채팅방 #001');
    });

    it('should return null when user is not in any room', async () => {
      const result = await service.getUserCurrentRoom('user-not-in-room');

      expect(result).toBeNull();
    });

    it('should throw BadRequestException for empty user ID', async () => {
      await expect(service.getUserCurrentRoom('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cleanupEmptyRooms', () => {
    it('should remove empty rooms', async () => {
      memoryStore.createRoom({ ...mockRoom1, participants: [] });
      memoryStore.createRoom(mockRoom2);

      const deletedCount = await service.cleanupEmptyRooms();

      expect(deletedCount).toBe(1);
      expect(memoryStore.getRoom('room-1')).toBeUndefined();
      expect(memoryStore.getRoom('room-2')).toBeDefined();
    });

    it('should return 0 when no empty rooms exist', async () => {
      memoryStore.createRoom(mockRoom1);

      const deletedCount = await service.cleanupEmptyRooms();

      expect(deletedCount).toBe(0);
    });
  });

  describe('getRoomStats', () => {
    it('should return correct room statistics', async () => {
      memoryStore.createRoom(mockRoom1); // 2명 참여
      memoryStore.createRoom({ ...mockRoom2, participants: [] }); // 빈 방

      const stats = await service.getRoomStats();

      expect(stats).toEqual({
        totalRooms: 2,
        activeRooms: 1,
        fullRooms: 0,
        totalParticipants: 2,
        averageParticipantsPerRoom: 1,
      });
    });

    it('should handle empty room list', async () => {
      const stats = await service.getRoomStats();

      expect(stats).toEqual({
        totalRooms: 0,
        activeRooms: 0,
        fullRooms: 0,
        totalParticipants: 0,
        averageParticipantsPerRoom: 0,
      });
    });
  });
});