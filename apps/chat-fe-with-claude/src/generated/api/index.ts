/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
// @ts-nocheck
// Fallback API Types - Generated when backend is not available

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ErrorResponse {
  message: string
  code?: string
  statusCode?: number
}

// User API Types
export interface CreateUserRequest {
  nickname?: string
}

export interface User {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  createdAt: string
  lastSeen: string
  isConnected: boolean
}

// Room API Types
export interface CreateRoomRequest {
  // Room creation with auto-generated name
}

export interface JoinRoomRequest {
  roomId: string
}

export interface Room {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
  createdAt: string
  lastActivity: string
}

export interface RoomDetails {
  id: string
  name: string
  participants: User[]
  messages: Message[]
  maxParticipants: number
  createdAt: string
  lastActivity: string
  createdBy: string
}

// Message API Types
export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: 'chat' | 'system' | 'notification'
}

export interface SendMessageRequest {
  roomId: string
  content: string
}

// API Client Configuration
export interface Configuration {
  basePath?: string
  fetchApi?: any
  middleware?: any[]
}

export class DefaultApi {
  constructor(configuration?: Configuration) {}

  // User endpoints
  async createUser(createUserRequest: CreateUserRequest): Promise<ApiResponse<User>> {
    throw new Error('Backend not available - using fallback types')
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    throw new Error('Backend not available - using fallback types')
  }

  // Room endpoints
  async getRooms(): Promise<ApiResponse<Room[]>> {
    throw new Error('Backend not available - using fallback types')
  }

  async createRoom(): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  async getRoomDetails(roomId: string): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  async joinRoom(joinRoomRequest: JoinRoomRequest): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  // Health check
  async getHealth(): Promise<ApiResponse<{ status: string }>> {
    throw new Error('Backend not available - using fallback types')
  }
}

export { DefaultApi as Api }

// Export all types for easy imports
export * from './models'
