/**
 * HTTP API 계약 정의
 *
 * Socket.IO와 함께 사용되는 HTTP API 엔드포인트를 정의합니다.
 * 주로 초기 데이터 로딩과 비실시간 작업에 사용됩니다.
 */

// ============================================================================
// 공통 응답 타입
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// 에러 응답 타입
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// ============================================================================
// 닉네임 관련 API
// ============================================================================

export namespace NicknameAPI {
  // GET /api/nickname/random - 랜덤 닉네임 생성
  export interface RandomNicknameResponse extends ApiResponse<{
    nickname: string;
  }> {}

  // POST /api/nickname/validate - 닉네임 유효성 검사
  export interface ValidateNicknameRequest {
    nickname: string;
  }

  export interface ValidateNicknameResponse extends ApiResponse<{
    isValid: boolean;
    errors?: string[];
  }> {}
}

// ============================================================================
// 방 관련 API
// ============================================================================

export namespace RoomsAPI {
  // GET /api/rooms - 활성 방 목록 조회
  export interface GetRoomsResponse extends ApiResponse<{
    rooms: {
      id: string;
      name: string;
      participantCount: number;
      maxParticipants: number;
      participants: string[]; // 닉네임 배열
      lastActivity: string;
      createdAt: string;
    }[];
  }> {}

  // GET /api/rooms/:id - 특정 방 정보 조회
  export interface GetRoomResponse extends ApiResponse<{
    room: {
      id: string;
      name: string;
      participants: {
        id: string;
        nickname: string;
        isConnected: boolean;
        joinedAt: string;
      }[];
      participantCount: number;
      maxParticipants: number;
      createdAt: string;
      lastActivity: string;
      createdBy: string;
    };
  }> {}

  // GET /api/rooms/:id/messages - 방의 메시지 히스토리 조회
  export interface GetRoomMessagesRequest {
    limit?: number; // 기본값: 50
    before?: string; // 특정 메시지 ID 이전 메시지들
  }

  export interface GetRoomMessagesResponse extends PaginatedResponse<{
    id: string;
    content: string;
    authorId: string;
    authorNickname: string;
    createdAt: string;
    type: 'chat' | 'system' | 'notification';
  }> {}
}

// ============================================================================
// 서버 상태 API
// ============================================================================

export namespace ServerAPI {
  // GET /api/health - 서버 상태 확인
  export interface HealthResponse extends ApiResponse<{
    status: 'ok' | 'degraded' | 'error';
    version: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    connections: {
      active: number;
      total: number;
    };
    rooms: {
      active: number;
      totalMessages: number;
    };
  }> {}

  // GET /api/stats - 서버 통계 정보
  export interface StatsResponse extends ApiResponse<{
    users: {
      online: number;
      totalSessions: number;
    };
    rooms: {
      active: number;
      totalCreated: number;
      totalDeleted: number;
      averageParticipants: number;
    };
    messages: {
      totalSent: number;
      messagesPerMinute: number;
      averageLength: number;
    };
    performance: {
      responseTime: number;
      cpuUsage: number;
      memoryUsage: number;
    };
  }> {}
}

// ============================================================================
// 인증/세션 관련 API (실험용 - 단순화)
// ============================================================================

export namespace SessionAPI {
  // POST /api/session/create - 새 세션 생성
  export interface CreateSessionRequest {
    nickname?: string; // 없으면 랜덤 생성
  }

  export interface CreateSessionResponse extends ApiResponse<{
    sessionId: string;
    user: {
      id: string;
      nickname: string;
      createdAt: string;
    };
    expiresAt: string;
  }> {}

  // GET /api/session/validate - 세션 유효성 검사
  export interface ValidateSessionRequest {
    sessionId: string;
  }

  export interface ValidateSessionResponse extends ApiResponse<{
    isValid: boolean;
    user?: {
      id: string;
      nickname: string;
      currentRoomId: string | null;
      lastSeen: string;
    };
  }> {}

  // DELETE /api/session/:sessionId - 세션 삭제
  export interface DeleteSessionResponse extends ApiResponse<{}> {}
}

// ============================================================================
// HTTP 상태 코드 정의
// ============================================================================

export enum HttpStatus {
  // 성공
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  // 클라이언트 에러
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  PAYLOAD_TOO_LARGE = 413,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 서버 에러
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// ============================================================================
// API 경로 상수
// ============================================================================

export const ApiPaths = {
  // 베이스 경로
  BASE: '/api',

  // 닉네임 관련
  NICKNAME: {
    RANDOM: '/api/nickname/random',
    VALIDATE: '/api/nickname/validate',
  },

  // 방 관련
  ROOMS: {
    LIST: '/api/rooms',
    DETAIL: (id: string) => `/api/rooms/${id}`,
    MESSAGES: (id: string) => `/api/rooms/${id}/messages`,
  },

  // 서버 상태
  SERVER: {
    HEALTH: '/api/health',
    STATS: '/api/stats',
  },

  // 세션 관리
  SESSION: {
    CREATE: '/api/session/create',
    VALIDATE: '/api/session/validate',
    DELETE: (id: string) => `/api/session/${id}`,
  },
} as const;

// ============================================================================
// HTTP 클라이언트 헬퍼 타입
// ============================================================================

// API 요청 옵션
export interface ApiRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  sessionId?: string;
}

// API 클라이언트 인터페이스
export interface ApiClient {
  get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
}

// ============================================================================
// 요청/응답 미들웨어 타입
// ============================================================================

export interface RequestMetadata {
  timestamp: string;
  requestId: string;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  processingTime: number;
  cached?: boolean;
}

// ============================================================================
// 유효성 검증 스키마
// ============================================================================

export const HttpValidationRules = {
  pagination: {
    maxLimit: 100,
    defaultLimit: 50,
    maxPage: 1000,
  },
  session: {
    expirationHours: 24,
  },
  rateLimit: {
    requestsPerMinute: 60,
    burstLimit: 100,
  },
} as const;