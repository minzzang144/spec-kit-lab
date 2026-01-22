#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const BACKEND_URL = 'http://localhost:3001'

async function generateTypes() {
  console.log('🔄 Generating types from backend...')

  try {
    // Create generated directory if it doesn't exist
    const generatedDir = path.join(process.cwd(), 'src', 'generated')
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true })
    }

    // Generate API types
    console.log('📡 Generating API types...')
    await generateApiTypes()

    // Generate Socket types
    console.log('🔌 Generating Socket.IO types...')
    await generateSocketTypes()

    console.log('✅ Type generation completed successfully!')
  } catch (error) {
    console.error('❌ Type generation failed:', error.message)

    // Create fallback types if generation fails
    console.log('🔄 Creating fallback types...')
    createFallbackTypes()
  }
}

async function generateApiTypes() {
  try {
    // Check if backend is running
    const response = await fetch(`${BACKEND_URL}/api/health`).catch(() => null)

    if (!response || !response.ok) {
      throw new Error('Backend API not available')
    }

    // Generate OpenAPI types
    execSync(`npx openapi-generator-cli generate \\
      -i ${BACKEND_URL}/api-json \\
      -g typescript-fetch \\
      -o src/generated/api \\
      --additional-properties=typescriptThreePlus=true,supportsES6=true,npmName=chat-api`,
      { stdio: 'inherit' }
    )
  } catch (error) {
    console.warn('⚠️  API type generation failed, creating fallback types')
    createFallbackApiTypes()
  }
}

async function generateSocketTypes() {
  try {
    // Fetch Socket.IO schema from backend
    const response = await fetch(`${BACKEND_URL}/api/socket-schema`)

    if (!response.ok) {
      throw new Error('Socket schema not available')
    }

    const schema = await response.json()

    // Generate TypeScript types from schema
    const socketTypes = generateSocketTypescript(schema)

    // Write to file
    const outputPath = path.join(process.cwd(), 'src', 'generated', 'socket-types.ts')
    fs.writeFileSync(outputPath, socketTypes)
  } catch (error) {
    console.warn('⚠️  Socket type generation failed, creating fallback types')
    createFallbackSocketTypes()
  }
}

function generateSocketTypescript(schema) {
  // This would parse the schema and generate TypeScript types
  // For now, return a basic template
  return `// Generated Socket.IO Types
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
`
}

function createFallbackTypes() {
  createFallbackApiTypes()
  createFallbackSocketTypes()
}

function createFallbackApiTypes() {
  const fallbackApi = `// Fallback API Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface CreateUserRequest {
  nickname?: string
}

export interface CreateRoomRequest {
  // No additional fields needed for basic room creation
}

export interface User {
  id: string
  nickname: string
  currentRoomId: string | null
  isConnected: boolean
}

export interface Room {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
}

export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: string
}
`

  const apiDir = path.join(process.cwd(), 'src', 'generated', 'api')
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true })
  }

  fs.writeFileSync(path.join(apiDir, 'index.ts'), fallbackApi)
}

function createFallbackSocketTypes() {
  const fallbackSocket = generateSocketTypescript(null)

  const outputPath = path.join(process.cwd(), 'src', 'generated', 'socket-types.ts')
  fs.writeFileSync(outputPath, fallbackSocket)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes()
}

export { generateTypes }