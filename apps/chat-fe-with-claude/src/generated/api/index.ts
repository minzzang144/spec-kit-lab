// Fallback API Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface CreateUserRequest {
  nickname?: string
}

export interface CreateRoomRequest {
  // No additional fields needed for basic room creation
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
