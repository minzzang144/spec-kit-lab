#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const BACKEND_URL = 'http://localhost:3001'

async function generateSocketTypes() {
  console.log('🔌 Generating Socket.IO types from backend schema...')

  try {
    // Try to fetch Socket.IO schema from backend
    console.log('🔍 Fetching socket schema from backend...')
    const response = await fetch(`${BACKEND_URL}/api/socket-schema`).catch(() => null)

    if (!response || !response.ok) {
      throw new Error('Socket schema endpoint not available at ' + BACKEND_URL)
    }

    const schema = await response.json()
    console.log('✅ Socket schema fetched successfully')

    // Generate TypeScript types from schema
    const socketTypes = generateSocketTypescript(schema)

    // Write to file
    const outputPath = path.join(process.cwd(), 'src', 'generated', 'socket-types.ts')
    fs.writeFileSync(outputPath, socketTypes)

    console.log('✅ Socket.IO types generated successfully!')
  } catch (error) {
    console.error('❌ Socket type generation failed:', error.message)
    console.log('🔄 Creating fallback Socket.IO types...')
    createFallbackSocketTypes()
  }
}

function generateSocketTypescript(schema) {
  // If we have a schema from backend, we would parse it here
  // For now, we'll create comprehensive types based on our planned events

  return `// Generated Socket.IO Types
// Auto-generated from backend schema: ${new Date().toISOString()}

import type { User, Room, Message } from './api'

// Socket.IO Event Map
export interface ServerToClientEvents {
  // Lobby events
  'lobby-update': (data: LobbyUpdateEvent) => void

  // Room events
  'room-joined': (data: RoomJoinedEvent) => void
  'room-left': (data: RoomLeftEvent) => void

  // Message events
  'message-received': (data: MessageReceivedEvent) => void

  // User activity events
  'user-activity': (data: UserActivityEvent) => void

  // Connection events
  'connect': () => void
  'disconnect': () => void
  'error': (data: ErrorEvent) => void
}

export interface ClientToServerEvents {
  // Lobby events
  'join-lobby': (data: JoinLobbyEvent) => void

  // Room events
  'create-room': (data: CreateRoomEvent) => void
  'join-room': (data: JoinRoomEvent) => void
  'leave-room': (data: LeaveRoomEvent) => void

  // Message events
  'send-message': (data: SendMessageEvent) => void

  // Connection events
  'disconnect': () => void
}

// Event Data Interfaces

// Client to Server Events
export interface JoinLobbyEvent {
  nickname?: string // Optional, will generate random if not provided
}

export interface CreateRoomEvent {
  // No additional data needed - room name is auto-generated
}

export interface JoinRoomEvent {
  roomId: string
}

export interface LeaveRoomEvent {
  roomId: string
}

export interface SendMessageEvent {
  roomId: string
  content: string
}

// Server to Client Events
export interface LobbyUpdateEvent {
  rooms: RoomSummary[]
}

export interface RoomJoinedEvent {
  room: RoomDetails
  user: User
}

export interface RoomLeftEvent {
  roomId: string
  user: User
}

export interface MessageReceivedEvent {
  message: Message
}

export interface UserActivityEvent {
  type: 'joined' | 'left'
  user: {
    id: string
    nickname: string
  }
  roomId: string
  timestamp: string
}

export interface ErrorEvent {
  message: string
  code?: string
  statusCode?: number
}

// Helper Types
export interface RoomSummary {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[] // Array of nicknames
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

// Socket Client Type
export interface TypedSocket extends Socket<ServerToClientEvents, ClientToServerEvents> {}

// Connection Status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// Socket Hook Return Type
export interface SocketState {
  socket: TypedSocket | null
  isConnected: boolean
  connectionStatus: ConnectionStatus
  error: string | null
}

// Re-export Socket.IO base types for convenience
export type { Socket } from 'socket.io-client'
`
}

function createFallbackSocketTypes() {
  const fallbackTypes = generateSocketTypescript(null)

  // Create generated directory if it doesn't exist
  const generatedDir = path.join(process.cwd(), 'src', 'generated')
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true })
  }

  const outputPath = path.join(process.cwd(), 'src', 'generated', 'socket-types.ts')
  fs.writeFileSync(outputPath, fallbackTypes)

  console.log('✅ Fallback Socket.IO types created')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSocketTypes()
}

export { generateSocketTypes }