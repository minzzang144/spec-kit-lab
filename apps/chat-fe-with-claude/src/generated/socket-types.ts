// Generated Socket.IO Types
export interface SocketEvents {
  // Client to Server events
  'join-lobby': (data: { nickname?: string }) => void
  'create-room': () => void
  'join-room': (data: { roomId: string }) => void
  'send-message': (data: { roomId: string; content: string }) => void
  'leave-room': (data: { roomId: string }) => void

  // Server to Client events
  'lobby-update': (data: { rooms: RoomSummary[] }) => void
  'room-joined': (data: { room: RoomData }) => void
  'message-received': (data: { message: MessageData }) => void
  'user-activity': (data: { type: 'joined' | 'left'; user: UserData; roomId: string }) => void
  'error': (data: { message: string; code?: string }) => void
}

export interface UserData {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  isConnected: boolean
}

export interface RoomData {
  id: string
  name: string
  participants: UserData[]
  messages: MessageData[]
  maxParticipants: number
}

export interface RoomSummary {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
}

export interface MessageData {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: 'chat' | 'system' | 'notification'
}
