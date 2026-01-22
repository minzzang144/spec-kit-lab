export interface User {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  createdAt: Date
  lastSeen: Date
  isConnected: boolean
}

export type UserStatus = 'CREATED' | 'CONNECTED' | 'IN_ROOM' | 'DISCONNECTED'

export interface CreateUserPayload {
  nickname?: string // Optional, will generate random if not provided
}

export interface UpdateUserPayload {
  nickname?: string
  currentRoomId?: string | null
  isConnected?: boolean
}

export const UserModel = {
  create: (payload: CreateUserPayload & { id: string; socketId: string }): User => {
    const now = new Date()
    return {
      id: payload.id,
      nickname: payload.nickname || '',
      socketId: payload.socketId,
      currentRoomId: null,
      createdAt: now,
      lastSeen: now,
      isConnected: true,
    }
  },

  update: (user: User, payload: UpdateUserPayload): User => {
    return {
      ...user,
      ...payload,
      lastSeen: new Date(),
    }
  },

  isInRoom: (user: User): boolean => {
    return Boolean(user.currentRoomId)
  },

  getStatus: (user: User): UserStatus => {
    if (!user.isConnected) return 'DISCONNECTED'
    if (user.currentRoomId) return 'IN_ROOM'
    return 'CONNECTED'
  },
}

export default UserModel