import { Injectable } from '@nestjs/common';

@Injectable()
export class SchemaService {
  /**
   * Socket.IO 클라이언트 → 서버 이벤트 스키마 생성
   */
  generateClientToServerSchema() {
    return {
      // 로비 입장
      'join-lobby': {
        parameters: {
          nickname: {
            type: 'string',
            optional: true,
            description: '선택적 닉네임 (없으면 랜덤 생성)',
          },
        },
        description: '사용자가 로비에 입장할 때 발송하는 이벤트',
      },

      // 방 생성
      'create-room': {
        parameters: {},
        description: '새로운 채팅방을 생성하는 이벤트 (자동 이름 생성)',
      },

      // 방 참여
      'join-room': {
        parameters: {
          roomId: {
            type: 'string',
            required: true,
            description: '참여할 방의 ID',
          },
        },
        description: '기존 채팅방에 참여하는 이벤트',
      },

      // 메시지 전송
      'send-message': {
        parameters: {
          roomId: {
            type: 'string',
            required: true,
            description: '메시지를 보낼 방의 ID',
          },
          content: {
            type: 'string',
            required: true,
            maxLength: 500,
            description: '메시지 내용 (최대 500자)',
          },
        },
        description: '채팅방에 메시지를 전송하는 이벤트',
      },

      // 방 나가기
      'leave-room': {
        parameters: {
          roomId: {
            type: 'string',
            required: true,
            description: '나갈 방의 ID',
          },
        },
        description: '채팅방에서 나가는 이벤트',
      },
    };
  }

