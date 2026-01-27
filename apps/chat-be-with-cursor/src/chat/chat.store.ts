import { Injectable } from '@nestjs/common';

export interface User {
  socketId: string;
  nickname: string;
  roomId: string | null;
}

export interface Room {
  id: string;
  name: string;
  createdAt: Date;
  participants: Map<string, User>;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  text: string;
  createdAt: Date;
}

@Injectable()
export class ChatStore {
  private readonly rooms: Map<string, Room> = new Map();
  private readonly messages: Map<string, Message[]> = new Map();
  private readonly users: Map<string, User> = new Map();

  // Room operations
  createRoom(id: string, name: string): Room {
    const room: Room = {
      id,
      name,
      createdAt: new Date(),
      participants: new Map(),
    };
    this.rooms.set(id, room);
    this.messages.set(id, []);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    this.messages.delete(roomId);
    return deleted;
  }

  // User operations
  addUser(user: User): void {
    this.users.set(user.socketId, user);
  }

  getUser(socketId: string): User | undefined {
    return this.users.get(socketId);
  }

  updateUser(socketId: string, updates: Partial<User>): void {
    const user = this.users.get(socketId);
    if (user) {
      Object.assign(user, updates);
    }
  }

  removeUser(socketId: string): boolean {
    return this.users.delete(socketId);
  }

  // Message operations
  addMessage(message: Message): void {
    const roomMessages = this.messages.get(message.roomId) || [];
    roomMessages.push(message);
    this.messages.set(message.roomId, roomMessages);
  }

  getMessages(roomId: string): Message[] {
    return this.messages.get(roomId) || [];
  }

  // Room participant operations
  addParticipant(roomId: string, user: User): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.set(user.socketId, user);
    }
  }

  removeParticipant(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(socketId);
    }
  }

  getParticipantCount(roomId: string): number {
    const room = this.rooms.get(roomId);
    return room ? room.participants.size : 0;
  }
}
