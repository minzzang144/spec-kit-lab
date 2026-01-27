// Fallback API Types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface CreateUserRequest {
  nickname?: string
}

export interface CreateRoomRequest {
  name?: string
  maxParticipants?: number
}

export interface User {
  id: string
  nickname: string
  currentRoomId: string | null
  isConnected: boolean
}

export interface Room {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
}

export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: string
}
