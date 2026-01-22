import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomsController } from '../rooms.controller';
import { RoomsService } from '../rooms.service';
import {
  ChatRoomListResponseDto,
  ChatRoomDetailResponseDto,
  CreateRoomResponseDto,
  ChatRoomDto,
} from '../dto';

describe('RoomsController', () => {
  let controller: RoomsController;
  let roomsService: RoomsService;

  // Mock data
  const mockRoomListResponse: ChatRoomListResponseDto = {
    rooms: [
      {
        id: 'room-1',
        name: '채팅방 #001',
        participantCount: 2,
        maxParticipants: 5,
        participantNicknames: ['귀여운펭귄', '멋진사자'],
        isFull: false,
        lastActivity: new Date('2026-01-22T10:30:00Z'),
      },
    ],
    totalCount: 1,
    timestamp: new Date('2026-01-22T10:30:00Z'),
  };

  const mockRoomDetail: ChatRoomDetailResponseDto = {
    id: 'room-1',
    name: '채팅방 #001',
    participants: [
      {
        id: 'user-1',
        nickname: '귀여운펭귄',
        createdAt: new Date('2026-01-22T10:00:00Z'),
        isConnected: true,
      },
    ],
    participantCount: 1,
    maxParticipants: 5,
    createdAt: new Date('2026-01-22T10:00:00Z'),
    lastActivity: new Date('2026-01-22T10:30:00Z'),
    createdBy: 'user-1',
    isCurrentUserParticipant: true,
    isCurrentUserCreator: true,
  };

  const mockCreateRoomResponse: CreateRoomResponseDto = {
    roomId: 'new-room-id',
    roomName: '채팅방 #002',
    success: true,
    message: '채팅방 #002이 생성되었습니다.',
    createdAt: new Date('2026-01-22T10:35:00Z'),
  };

  const mockCurrentRoom: ChatRoomDto = {
    id: 'room-1',
    name: '채팅방 #001',
    participants: [
      {
        id: 'user-1',
        nickname: '귀여운펭귄',
        createdAt: new Date('2026-01-22T10:00:00Z'),
        isConnected: true,
      },
    ],
    participantCount: 1,
    maxParticipants: 5,
    createdAt: new Date('2026-01-22T10:00:00Z'),
    lastActivity: new Date('2026-01-22T10:30:00Z'),
    createdBy: 'user-1',
  };

  const mockRoomStats = {
    totalRooms: 5,
    activeRooms: 4,
    fullRooms: 1,
    totalParticipants: 15,
    averageParticipantsPerRoom: 3.0,
  };

  beforeEach(async () => {
    const mockRoomsService = {
      getAllRooms: jest.fn(),
      getRoomById: jest.fn(),
      createRoom: jest.fn(),
      addUserToRoom: jest.fn(),
      removeUserFromRoom: jest.fn(),
      getUserCurrentRoom: jest.fn(),
      getRoomStats: jest.fn(),
      cleanupEmptyRooms: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    roomsService = module.get<RoomsService>(RoomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('should return all rooms successfully', async () => {
      jest.spyOn(roomsService, 'getAllRooms').mockResolvedValue(mockRoomListResponse);

      const result = await controller.getAllRooms();

      expect(result).toEqual(mockRoomListResponse);
      expect(roomsService.getAllRooms).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(roomsService, 'getAllRooms').mockRejectedValue(error);

      await expect(controller.getAllRooms()).rejects.toThrow(error);
    });
  });

  describe('getRoomById', () => {
    it('should return room details successfully', async () => {
      jest.spyOn(roomsService, 'getRoomById').mockResolvedValue(mockRoomDetail);

      const result = await controller.getRoomById('room-1', 'user-1');

      expect(result).toEqual(mockRoomDetail);
      expect(roomsService.getRoomById).toHaveBeenCalledWith('room-1', 'user-1');
    });

    it('should return room details without current user info', async () => {
      const roomDetailWithoutUser = { ...mockRoomDetail, isCurrentUserParticipant: undefined };
      jest.spyOn(roomsService, 'getRoomById').mockResolvedValue(roomDetailWithoutUser);

      const result = await controller.getRoomById('room-1');

      expect(result).toEqual(roomDetailWithoutUser);
      expect(roomsService.getRoomById).toHaveBeenCalledWith('room-1', undefined);
    });

    it('should handle not found errors', async () => {
      const error = new NotFoundException('방을 찾을 수 없습니다.');
      jest.spyOn(roomsService, 'getRoomById').mockRejectedValue(error);

      await expect(controller.getRoomById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRoom', () => {
    it('should create room successfully', async () => {
      jest.spyOn(roomsService, 'createRoom').mockResolvedValue(mockCreateRoomResponse);

      const result = await controller.createRoom('user-1', {});

      expect(result).toEqual(mockCreateRoomResponse);
      expect(roomsService.createRoom).toHaveBeenCalledWith('user-1');
    });

    it('should create room with creator nickname', async () => {
      jest.spyOn(roomsService, 'createRoom').mockResolvedValue(mockCreateRoomResponse);

      const createRoomDto = { creatorNickname: '귀여운펭귄' };
      const result = await controller.createRoom('user-1', createRoomDto);

      expect(result).toEqual(mockCreateRoomResponse);
      expect(roomsService.createRoom).toHaveBeenCalledWith('user-1');
    });

    it('should throw BadRequestException when creatorId is missing', async () => {
      await expect(controller.createRoom('', {})).rejects.toThrow(BadRequestException);
      expect(roomsService.createRoom).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('사용자를 찾을 수 없습니다.');
      jest.spyOn(roomsService, 'createRoom').mockRejectedValue(error);

      await expect(controller.createRoom('user-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('addUserToRoom', () => {
    it('should add user to room successfully', async () => {
      jest.spyOn(roomsService, 'addUserToRoom').mockResolvedValue(true);

      const result = await controller.addUserToRoom('room-1', 'user-1');

      expect(result).toEqual({
        success: true,
        message: '채팅방에 참여했습니다.',
      });
      expect(roomsService.addUserToRoom).toHaveBeenCalledWith('room-1', 'user-1');
    });

    it('should handle when user is already in room', async () => {
      jest.spyOn(roomsService, 'addUserToRoom').mockResolvedValue(false);

      const result = await controller.addUserToRoom('room-1', 'user-1');

      expect(result).toEqual({
        success: false,
        message: '이미 채팅방에 참여 중입니다.',
      });
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.addUserToRoom('room-1', '')).rejects.toThrow(BadRequestException);
      expect(roomsService.addUserToRoom).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('방이 가득 찼습니다.');
      jest.spyOn(roomsService, 'addUserToRoom').mockRejectedValue(error);

      await expect(controller.addUserToRoom('room-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeUserFromRoom', () => {
    it('should remove user from room successfully', async () => {
      jest.spyOn(roomsService, 'removeUserFromRoom').mockResolvedValue(true);
      jest.spyOn(roomsService, 'getRoomById').mockResolvedValue(mockRoomDetail);

      const result = await controller.removeUserFromRoom('room-1', 'user-1');

      expect(result).toEqual({
        success: true,
        message: '채팅방에서 나갔습니다.',
        roomDeleted: false,
      });
      expect(roomsService.removeUserFromRoom).toHaveBeenCalledWith('room-1', 'user-1');
      expect(roomsService.getRoomById).toHaveBeenCalledWith('room-1');
    });

    it('should handle room deletion when last user leaves', async () => {
      jest.spyOn(roomsService, 'removeUserFromRoom').mockResolvedValue(true);
      jest.spyOn(roomsService, 'getRoomById').mockRejectedValue(new NotFoundException());

      const result = await controller.removeUserFromRoom('room-1', 'user-1');

      expect(result).toEqual({
        success: true,
        message: '채팅방에서 나갔고, 빈 방이 삭제되었습니다.',
        roomDeleted: true,
      });
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.removeUserFromRoom('room-1', '')).rejects.toThrow(BadRequestException);
      expect(roomsService.removeUserFromRoom).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('방을 찾을 수 없습니다.');
      jest.spyOn(roomsService, 'removeUserFromRoom').mockRejectedValue(error);

      await expect(controller.removeUserFromRoom('room-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserCurrentRoom', () => {
    it('should return user current room', async () => {
      jest.spyOn(roomsService, 'getUserCurrentRoom').mockResolvedValue(mockCurrentRoom);

      const result = await controller.getUserCurrentRoom('user-1');

      expect(result).toEqual(mockCurrentRoom);
      expect(roomsService.getUserCurrentRoom).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user is not in any room', async () => {
      jest.spyOn(roomsService, 'getUserCurrentRoom').mockResolvedValue(null);

      const result = await controller.getUserCurrentRoom('user-1');

      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('사용자 ID가 필요합니다.');
      jest.spyOn(roomsService, 'getUserCurrentRoom').mockRejectedValue(error);

      await expect(controller.getUserCurrentRoom('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRoomStats', () => {
    it('should return room statistics', async () => {
      jest.spyOn(roomsService, 'getRoomStats').mockResolvedValue(mockRoomStats);

      const result = await controller.getRoomStats();

      expect(result).toEqual(mockRoomStats);
      expect(roomsService.getRoomStats).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Statistics calculation failed');
      jest.spyOn(roomsService, 'getRoomStats').mockRejectedValue(error);

      await expect(controller.getRoomStats()).rejects.toThrow(error);
    });
  });

  describe('cleanupEmptyRooms', () => {
    it('should cleanup empty rooms successfully', async () => {
      jest.spyOn(roomsService, 'cleanupEmptyRooms').mockResolvedValue(3);

      const result = await controller.cleanupEmptyRooms();

      expect(result).toEqual({
        deletedCount: 3,
        message: '3개의 빈 방이 삭제되었습니다.',
      });
      expect(roomsService.cleanupEmptyRooms).toHaveBeenCalledTimes(1);
    });

    it('should handle when no empty rooms exist', async () => {
      jest.spyOn(roomsService, 'cleanupEmptyRooms').mockResolvedValue(0);

      const result = await controller.cleanupEmptyRooms();

      expect(result).toEqual({
        deletedCount: 0,
        message: '0개의 빈 방이 삭제되었습니다.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Cleanup operation failed');
      jest.spyOn(roomsService, 'cleanupEmptyRooms').mockRejectedValue(error);

      await expect(controller.cleanupEmptyRooms()).rejects.toThrow(error);
    });
  });
});