/**
 * contracts/socket-events.md, data-model.md §4 기준 통일
 */

export const MESSAGE_MAX_LENGTH = 2000;
export const NICKNAME_MAX_LENGTH = 64;
export const ROOM_ID_LENGTH = 8;

export const NICKNAME_STORAGE_KEY = 'nickname';

/** 클라이언트 → 서버 (emit) */
export const SOCKET_EMIT = {
  SET_NICKNAME: 'set_nickname',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
} as const;

/** 서버 → 클라이언트 (on) */
export const SOCKET_ON = {
  MESSAGE: 'message',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_DELETED: 'room_deleted',
  ROOM_LIST_UPDATED: 'room_list_updated',
  ROOM_JOINED: 'room_joined',
  ERROR: 'error',
} as const;
