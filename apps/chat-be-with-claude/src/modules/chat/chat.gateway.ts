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
import { SocketSendMessageDto } from './dto/send-message.dto';
import { MessageBroadcastData } from './interfaces/message.interface';

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
   * 클라이언트 연결 해제 처리 (User Story 6)
   */
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client disconnecting: ${client.id}`);

    try {
      // 사용자 정보 조회
      const user = this.usersService.findBySocketId(client.id);

      if (user) {
        this.logger.log(`User ${user.nickname} (${user.id}) disconnected`);

        // 사용자의 현재 참여 방 조회 (삭제 전에)
        let currentRoom: any = null;
        try {
          currentRoom = this.roomsService.getUserCurrentRoom(user.id);
        } catch (error) {
          this.logger.warn(
            `Could not get current room for user ${user.id}:`,
            error,
          );
        }

        // Socket 연결 해제 (사용자 상태 업데이트)
        this.usersService.disconnectUser(client.id);

        // 30초 후 연결 해제 감지 및 정리 스케줄링 (User Story 6)
        setTimeout(() => {
          this.handleConnectionTimeout(user.id, user.nickname);
        }, 30000); // 30초 타임아웃

        // 현재 참여 중인 방이 있다면 연결 해제 알림
        if (currentRoom) {
          // 방의 다른 참여자들에게 연결 해제 알림
          this.notifyRoomParticipants(
            currentRoom.id,
            'user-connection-lost',
            {
              user: {
                id: user.id,
                nickname: user.nickname,
              },
              roomId: currentRoom.id,
              roomName: currentRoom.name,
              message: `${user.nickname}님의 연결이 끊어졌습니다 (30초 후 방에서 제거됩니다)`,
              timeoutSeconds: 30,
              timestamp: new Date().toISOString(),
            },
            client.id,
          );

          // 시스템 메시지 브로드캐스트
          this.broadcastSystemMessageToRoom(
            currentRoom.id,
            `${user.nickname}님의 연결이 끊어졌습니다`,
            'other',
          );

          this.logger.debug(
            `Connection lost notification sent for user ${user.nickname} in room ${currentRoom.name}`,
          );
        }

        // 로비 사용자들에게 연결 해제 알림
        this.server.emit('user-connection-lost', {
          user: {
            id: user.id,
            nickname: user.nickname,
          },
          message: `${user.nickname}님의 연결이 끊어졌습니다`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Error handling disconnect for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 30초 연결 해제 타임아웃 후 정리 처리 (User Story 6)
   * @private
   */
  private handleConnectionTimeout(userId: string, nickname: string): void {
    try {
      // 사용자가 다시 연결되었는지 확인
      const user = this.usersService.findById(userId);
      if (user?.socketId) {
        this.logger.debug(
          `User ${nickname} reconnected before timeout, skipping cleanup`,
        );
        return;
      }

      this.logger.log(
        `Connection timeout reached for user ${nickname} (${userId}), starting cleanup`,
      );

      // 사용자가 참여 중인 방에서 제거 (ChatService 이용)
      const removedFromRooms =
        this.chatService.removeDisconnectedUserFromAllRooms(userId);

      // 각 방에서 제거 알림 및 시스템 메시지
      for (const roomName of removedFromRooms) {
        try {
          // 방이 여전히 존재하는지 확인하고 알림 전송
          const rooms = this.roomsService.getAllRooms();
          const room = rooms.rooms.find((r) => r.name === roomName);
          if (room) {
            // 방의 참여자들에게 사용자 제거 알림
            this.notifyRoomParticipants(room.id, 'user-removed-timeout', {
              user: {
                id: userId,
                nickname,
              },
              roomId: room.id,
              roomName: room.name,
              message: `${nickname}님이 연결 해제로 인해 방에서 제거되었습니다`,
              timestamp: new Date().toISOString(),
            });

            // 시스템 메시지 브로드캐스트
            this.broadcastSystemMessageToRoom(
              room.id,
              `${nickname}님이 연결 해제로 인해 방을 나갔습니다`,
              'user_left',
            );
          }
        } catch (error) {
          this.logger.error(
            `Error notifying room ${roomName} about user ${nickname} removal:`,
            error,
          );
        }
      }

      // 사용자 완전 제거 (30초 후)
      this.usersService.removeUser(userId);

      // 로비 업데이트 브로드캐스트 (방 목록이 변경되었을 수 있음)
      void this.broadcastLobbyUpdate();

      // 로비 사용자들에게 사용자 제거 알림
      this.server.emit('user-removed-timeout', {
        user: {
          id: userId,
          nickname,
        },
        message: `${nickname}님이 연결 해제로 인해 제거되었습니다`,
        removedFromRooms,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `User ${nickname} cleanup completed after connection timeout`,
      );
    } catch (error) {
      this.logger.error(
        `Error during connection timeout cleanup for user ${userId}:`,
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

      this.logger.log(
        `User ${user.nickname} joined room ${joinResult.roomName}`,
      );

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

      // 시스템 메시지 브로드캐스트 (User Story 2)
      this.broadcastSystemMessageToRoom(
        data.roomId,
        `${user.nickname}님이 방에 참여했습니다`,
        'user_joined',
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

      // 시스템 메시지 브로드캐스트 (User Story 2)
      this.broadcastSystemMessageToRoom(
        data.roomId,
        `${user.nickname}님이 방을 나갔습니다`,
        'user_left',
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

  // === 메시지 관련 이벤트들 (User Story 2) ===

  /**
   * 채팅 메시지 전송
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SocketSendMessageDto,
  ) {
    try {
      this.logger.debug(`Send message request from ${client.id}:`, data);

      // 현재 사용자 확인
      const user = this.usersService.findBySocketId(client.id);
      if (!user) {
        client.emit('error', {
          event: 'send-message',
          message: '로비에 입장한 후 메시지를 전송할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!data.roomId || !data.content.trim()) {
        client.emit('error', {
          event: 'send-message',
          message: '방 ID와 메시지 내용이 필요합니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 방 정보 확인
      let room: any;
      try {
        room = this.roomsService.getRoomById(data.roomId);
      } catch (error) {
        client.emit('error', {
          event: 'send-message',
          message: '방을 찾을 수 없습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 사용자가 해당 방에 참여 중인지 확인
      const isUserInRoom = this.chatService.isUserInRoom(data.roomId, user.id);
      if (!isUserInRoom) {
        client.emit('error', {
          event: 'send-message',
          message: '방에 참여한 후 메시지를 전송할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 메시지 생성
      const message = this.chatService.createMessage(
        {
          roomId: data.roomId,
          content: data.content,
          metadata: data.metadata,
        },
        user.id,
        user.nickname,
      );

      this.logger.log(
        `Message sent by ${user.nickname} in room ${room.name}: ${data.content.substring(0, 50)}...`,
      );

      // 발신자에게 성공 응답
      client.emit('message-sent', {
        message,
        roomId: data.roomId,
        roomName: room.name,
        timestamp: new Date().toISOString(),
      });

      // 방의 다른 참여자들에게 메시지 브로드캐스트
      this.broadcastMessageToRoom(data.roomId, message, room.name, client.id);
    } catch (error) {
      this.logger.error(
        `Error sending message from ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );

      client.emit('error', {
        event: 'send-message',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '메시지 전송에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 특정 방의 메시지 히스토리 요청
   */
  @SubscribeMessage('get-message-history')
  async handleGetMessageHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; limit?: number; offset?: number },
  ) {
    try {
      this.logger.debug(`Get message history request from ${client.id}:`, data);

      // 현재 사용자 확인
      const user = this.usersService.findBySocketId(client.id);
      if (!user) {
        client.emit('error', {
          event: 'get-message-history',
          message: '로비에 입장한 후 메시지 히스토리를 조회할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!data.roomId) {
        client.emit('error', {
          event: 'get-message-history',
          message: '방 ID가 필요합니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 사용자가 해당 방에 참여 중인지 확인
      const isUserInRoom = this.chatService.isUserInRoom(data.roomId, user.id);
      if (!isUserInRoom) {
        client.emit('error', {
          event: 'get-message-history',
          message: '방에 참여한 후 메시지 히스토리를 조회할 수 있습니다',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 메시지 히스토리 조회
      const messages = this.chatService.getRecentMessages(
        data.roomId,
        data.limit || 50,
      );

      // 방 정보 가져오기
      let roomName = '채팅방';
      try {
        const room = this.roomsService.getRoomById(data.roomId);
        roomName = room.name;
      } catch (error) {
        // 방 이름을 가져올 수 없어도 메시지는 반환
      }

      // 클라이언트에게 메시지 히스토리 전송
      client.emit('message-history', {
        roomId: data.roomId,
        roomName,
        messages,
        totalCount: messages.length,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(
        `Sent ${messages.length} messages to ${user.nickname} for room ${roomName}`,
      );
    } catch (error) {
      this.logger.error(
        `Error getting message history for ${client.id}:`,
        error instanceof Error ? error.message : String(error),
      );

      client.emit('error', {
        event: 'get-message-history',
        message:
          (error instanceof Error ? error.message : String(error)) ||
          '메시지 히스토리 조회에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // === 메시지 브로드캐스트 헬퍼 메서드들 ===

  /**
   * 특정 방의 모든 참여자에게 메시지 브로드캐스트
   */
  private broadcastMessageToRoom(
    roomId: string,
    message: any,
    roomName: string,
    excludeSocketId?: string,
  ) {
    try {
      // 브로드캐스트 데이터 구성
      const broadcastData: MessageBroadcastData = {
        message,
        roomId,
        roomName,
        timestamp: new Date().toISOString(),
      };

      // 방 참여자들의 소켓 ID 수집 및 메시지 전송
      this.notifyRoomParticipants(
        roomId,
        'new-message',
        broadcastData,
        excludeSocketId,
      );

      this.logger.debug(
        `Broadcasted message to room ${roomName}: ${message.content.substring(0, 50)}...`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting message to room ${roomId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 방에 시스템 메시지 브로드캐스트 (사용자 입장/퇴장 등)
   */
  broadcastSystemMessageToRoom(
    roomId: string,
    content: string,
    systemMessageType:
      | 'user_joined'
      | 'user_left'
      | 'room_created'
      | 'room_deleted'
      | 'other' = 'other',
  ) {
    try {
      // 시스템 메시지 생성
      const systemMessage = this.chatService.createSystemMessage(
        roomId,
        content,
        systemMessageType,
      );

      // 방 정보 가져오기
      let roomName = '채팅방';
      try {
        const room = this.roomsService.getRoomById(roomId);
        roomName = room.name;
      } catch (error) {
        // 방 이름을 가져올 수 없어도 시스템 메시지는 브로드캐스트
      }

      // 모든 참여자에게 시스템 메시지 브로드캐스트
      this.broadcastMessageToRoom(roomId, systemMessage, roomName);

      this.logger.debug(
        `Broadcasted system message to room ${roomName}: ${content}`,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting system message to room ${roomId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
