// API Configuration
export const API_BASE_URL = 'http://localhost:3001'
export const SOCKET_URL = 'http://localhost:3001'

// Chat Configuration
export const MAX_MESSAGE_LENGTH = 500
export const MAX_NICKNAME_LENGTH = 20
export const MAX_ROOM_PARTICIPANTS = 5
export const CONNECTION_TIMEOUT = 30000 // 30 seconds

// UI Configuration
export const ANIMATION_DELAY_MS = 300
export const DEBOUNCE_DELAY = 500

// Regular Expressions
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9\s]{1,20}$/

// Routes
export const ROUTES = {
  NICKNAME_SETUP: '/',
  LOBBY: '/lobby',
  CHAT_ROOM: '/room/:roomId',
  ERROR: '/error',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  SESSION: 'chat-session',
  USER_PREFERENCES: 'user-preferences',
} as const

export type RouteType = typeof ROUTES[keyof typeof ROUTES]