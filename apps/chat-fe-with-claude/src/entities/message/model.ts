export const MessageType = {
  CHAT: 'chat',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
} as const

export type MessageType = typeof MessageType[keyof typeof MessageType]

export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: Date
  type: MessageType
}

export interface CreateMessagePayload {
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  type?: MessageType
}

export interface SystemMessagePayload {
  roomId: string
  type: 'user_joined' | 'user_left' | 'room_created'
  username?: string
}

export const MessageModel = {
  create: (payload: CreateMessagePayload & { id: string }): Message => {
    return {
      id: payload.id,
      content: payload.content,
      authorId: payload.authorId,
      authorNickname: payload.authorNickname,
      roomId: payload.roomId,
      createdAt: new Date(),
      type: payload.type || MessageType.CHAT,
    }
  },

  createSystemMessage: (payload: SystemMessagePayload & { id: string }): Message => {
    let content: string

    switch (payload.type) {
      case 'user_joined':
        content = `${payload.username}님이 입장했습니다.`
        break
      case 'user_left':
        content = `${payload.username}님이 나갔습니다.`
        break
      case 'room_created':
        content = '채팅방이 생성되었습니다.'
        break
      default:
        content = '시스템 메시지'
    }

    return {
      id: payload.id,
      content,
      authorId: 'system',
      authorNickname: 'System',
      roomId: payload.roomId,
      createdAt: new Date(),
      type: MessageType.SYSTEM,
    }
  },

  isSystemMessage: (message: Message): boolean => {
    return message.type === MessageType.SYSTEM || message.authorId === 'system'
  },

  isChatMessage: (message: Message): boolean => {
    return message.type === MessageType.CHAT
  },

  formatTimestamp: (message: Message): string => {
    const date = new Date(message.createdAt)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  truncateContent: (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  },
}

export default MessageModel