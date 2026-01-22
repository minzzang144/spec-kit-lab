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
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly usersService: UsersService) {}

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
  async handleConnection(@ConnectedSocket() client: Socket) {
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
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client disconnecting: ${client.id}`);

    try {
      // 사용자 정보 조회
      const user = await this.usersService.findBySocketId(client.id);

      if (user) {
        this.logger.log(`User ${user.nickname} (${user.id}) disconnected`);

        // Socket 연결 해제
        await this.usersService.disconnectUser(client.id);

        // TODO: 방에서도 제거해야 함 (추후 구현)
        // TODO: 로비 사용자들에게 알림 (추후 구현)

        // 시스템 메시지 브로드캐스트 (현재는 로그만)
        this.logger.debug(`Broadcasting user disconnect: ${user.nickname}`);
      }
    } catch (error) {
      this.logger.error(`Error handling disconnect for ${client.id}:`, error.message);
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
      const existingUser = await this.usersService.findBySocketId(client.id);
      if (existingUser) {
        this.logger.warn(`User already exists for socket ${client.id}: ${existingUser.nickname}`);

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

      // TODO: 현재 방 목록도 전송 (추후 구현)

    } catch (error) {
      this.logger.error(`Error in join-lobby for ${client.id}:`, error.message);

      client.emit('error', {
        event: 'join-lobby',
        message: error.message || '로비 입장에 실패했습니다',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 사용자 활동 업데이트 (heartbeat)
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.usersService.findBySocketId(client.id);
      if (user) {
        await this.usersService.updateActivity(user.id);
      }

      client.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(`Ping error for ${client.id}:`, error.message);
    }
  }

  /**
   * 현재 로비 사용자 목록 요청
   */
  @SubscribeMessage('get-lobby-users')
  async handleGetLobbyUsers(@ConnectedSocket() client: Socket) {
    try {
      const connectedUsers = await this.usersService.findConnected();

      client.emit('lobby-users', {
        users: connectedUsers,
        count: connectedUsers.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error getting lobby users for ${client.id}:`, error.message);

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
  async handleCheckConnection(@ConnectedSocket() client: Socket) {
    const user = await this.usersService.findBySocketId(client.id);

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
    const stats = await this.usersService.getStats();
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
  async sendToSocket(socketId: string, event: string, data: any) {
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
  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * 특정 사용자를 제외하고 브로드캐스트 (내부 사용)
   */
  async broadcastExcept(excludeSocketId: string, event: string, data: any) {
    this.server.sockets.sockets.forEach((socket, id) => {
      if (id !== excludeSocketId) {
        socket.emit(event, data);
      }
    });
  }
}