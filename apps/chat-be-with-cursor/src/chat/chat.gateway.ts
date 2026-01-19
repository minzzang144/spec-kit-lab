import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatStore, User, Room, Message } from './chat.store';
import {
  SOCKET_EVENTS,
  SOCKET_RESPONSE_EVENTS,
  ERROR_CODES,
  NICKNAME_MAX_LENGTH,
} from '../common/constants';

@WebSocketGateway({
  cors: {
    origin: process.env.FE_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatStore: ChatStore) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Create user on connection
    const user: User = {
      socketId: client.id,
      nickname: '', // Will be set via set_nickname or join_room
      roomId: null,
    };
    this.chatStore.addUser(user);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const user = this.chatStore.getUser(client.id);
    if (!user) {
      return;
    }

    // If user is in a room, leave it
    if (user.roomId) {
      this.handleLeaveRoom(client);
    }

    // Remove user from store
    this.chatStore.removeUser(client.id);
  }

  private handleLeaveRoom(client: Socket): void {
    const user = this.chatStore.getUser(client.id);
    if (!user || !user.roomId) {
      return;
    }

    const roomId = user.roomId;

    // Leave socket room
    client.leave(roomId);

    // Remove from participants
    this.chatStore.removeParticipant(roomId, client.id);

    // Update user roomId
    this.chatStore.updateUser(client.id, { roomId: null });

    // Broadcast user_left to room
    this.server.to(roomId).emit(SOCKET_RESPONSE_EVENTS.USER_LEFT, {
      nickname: user.nickname,
      socketId: client.id,
    });

    // Check if room is empty and delete if so
    const participantCount = this.chatStore.getParticipantCount(roomId);
    if (participantCount === 0) {
      this.chatStore.deleteRoom(roomId);

      // Broadcast room_deleted to all clients
      this.server.emit(SOCKET_RESPONSE_EVENTS.ROOM_DELETED, { roomId });

      // Broadcast room_list_updated
      this.server.emit(SOCKET_RESPONSE_EVENTS.ROOM_LIST_UPDATED, {});
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.SET_NICKNAME)
  handleSetNickname(
    @MessageBody() payload: { nickname: string },
    client: Socket,
  ): { success: boolean } | { error: { code: string; reason?: string } } {
    const trimmedNickname = payload.nickname?.trim() || '';

    if (trimmedNickname.length === 0 || trimmedNickname.length > NICKNAME_MAX_LENGTH) {
      client.emit(SOCKET_RESPONSE_EVENTS.ERROR, {
        code: ERROR_CODES.MESSAGE_INVALID,
        reason: `Nickname must be between 1 and ${NICKNAME_MAX_LENGTH} characters`,
      });
      return { error: { code: ERROR_CODES.MESSAGE_INVALID } };
    }

    const user = this.chatStore.getUser(client.id);
    if (user) {
      this.chatStore.updateUser(client.id, { nickname: trimmedNickname });
    }

    return { success: true };
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() payload: { roomId: string; nickname: string },
    client: Socket,
  ): { room: Room; messages: Message[] } | { error: { code: string; roomId?: string } } {
    const { roomId, nickname } = payload;
    const trimmedNickname = nickname?.trim() || '';

    if (!trimmedNickname || trimmedNickname.length === 0) {
      client.emit(SOCKET_RESPONSE_EVENTS.ERROR, {
        code: ERROR_CODES.MESSAGE_INVALID,
        reason: 'Nickname is required',
      });
      return { error: { code: ERROR_CODES.MESSAGE_INVALID } };
    }

    const room = this.chatStore.getRoom(roomId);
    if (!room) {
      client.emit(SOCKET_RESPONSE_EVENTS.ERROR, {
        code: ERROR_CODES.ROOM_NOT_FOUND,
        roomId,
      });
      return { error: { code: ERROR_CODES.ROOM_NOT_FOUND, roomId } };
    }

    const user = this.chatStore.getUser(client.id);
    if (!user) {
      client.emit(SOCKET_RESPONSE_EVENTS.ERROR, {
        code: ERROR_CODES.NOT_IN_ROOM,
        reason: 'User not found',
      });
      return { error: { code: ERROR_CODES.NOT_IN_ROOM } };
    }

    // Leave previous room if any
    if (user.roomId && user.roomId !== roomId) {
      client.leave(user.roomId);
      this.chatStore.removeParticipant(user.roomId, client.id);
      this.server.to(user.roomId).emit(SOCKET_RESPONSE_EVENTS.USER_LEFT, {
        nickname: user.nickname,
        socketId: client.id,
      });
    }

    // Join new room
    client.join(roomId);
    this.chatStore.updateUser(client.id, {
      roomId,
      nickname: trimmedNickname,
    });
    this.chatStore.addParticipant(roomId, {
      ...user,
      roomId,
      nickname: trimmedNickname,
    });

    // Broadcast user_joined to room (except sender)
    client.to(roomId).emit(SOCKET_RESPONSE_EVENTS.USER_JOINED, {
      nickname: trimmedNickname,
      socketId: client.id,
    });

    // Get messages history
    const messages = this.chatStore.getMessages(roomId);

    // Send room_joined ACK to the joining client
    return {
      room: {
        ...room,
        participantCount: room.participants.size,
      },
      messages,
    };
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
  handleLeaveRoomEvent(client: Socket): { success: boolean } | { error: { code: string } } {
    const user = this.chatStore.getUser(client.id);
    if (!user || !user.roomId) {
      client.emit(SOCKET_RESPONSE_EVENTS.ERROR, {
        code: ERROR_CODES.NOT_IN_ROOM,
      });
      return { error: { code: ERROR_CODES.NOT_IN_ROOM } };
    }

    this.handleLeaveRoom(client);
    return { success: true };
  }
}