  /**
   * Socket.IO 서버 → 클라이언트 이벤트 스키마 생성
   */
  generateServerToClientSchema() {
    return {
      // 로비 업데이트
      'lobby-update': {
        data: {
          rooms: {
            type: 'array',
            items: {
              id: { type: 'string', description: '방 ID' },
              name: {
                type: 'string',
                description: '방 이름 (예: 채팅방 #001)',
              },
              participantCount: {
                type: 'number',
                description: '현재 참여자 수',
              },
              maxParticipants: {
                type: 'number',
                description: '최대 참여자 수 (5명)',
              },
              participants: {
                type: 'array',
                items: 'string',
                description: '참여자 닉네임 목록',
              },
            },
          },
        },
        description: '로비의 방 목록이 업데이트될 때 브로드캐스트되는 이벤트',
      },

      // 방 입장 성공
      'room-joined': {
        data: {
          room: {
            id: { type: 'string', description: '방 ID' },
            name: { type: 'string', description: '방 이름' },
            participants: {
              type: 'array',
              items: {
                id: { type: 'string' },
                nickname: { type: 'string' },
                socketId: { type: 'string' },
                currentRoomId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                lastSeen: { type: 'string', format: 'date-time' },
                isConnected: { type: 'boolean' },
              },
            },
            messages: {
              type: 'array',
              items: {
                id: { type: 'string' },
                content: { type: 'string' },
                authorId: { type: 'string' },
                authorNickname: { type: 'string' },
                roomId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                type: {
                  type: 'string',
                  enum: ['chat', 'system', 'notification'],
                },
              },
            },
          },
        },
        description: '방 입장이 성공했을 때 전송되는 이벤트',
      },

      // 새 메시지 수신
      'message-received': {
        data: {
          message: {
            id: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' },
            authorNickname: { type: 'string' },
            roomId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: ['chat', 'system', 'notification'] },
          },
        },
        description:
          '새 메시지가 수신되었을 때 방 참여자들에게 브로드캐스트되는 이벤트',
      },

      // 사용자 활동 알림 (입장/퇴장)
      'user-activity': {
        data: {
          type: {
            type: 'string',
            enum: ['joined', 'left'],
            description: '활동 유형',
          },
          user: {
            id: { type: 'string' },
            nickname: { type: 'string' },
          },
          roomId: { type: 'string', description: '활동이 발생한 방 ID' },
        },
        description: '사용자가 방에 입장하거나 나갈 때 브로드캐스트되는 이벤트',
      },

      // 연결 에러
      error: {
        data: {
          message: { type: 'string', description: '에러 메시지' },
          code: { type: 'string', optional: true, description: '에러 코드' },
        },
        description:
          '연결 또는 작업 처리 중 에러가 발생했을 때 전송되는 이벤트',
      },
    };
  }

  /**
   * 데이터 모델 타입 스키마 생성
   */
  generateDataModelsSchema() {
    return {
      User: {
        id: { type: 'string', description: '고유 식별자 (UUID v4)' },
        nickname: {
          type: 'string',
          maxLength: 20,
          description: '사용자 닉네임 (최대 20자)',
        },
        socketId: { type: 'string', description: 'Socket.IO 연결 ID' },
        currentRoomId: {
          type: 'string',
          nullable: true,
          description: '현재 참여 중인 방 ID',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '접속 시간',
        },
        lastSeen: {
          type: 'string',
          format: 'date-time',
          description: '마지막 활동 시간',
        },
        isConnected: { type: 'boolean', description: '실시간 연결 상태' },
      },

      ChatRoom: {
        id: { type: 'string', description: '고유 식별자 (UUID v4)' },
        name: {
          type: 'string',
          description: '자동 생성된 방 이름 ("채팅방 #001")',
        },
        participants: {
          type: 'array',
          items: 'User',
          description: '현재 참여자 목록',
        },
        messages: {
          type: 'array',
          items: 'Message',
          description: '메시지 히스토리',
        },
        maxParticipants: {
          type: 'number',
          default: 5,
          description: '최대 참여자 수 (5명)',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '방 생성 시간',
        },
        lastActivity: {
          type: 'string',
          format: 'date-time',
          description: '마지막 활동 시간 (정렬 기준)',
        },
        createdBy: { type: 'string', description: '방 생성자 user ID' },
      },

      Message: {
        id: { type: 'string', description: '고유 식별자 (UUID v4)' },
        content: {
          type: 'string',
          maxLength: 500,
          description: '메시지 내용 (최대 500자)',
        },
        authorId: { type: 'string', description: '작성자 user ID' },
        authorNickname: {
          type: 'string',
          description: '작성자 닉네임 (스냅샷)',
        },
        roomId: { type: 'string', description: '채팅방 ID' },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '메시지 전송 시간',
        },
        type: {
          type: 'string',
          enum: ['chat', 'system', 'notification'],
          description: '메시지 유형',
        },
      },
    };
  }

  /**
   * TypeScript 인터페이스 코드 생성
   */
  generateTypeScriptTypes(): string {
    const typescript = `// 자동 생성된 Socket.IO 타입 정의
// Backend에서 생성된 스키마를 기반으로 생성됨
// 수동으로 편집하지 마세요 - pnpm run generate-types로 재생성하세요

export interface User {
  id: string;
  nickname: string;
  socketId: string;
  currentRoomId: string | null;
  createdAt: Date;
  lastSeen: Date;
  isConnected: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: User[];
  messages: Message[];
  maxParticipants: number;
  createdAt: Date;
  lastActivity: Date;
  createdBy: string;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  authorNickname: string;
  roomId: string;
  createdAt: Date;
  type: 'chat' | 'system' | 'notification';
}

// Client → Server 이벤트 타입
export interface ClientToServerEvents {
  'join-lobby': (data: { nickname?: string }) => void;
  'create-room': () => void;
  'join-room': (data: { roomId: string }) => void;
  'send-message': (data: { roomId: string; content: string }) => void;
  'leave-room': (data: { roomId: string }) => void;
}

// Server → Client 이벤트 타입
export interface ServerToClientEvents {
  'lobby-update': (data: {
    rooms: {
      id: string;
      name: string;
      participantCount: number;
      maxParticipants: number;
      participants: string[];
    }[];
  }) => void;

  'room-joined': (data: {
    room: {
      id: string;
      name: string;
      participants: User[];
      messages: Message[];
    };
  }) => void;

  'message-received': (data: { message: Message }) => void;

  'user-activity': (data: {
    type: 'joined' | 'left';
    user: { id: string; nickname: string };
    roomId: string;
  }) => void;

  'error': (data: { message: string; code?: string }) => void;
}

// Socket 인터페이스 확장
export interface InterServerEvents {
  // 서버 간 통신 이벤트 (현재 사용하지 않음)
}

export interface SocketData {
  userId?: string;
  nickname?: string;
}

export default {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  User,
  ChatRoom,
  Message
};
`;

    return typescript;
  }

  /**
   * 전체 스키마를 JSON으로 반환
   */
  getFullSchema() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      clientToServer: this.generateClientToServerSchema(),
      serverToClient: this.generateServerToClientSchema(),
      dataModels: this.generateDataModelsSchema(),
      typescript: this.generateTypeScriptTypes(),
    };
  }
}
