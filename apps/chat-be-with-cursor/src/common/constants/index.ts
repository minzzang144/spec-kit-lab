// Message and validation constants
export const MESSAGE_MAX_LENGTH = 2000;
export const NICKNAME_MAX_LENGTH = 64;
export const ROOM_ID_LENGTH = 8;

// Socket.IO event names (client -> server)
export const SOCKET_EVENTS = {
  SET_NICKNAME: 'set_nickname',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
} as const;

// Socket.IO event names (server -> client)
export const SOCKET_RESPONSE_EVENTS = {
  MESSAGE: 'message',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_DELETED: 'room_deleted',
  ROOM_LIST_UPDATED: 'room_list_updated',
  ROOM_JOINED: 'room_joined',
  ERROR: 'error',
} as const;

// Error codes
export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  NOT_IN_ROOM: 'NOT_IN_ROOM',
  MESSAGE_INVALID: 'MESSAGE_INVALID',
} as const;
