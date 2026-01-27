// Model types

export interface User {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  createdAt: string
  lastSeen: string
  isConnected: boolean
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

export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: 'chat' | 'system' | 'notification'
}
