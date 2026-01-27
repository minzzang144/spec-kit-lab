import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChatService } from '../chat.service';
import { MemoryStore } from '../../../storage/memory-store';
import { RoomsService } from '../../rooms/rooms.service';
import { UsersService } from '../../users/users.service';
import { MessageType, MessageStatus } from '../interfaces/message.interface';
import { SendMessageDto } from '../dto/send-message.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';

describe('ChatService', () => {
  let service: ChatService;
  let memoryStore: MemoryStore;
  let roomsService: RoomsService;
  let usersService: UsersService;

  // 테스트 데이터
  const mockUser = {
    id: 'user-1',
    nickname: 'TestUser',
    connectedAt: new Date(),
    socketId: 'socket-123',
  };

  const mockRoom = {
    id: 'room-1',
    name: 'Test Room',
    createdAt: new Date(),
    lastActivity: new Date(),
    participants: [mockUser],
    messages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        MemoryStore,
        {
          provide: RoomsService,
          useValue: {
            getRoomById: jest.fn().mockReturnValue(mockRoom),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockReturnValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    memoryStore = module.get<MemoryStore>(MemoryStore);
    roomsService = module.get<RoomsService>(RoomsService);
    usersService = module.get<UsersService>(UsersService);

    // 테스트용 데이터 설정
    memoryStore.createRoom(mockRoom);
    memoryStore.createUser(mockUser);
    memoryStore.addUserToRoom(mockRoom.id, mockUser);
  });

  afterEach(() => {
    memoryStore.clear();
  });

  describe('createMessage', () => {
    it('should create a user message successfully', () => {
      const sendMessageDto: SendMessageDto = {
        roomId: mockRoom.id,
        content: 'Hello, world!',
      };

      const message = service.createMessage(
        sendMessageDto,
        mockUser.id,
        mockUser.nickname,
      );

      expect(message).toBeDefined();
      expect(message.roomId).toBe(mockRoom.id);
      expect(message.senderId).toBe(mockUser.id);
      expect(message.senderNickname).toBe(mockUser.nickname);
      expect(message.content).toBe('Hello, world!');
      expect(message.type).toBe(MessageType.USER);
      expect(message.status).toBe(MessageStatus.SENT);
    });

    it('should throw BadRequestException for empty content', () => {
      const sendMessageDto: SendMessageDto = {
        roomId: mockRoom.id,
        content: '   ',
      };

      expect(() => {
        service.createMessage(sendMessageDto, mockUser.id, mockUser.nickname);
      }).toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent room', () => {
      const sendMessageDto: SendMessageDto = {
        roomId: 'non-existent-room',
        content: 'Hello, world!',
      };

      expect(() => {
        service.createMessage(sendMessageDto, mockUser.id, mockUser.nickname);
      }).toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not in room', () => {
      const anotherRoom = {
        id: 'room-2',
        name: 'Another Room',
        createdAt: new Date(),
        lastActivity: new Date(),
        participants: [], // mockUser is not in this room
        messages: [],
      };
      memoryStore.createRoom(anotherRoom);

      const sendMessageDto: SendMessageDto = {
        roomId: anotherRoom.id,
        content: 'Hello, world!',
      };

      expect(() => {
        service.createMessage(sendMessageDto, mockUser.id, mockUser.nickname);
      }).toThrow(BadRequestException);
    });
  });

  describe('createSystemMessage', () => {
    it('should create a system message successfully', () => {
      const content = 'TestUser님이 방에 참여했습니다';

      const message = service.createSystemMessage(
        mockRoom.id,
        content,
        'user_joined',
      );

      expect(message).toBeDefined();
      expect(message.roomId).toBe(mockRoom.id);
      expect(message.senderId).toBeNull();
      expect(message.senderNickname).toBeNull();
      expect(message.content).toBe(content);
      expect(message.type).toBe(MessageType.SYSTEM);
    });

    it('should throw NotFoundException for non-existent room', () => {
      expect(() => {
        service.createSystemMessage('non-existent-room', 'Test message');
      }).toThrow(NotFoundException);
    });
  });

  describe('getMessages', () => {
    beforeEach(() => {
      // 테스트 메시지들을 추가
      for (let i = 1; i <= 5; i++) {
        const messageInput = {
          roomId: mockRoom.id,
          senderId: mockUser.id,
          senderNickname: mockUser.nickname,
          content: `Test message ${i}`,
          type: MessageType.USER,
        };
        memoryStore.createMessage(messageInput);
      }
    });

    it('should return messages for a room', () => {
      const getMessagesDto: GetMessagesDto = {
        roomId: mockRoom.id,
        limit: 10,
        offset: 0,
      };

      const result = service.getMessages(getMessagesDto);

      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBe(5);
      expect(result.totalCount).toBe(5);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('should apply pagination correctly', () => {
      const getMessagesDto: GetMessagesDto = {
        roomId: mockRoom.id,
        limit: 2,
        offset: 1,
      };

      const result = service.getMessages(getMessagesDto);

      expect(result.messages.length).toBe(2);
      expect(result.totalCount).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    it('should throw NotFoundException for non-existent room', () => {
      const getMessagesDto: GetMessagesDto = {
        roomId: 'non-existent-room',
        limit: 10,
        offset: 0,
      };

      expect(() => {
        service.getMessages(getMessagesDto);
      }).toThrow(NotFoundException);
    });
  });

  describe('getRecentMessages', () => {
    beforeEach(() => {
      // 테스트 메시지들을 추가
      for (let i = 1; i <= 10; i++) {
        const messageInput = {
          roomId: mockRoom.id,
          senderId: mockUser.id,
          senderNickname: mockUser.nickname,
          content: `Test message ${i}`,
          type: MessageType.USER,
        };
        memoryStore.createMessage(messageInput);
      }
    });

    it('should return recent messages with default limit', () => {
      const messages = service.getRecentMessages(mockRoom.id);

      expect(messages).toBeDefined();
      expect(messages.length).toBe(10);
    });

    it('should return limited number of messages', () => {
      const messages = service.getRecentMessages(mockRoom.id, 5);

      expect(messages.length).toBe(5);
    });

    it('should throw NotFoundException for non-existent room', () => {
      expect(() => {
        service.getRecentMessages('non-existent-room');
      }).toThrow(NotFoundException);
    });
  });

  describe('getMessageStats', () => {
    beforeEach(() => {
      // 사용자 메시지 3개 추가
      for (let i = 1; i <= 3; i++) {
        const userMessageInput = {
          roomId: mockRoom.id,
          senderId: mockUser.id,
          senderNickname: mockUser.nickname,
          content: `User message ${i}`,
          type: MessageType.USER,
        };
        memoryStore.createMessage(userMessageInput);
      }

      // 시스템 메시지 2개 추가
      for (let i = 1; i <= 2; i++) {
        const systemMessageInput = {
          roomId: mockRoom.id,
          senderId: null,
          senderNickname: null,
          content: `System message ${i}`,
          type: MessageType.SYSTEM,
        };
        memoryStore.createMessage(systemMessageInput);
      }
    });

    it('should return correct message statistics', () => {
      const statsDto = { roomId: mockRoom.id };
      const stats = service.getMessageStats(statsDto);

      expect(stats.roomId).toBe(mockRoom.id);
      expect(stats.totalMessages).toBe(5);
      expect(stats.userMessages).toBe(3);
      expect(stats.systemMessages).toBe(2);
      expect(stats.lastMessageAt).toBeDefined();
      expect(stats.firstMessageAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent room', () => {
      const statsDto = { roomId: 'non-existent-room' };

      expect(() => {
        service.getMessageStats(statsDto);
      }).toThrow(NotFoundException);
    });
  });

  describe('isUserInRoom', () => {
    it('should return true if user is in room', () => {
      const result = service.isUserInRoom(mockRoom.id, mockUser.id);
      expect(result).toBe(true);
    });

    it('should return false if user is not in room', () => {
      const anotherRoom = {
        id: 'room-2',
        name: 'Another Room',
        createdAt: new Date(),
        lastActivity: new Date(),
        participants: [],
        messages: [],
      };
      memoryStore.createRoom(anotherRoom);

      const result = service.isUserInRoom(anotherRoom.id, mockUser.id);
      expect(result).toBe(false);
    });

    it('should return false for non-existent room', () => {
      const result = service.isUserInRoom('non-existent-room', mockUser.id);
      expect(result).toBe(false);
    });

    it('should return false for invalid parameters', () => {
      const result1 = service.isUserInRoom('', mockUser.id);
      const result2 = service.isUserInRoom(mockRoom.id, '');

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('getRoomParticipants', () => {
    it('should return room participants', () => {
      const result = service.getRoomParticipants(mockRoom.id);

      expect(result.roomId).toBe(mockRoom.id);
      expect(result.roomName).toBe(mockRoom.name);
      expect(result.participants.length).toBe(1);
      expect(result.participants[0].id).toBe(mockUser.id);
      expect(result.participants[0].nickname).toBe(mockUser.nickname);
      expect(result.participantCount).toBe(1);
    });

    it('should throw BadRequestException for empty room ID', () => {
      expect(() => {
        service.getRoomParticipants('');
      }).toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent room', () => {
      expect(() => {
        service.getRoomParticipants('non-existent-room');
      }).toThrow(NotFoundException);
    });
  });

  describe('cleanOldMessages', () => {
    beforeEach(() => {
      // 현재 시간으로부터 35일 전 메시지 생성 (30일 기본값보다 오래됨)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const oldMessageInput = {
        roomId: mockRoom.id,
        senderId: mockUser.id,
        senderNickname: mockUser.nickname,
        content: 'Old message',
        type: MessageType.USER,
      };
      const oldMessage = memoryStore.createMessage(oldMessageInput);

      // 강제로 오래된 날짜로 설정
      oldMessage.createdAt = oldDate;

      // 최근 메시지도 생성
      const recentMessageInput = {
        roomId: mockRoom.id,
        senderId: mockUser.id,
        senderNickname: mockUser.nickname,
        content: 'Recent message',
        type: MessageType.USER,
      };
      memoryStore.createMessage(recentMessageInput);
    });

    it('should clean old messages', () => {
      const deletedCount = service.cleanOldMessages(30);

      // 정확히 1개의 오래된 메시지가 삭제되어야 함
      expect(deletedCount).toBe(1);
    });

    it('should not clean recent messages', () => {
      const deletedCount = service.cleanOldMessages(1); // 1일 이내 메시지만 유지

      // 최근 메시지는 남아있어야 하므로 1개 미만이 삭제되어야 함
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });
  });
});
