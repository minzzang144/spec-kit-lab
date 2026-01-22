import { Injectable, Logger } from '@nestjs/common';
import { IStorage } from './interfaces/storage.interface';

export interface User {
  id: string;
  nickname: string;
  connectedAt: Date;
  socketId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdAt: Date;
  lastActivity: Date;
  participants: User[];
  messages: Message[];
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  content: string;
  type: 'user' | 'system';
  createdAt: Date;
}

@Injectable()
export class MemoryStore implements IStorage {
  private readonly logger = new Logger(MemoryStore.name);

  // In-memory data structures
  private users = new Map<string, User>();
  private rooms = new Map<string, ChatRoom>();
  private messages = new Map<string, Message>();
  private socketToUser = new Map<string, string>(); // socketId -> userId

  constructor() {
    this.logger.log('MemoryStore initialized');
  }

  // User operations
  createUser(user: User): User {
    this.users.set(user.id, user);
    this.logger.debug(`User created: ${user.nickname} (${user.id})`);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      this.logger.debug(`User updated: ${updatedUser.nickname} (${id})`);
      return updatedUser;
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      // Clean up socket mapping
      if (user.socketId) {
        this.socketToUser.delete(user.socketId);
      }
      this.logger.debug(`User deleted: ${user.nickname} (${id})`);
      return true;
    }
    return false;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Socket mapping operations
  setUserSocket(userId: string, socketId: string): void {
    this.socketToUser.set(socketId, userId);
    this.updateUser(userId, { socketId });
  }

  getUserBySocket(socketId: string): User | undefined {
    const userId = this.socketToUser.get(socketId);
    return userId ? this.getUser(userId) : undefined;
  }

  removeSocketMapping(socketId: string): void {
    const userId = this.socketToUser.get(socketId);
    if (userId) {
      this.socketToUser.delete(socketId);
      this.updateUser(userId, { socketId: undefined });
    }
  }

  // Room operations
  createRoom(room: ChatRoom): ChatRoom {
    this.rooms.set(room.id, room);
    this.logger.debug(`Room created: ${room.name} (${room.id})`);
    return room;
  }

  getRoom(id: string): ChatRoom | undefined {
    return this.rooms.get(id);
  }

  updateRoom(id: string, updates: Partial<ChatRoom>): ChatRoom | undefined {
    const room = this.rooms.get(id);
    if (room) {
      const updatedRoom = { ...room, ...updates };
      this.rooms.set(id, updatedRoom);
      this.logger.debug(`Room updated: ${updatedRoom.name} (${id})`);
      return updatedRoom;
    }
    return undefined;
  }

  deleteRoom(id: string): boolean {
    const room = this.rooms.get(id);
    if (room) {
      this.rooms.delete(id);
      // Clean up room messages
      room.messages.forEach(message => {
        this.messages.delete(message.id);
      });
      this.logger.debug(`Room deleted: ${room.name} (${id})`);
      return true;
    }
    return false;
  }

  getAllRooms(): ChatRoom[] {
    return Array.from(this.rooms.values());
  }

  // Room participant operations
  addUserToRoom(roomId: string, user: User): boolean {
    const room = this.getRoom(roomId);
    if (room && !room.participants.find(p => p.id === user.id)) {
      room.participants.push(user);
      this.updateRoom(roomId, {
        participants: room.participants,
        lastActivity: new Date()
      });
      return true;
    }
    return false;
  }

  removeUserFromRoom(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId);
    if (room) {
      const initialLength = room.participants.length;
      room.participants = room.participants.filter(p => p.id !== userId);
      if (room.participants.length < initialLength) {
        this.updateRoom(roomId, {
          participants: room.participants,
          lastActivity: new Date()
        });
        return true;
      }
    }
    return false;
  }

  // Message operations
  createMessage(message: Message): Message {
    this.messages.set(message.id, message);

    // Add message to room
    const room = this.getRoom(message.roomId);
    if (room) {
      room.messages.push(message);
      this.updateRoom(message.roomId, {
        messages: room.messages,
        lastActivity: new Date()
      });
    }

    this.logger.debug(`Message created in room ${message.roomId}: ${message.content.substring(0, 50)}...`);
    return message;
  }

  getMessage(id: string): Message | undefined {
    return this.messages.get(id);
  }

  getRoomMessages(roomId: string, limit?: number): Message[] {
    const room = this.getRoom(roomId);
    if (!room) return [];

    const messages = room.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return limit ? messages.slice(-limit) : messages;
  }

  // Cleanup operations
  cleanupEmptyRooms(): void {
    const emptyRooms = Array.from(this.rooms.values())
      .filter(room => room.participants.length === 0);

    emptyRooms.forEach(room => {
      this.deleteRoom(room.id);
      this.logger.debug(`Cleaned up empty room: ${room.name} (${room.id})`);
    });
  }

  // Statistics
  getStats() {
    return {
      users: this.users.size,
      rooms: this.rooms.size,
      messages: this.messages.size,
      activeSockets: this.socketToUser.size,
    };
  }

  // Debug operations
  clear(): void {
    this.users.clear();
    this.rooms.clear();
    this.messages.clear();
    this.socketToUser.clear();
    this.logger.warn('MemoryStore cleared - all data removed');
  }
}