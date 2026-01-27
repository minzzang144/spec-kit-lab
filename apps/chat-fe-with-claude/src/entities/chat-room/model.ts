import type { User } from '@/entities/user'
import type { Message } from '@/entities/message'

export interface ChatRoom {
  id: string
  name: string
  participants: User[]
  messages: Message[]
  maxParticipants: number
  createdAt: Date
  lastActivity: Date
  createdBy: string
}

export type RoomStatus = 'CREATED' | 'ACTIVE' | 'FULL' | 'DELETED'

export interface CreateRoomPayload {
  createdBy: string
}

export interface JoinRoomPayload {
  userId: string
}

export interface RoomSummary {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[] // nickname array
}

export const ChatRoomModel = {
  create: (payload: CreateRoomPayload & { id: string; name: string }): ChatRoom => {
    const now = new Date()
    return {
      id: payload.id,
      name: payload.name,
      participants: [],
      messages: [],
      maxParticipants: 5,
      createdAt: now,
      lastActivity: now,
      createdBy: payload.createdBy,
    }
  },

  addParticipant: (room: ChatRoom, user: User): ChatRoom => {
    if (room.participants.length >= room.maxParticipants) {
      throw new Error('Room is full')
    }

    const isAlreadyInRoom = room.participants.some(p => p.id === user.id)
    if (isAlreadyInRoom) {
      return room
    }

    return {
      ...room,
      participants: [...room.participants, user],
      lastActivity: new Date(),
    }
  },

  removeParticipant: (room: ChatRoom, userId: string): ChatRoom => {
    return {
      ...room,
      participants: room.participants.filter(p => p.id !== userId),
      lastActivity: new Date(),
    }
  },

  addMessage: (room: ChatRoom, message: Message): ChatRoom => {
    return {
      ...room,
      messages: [...room.messages, message],
      lastActivity: new Date(),
    }
  },

  getStatus: (room: ChatRoom): RoomStatus => {
    if (room.participants.length === 0) return 'CREATED'
    if (room.participants.length >= room.maxParticipants) return 'FULL'
    return 'ACTIVE'
  },

  toSummary: (room: ChatRoom): RoomSummary => {
    return {
      id: room.id,
      name: room.name,
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      participants: room.participants.map(p => p.nickname),
    }
  },

  isEmpty: (room: ChatRoom): boolean => {
    return room.participants.length === 0
  },

  isFull: (room: ChatRoom): boolean => {
    return room.participants.length >= room.maxParticipants
  },
}

export default ChatRoomModel