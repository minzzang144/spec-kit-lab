import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatStore, User } from './chat.store';
import { SOCKET_RESPONSE_EVENTS } from '../common/constants';

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
      nickname: null as any, // Will be set via set_nickname or join_room
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
}
