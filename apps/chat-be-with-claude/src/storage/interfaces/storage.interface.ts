import { User, ChatRoom, Message } from '../memory-store';

export interface IUserStorage {
  createUser(user: User): User;
  getUser(id: string): User | undefined;
  updateUser(id: string, updates: Partial<User>): User | undefined;
  deleteUser(id: string): boolean;
  getAllUsers(): User[];

  // Socket mapping
  setUserSocket(userId: string, socketId: string): void;
  getUserBySocket(socketId: string): User | undefined;
  removeSocketMapping(socketId: string): void;
}

export interface IRoomStorage {
  createRoom(room: ChatRoom): ChatRoom;
  getRoom(id: string): ChatRoom | undefined;
  updateRoom(id: string, updates: Partial<ChatRoom>): ChatRoom | undefined;
  deleteRoom(id: string): boolean;
  getAllRooms(): ChatRoom[];

  // Participant management
  addUserToRoom(roomId: string, user: User): boolean;
  removeUserFromRoom(roomId: string, userId: string): boolean;
}

export interface IMessageStorage {
  createMessage(message: Message): Message;
  getMessage(id: string): Message | undefined;
  getRoomMessages(roomId: string, limit?: number): Message[];
}

export interface IStorage extends IUserStorage, IRoomStorage, IMessageStorage {
  // Maintenance operations
  cleanupEmptyRooms(): void;
  getStats(): {
    users: number;
    rooms: number;
    messages: number;
    activeSockets: number;
  };

  // Debug operations (for development/testing)
  clear(): void;
}

export const STORAGE_TOKEN = 'STORAGE_TOKEN';
