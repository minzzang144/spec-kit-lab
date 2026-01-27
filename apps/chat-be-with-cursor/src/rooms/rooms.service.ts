import { Injectable } from '@nestjs/common';
import { ChatStore, Room, User } from '../chat/chat.store';
import { ROOM_ID_LENGTH } from '../common/constants';

@Injectable()
export class RoomsService {
  constructor(private readonly chatStore: ChatStore) {}

  createRoom(nickname: string): { room: Room; user: User } {
    // Generate room ID: Room-{8 random chars}
    const roomId = `Room-${this.generateRandomId(ROOM_ID_LENGTH)}`;
    const room = this.chatStore.createRoom(roomId, roomId);

    // Create user for the creator (will be added to room via join_room)
    const user: User = {
      socketId: '', // Will be set when socket connects
      nickname,
      roomId: null,
    };

    return { room, user };
  }

  listRooms(): Array<Room & { participantCount: number }> {
    return this.chatStore.getAllRooms().map((room) => ({
      ...room,
      participantCount: room.participants.size,
    }));
  }

  private generateRandomId(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
