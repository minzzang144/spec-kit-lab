import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { RoomsService } from '../rooms/rooms.service';
import { ChatService } from './chat.service';

/**
 * 실시간 채팅 Socket.IO Gateway
 * - 클라이언트 연결/해제 관리
 * - 로비 입장 및 사용자 생성
 * - Socket.IO 이벤트 처리
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/', // 기본 네임스페이스 사용
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Gateway 초기화
   */
  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
    this.server = server;
  }

  /**
   * 클라이언트 연결 처리
   */
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client connecting: ${client.id}`);

    // 연결만 하고 실제 사용자 생성은 join-lobby 이벤트에서 처리
    // 이렇게 하면 프론트엔드에서 닉네임 설정 화면을 먼저 보여줄 수 있음

    client.emit('connection-established', {
      socketId: client.id,
      timestamp: new Date().toISOString(),
      message: '서버에 연결되었습니다',
    });

    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * 클라이언트 연결 해제 처리
   */
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client disconnecting: ${client.id}`);

    try {
      // 사용자 정보 조회
      const user = this.usersService.findBySocketId(client.id);

      if (user) {
        this.logger.log(`User ${user.nickname} (${user.id}) disconnected`);

        // Socket 연결 해제
        this.usersService.disconnectUser(client.id);

        // TODO: 방에서도 제거해야 함 (추후 구현)
        // TODO: 로비 사용자들에게 알림 (추후 구현)

        // 시스템 메시지 브로드캐스트 (현재는 로그만)
        this.logger.debug(`Broadcasting user disconnect: ${user.nickname}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling disconnect for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 로비 입장 이벤트
   * 클라이언트가 닉네임을 설정하고 로비에 입장할 때 호출
   */
  @SubscribeMessage('join-lobby')
  async handleJoinLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nickname?: string },
  ) {
    try {
      this.logger.debug(`Join lobby request from ${client.id}:`, data);

      // 이미 등록된 사용자인지 확인
      const existingUser = this.usersService.findBySocketId(client.id);
      if (existingUser) {
        this.logger.warn(
          `User already exists for socket ${client.id}: ${existingUser.nickname}`,
        );

        client.emit('lobby-joined', {
          user: existingUser,
          message: '이미 로비에 입장되어 있습니다',
        });
        return;
      }

      // 새 사용자 생성
      const createUserDto = new CreateUserDto({ nickname: data.nickname });
      const user = await this.usersService.createUser(createUserDto, client.id);

      this.logger.log(`User ${user.nickname} joined lobby`);

      // 클라이언트에게 성공 응답
      client.emit('lobby-joined', {
        user,
        message: '로비에 입장했습니다',
      });

      // 로비의 모든 사용자에게 새 사용자 입장 알림
      client.broadcast.emit('user-joined-lobby', {
        user,
        message: `${user.nickname}님이 로비에 입장했습니다`,
      });

      // 현재 방 목록 전송
      this.sendLobbyUpdateToClient(client);
    } catch (error) {
      this.logger.error(
        `Error in join-lobby for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );

      client.emit('error', {
        event: 'join-lobby',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '로비 입장에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 사용자 활동 업데이트 (heartbeat)
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    try {
      const user = this.usersService.findBySocketId(client.id);
      if (user) {
        this.usersService.updateActivity(user.id);
      }

      client.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(
        `Ping error for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 현재 로비 사용자 목록 요청
   */
  @SubscribeMessage('get-lobby-users')
  handleGetLobbyUsers(@ConnectedSocket() client: Socket) {
    try {
      const connectedUsers = this.usersService.findConnected();

      client.emit('lobby-users', {
        users: connectedUsers,
        count: connectedUsers.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Error getting lobby users for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );

      client.emit('error', {
        event: 'get-lobby-users',
        message: '로비 사용자 목록 조회에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 연결 상태 확인
   */
  @SubscribeMessage('check-connection')
  handleCheckConnection(@ConnectedSocket() client: Socket) {
    const user = this.usersService.findBySocketId(client.id);

    client.emit('connection-status', {
      connected: true,
      socketId: client.id,
      user: user || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 개발/디버그용: 현재 연결된 모든 클라이언트 정보
   */
  @SubscribeMessage('debug-connections')
  async handleDebugConnections(@ConnectedSocket() client: Socket) {
    const stats = this.usersService.getStats();
    const socketCount = this.server.sockets.sockets.size;

    client.emit('debug-info', {
      server: {
        connectedSockets: socketCount,
        userStats: stats.users,
      },
      client: {
        id: client.id,
        connected: true,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 특정 소켓에게 메시지 전송 (내부 사용)
   */
  sendToSocket(socketId: string, event: string, data: any) {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * 모든 연결된 클라이언트에게 브로드캐스트 (내부 사용)
   */
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * 특정 사용자를 제외하고 브로드캐스트 (내부 사용)
   */
  broadcastExcept(excludeSocketId: string, event: string, data: any) {
    this.server.sockets.sockets.forEach((socket, id) => {
      if (id !== excludeSocketId) {
        socket.emit(event, data);
      }
    });
  }

  // === 로비 및 방 관리 이벤트들 ===

  /**
   * 로비 방 목록 요청
   */
  @SubscribeMessage('get-lobby-rooms')
  handleGetLobbyRooms(@ConnectedSocket() client: Socket) {
    try {
      this.sendLobbyUpdateToClient(client);
    } catch (error) {
      this.logger.error(
        `Error getting lobby rooms for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      client.emit('error', {
        event: 'get-lobby-rooms',
        message: '방 목록 조회에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 새 채팅방 생성
   */
  @SubscribeMessage('create-room')
  handleCreateRoom(@ConnectedSocket() client: Socket) {
    try {
      // 현재 사용자 확인
      const user = this.usersService.findBySocketId(client.id);
      if (!user) {
        client.emit('error', {
          event: 'create-room',
          message: '로비에 입장한 후 방을 생성할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이미 방에 참여 중인지 확인
      const currentRoom = this.roomsService.getUserCurrentRoom(user.id);
      if (currentRoom) {
        client.emit('error', {
          event: 'create-room',
          message: '이미 다른 방에 참여 중입니다. 먼저 방을 나가주세요',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 새 방 생성
      const result = this.roomsService.createRoom(user.id);

      this.logger.log(`Room created: ${result.roomName} by ${user.nickname}`);

      // 생성자에게 성공 응답
      client.emit('room-created', {
        room: result,
        message: '새로운 채팅방이 생성되었습니다',
        timestamp: new Date().toISOString(),
      });

      // 모든 로비 사용자에게 방 목록 업데이트 브로드캐스트
      void this.broadcastLobbyUpdate();
    } catch (error) {
      this.logger.error(
        `Error creating room for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      client.emit('error', {
        event: 'create-room',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '방 생성에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 채팅방 참여
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      // 현재 사용자 확인
      const user = this.usersService.findBySocketId(client.id);
      if (!user) {
        client.emit('error', {
          event: 'join-room',
          message: '로비에 입장한 후 방에 참여할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!data.roomId) {
        client.emit('error', {
          event: 'join-room',
          message: '방 ID가 필요합니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이미 방에 참여 중인지 확인
      const currentRoom = this.roomsService.getUserCurrentRoom(user.id);
      if (currentRoom) {
        client.emit('error', {
          event: 'join-room',
          message: '이미 다른 방에 참여 중입니다. 먼저 방을 나가주세요',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 방 참여 (User Story 5용 메서드 사용)
      const joinResult = this.roomsService.joinRoom(data.roomId, user.id);

      this.logger.log(`User ${user.nickname} joined room ${joinResult.roomName}`);

      // 참여자에게 성공 응답
      client.emit('room-joined', {
        room: joinResult,
        message: joinResult.message,
        timestamp: new Date().toISOString(),
      });

      // 방의 다른 참여자들에게 새 참여자 알림
      this.notifyRoomParticipants(
        data.roomId,
        'user-joined-room',
        {
          user,
          roomId: data.roomId,
          roomName: joinResult.roomName,
          message: `${user.nickname}님이 방에 참여했습니다`,
          timestamp: new Date().toISOString(),
        },
        client.id,
      );

      // 모든 로비 사용자에게 방 목록 업데이트
      void this.broadcastLobbyUpdate();
    } catch (error) {
      this.logger.error(
        `Error joining room for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      client.emit('error', {
        event: 'join-room',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '방 참여에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 채팅방 나가기
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      // 현재 사용자 확인
      const user = this.usersService.findBySocketId(client.id);
      if (!user) {
        client.emit('error', {
          event: 'leave-room',
          message: '로비에 입장한 후 방을 나갈 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!data.roomId) {
        client.emit('error', {
          event: 'leave-room',
          message: '방 ID가 필요합니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 방 정보 미리 조회 (삭제되기 전에)
      let roomDetails: any;
      try {
        roomDetails = this.roomsService.getRoomById(data.roomId);
      } catch {
        roomDetails = null;
      }
      const roomName: string = roomDetails?.name || '채팅방';

      // 방의 다른 참여자들에게 퇴장 알림 (제거되기 전에)
      this.notifyRoomParticipants(
        data.roomId,
        'user-left-room',
        {
          user,
          roomId: data.roomId,
          roomName,
          message: `${user.nickname}님이 방을 나갔습니다`,
          timestamp: new Date().toISOString(),
        },
        client.id,
      );

      // 방에서 사용자 제거
      this.roomsService.removeUserFromRoom(data.roomId, user.id);

      // 방이 삭제되었는지 확인
      let roomStillExists: any;
      try {
        roomStillExists = this.roomsService.getRoomById(data.roomId);
      } catch {
        roomStillExists = null;
      }
      const roomDeleted: boolean = !roomStillExists;

      this.logger.log(
        `User ${user.nickname} left room ${roomName}${roomDeleted ? ' (room deleted)' : ''}`,
      );

      // 사용자에게 성공 응답
      client.emit('room-left', {
        roomId: data.roomId,
        roomName,
        roomDeleted,
        message: roomDeleted
          ? `${roomName}을 나갔고, 빈 방이 삭제되었습니다`
          : `${roomName}을 나갔습니다`,
        timestamp: new Date().toISOString(),
      });

      // 모든 로비 사용자에게 방 목록 업데이트
      void this.broadcastLobbyUpdate();
    } catch (error) {
      this.logger.error(
        `Error leaving room for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      client.emit('error', {
        event: 'leave-room',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '방 나가기에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // === 내부 헬퍼 메서드들 ===

  /**
   * 특정 클라이언트에게 로비 업데이트 전송
   */
  private sendLobbyUpdateToClient(client: Socket) {
    try {
      const roomsResponse = this.roomsService.getAllRooms();

      client.emit('lobby-update', {
        rooms: roomsResponse.rooms,
        totalCount: roomsResponse.totalCount,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Sent lobby update to client ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Error sending lobby update to ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 모든 로비 사용자에게 방 목록 업데이트 브로드캐스트
   */
  private broadcastLobbyUpdate() {
    try {
      const roomsResponse = this.roomsService.getAllRooms();

      this.server.emit('lobby-update', {
        rooms: roomsResponse.rooms,
        totalCount: roomsResponse.totalCount,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Broadcasted lobby update to all clients`);
    } catch (error) {
      this.logger.error(
        'Error broadcasting lobby update:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 특정 방의 모든 참여자에게 알림 전송
   */
  private notifyRoomParticipants(
    roomId: string,
    event: string,
    data: any,
    excludeSocketId?: string,
  ) {
    try {
      let room: any;
      try {
        room = this.roomsService.getRoomById(roomId);
      } catch {
        room = null;
      }
      if (!room) {
        return;
      }

      // 방 참여자들의 소켓 ID 수집
      const participantSocketIds: string[] = [];
      for (const participant of room.participants) {
        const user = this.usersService.findById(participant.id as string);
        if (user?.socketId && user.socketId !== excludeSocketId) {
          participantSocketIds.push(user.socketId);
        }
      }

      // 각 참여자에게 알림 전송
      participantSocketIds.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });

      this.logger.debug(
        `Notified ${participantSocketIds.length} participants in room ${room.name as string}`,
      );
    } catch (error) {
      this.logger.error(
        `Error notifying room participants: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
