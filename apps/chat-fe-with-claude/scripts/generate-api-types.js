#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const BACKEND_URL = 'http://localhost:3001'

async function generateApiTypes() {
  console.log('📡 Generating API types from OpenAPI schema...')

  try {
    // Check if backend is running
    console.log('🔍 Checking backend availability...')
    const response = await fetch(`${BACKEND_URL}/api/health`).catch(() => null)

    if (!response || !response.ok) {
      throw new Error('Backend API not available at ' + BACKEND_URL)
    }

    console.log('✅ Backend is available')

    // Create output directory
    const outputDir = path.join(process.cwd(), 'src', 'generated', 'api')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate OpenAPI client
    console.log('🔄 Generating OpenAPI client...')
    execSync(`npx openapi-generator-cli generate \\
      -i ${BACKEND_URL}/api-json \\
      -g typescript-fetch \\
      -o ${outputDir} \\
      --additional-properties=typescriptThreePlus=true,supportsES6=true,npmName=chat-api,apiPackage=api,modelPackage=models`,
      { stdio: 'inherit' }
    )

    console.log('✅ API types generated successfully!')
  } catch (error) {
    console.error('❌ API type generation failed:', error.message)
    console.log('🔄 Creating fallback API types...')
    createFallbackApiTypes()
  }
}

function createFallbackApiTypes() {
  const fallbackTypes = `// Fallback API Types - Generated when backend is not available

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ErrorResponse {
  message: string
  code?: string
  statusCode?: number
}

// User API Types
export interface CreateUserRequest {
  nickname?: string
}

export interface User {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  createdAt: string
  lastSeen: string
  isConnected: boolean
}

// Room API Types
export interface CreateRoomRequest {
  // Room creation with auto-generated name
}

export interface JoinRoomRequest {
  roomId: string
}

export interface Room {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
  createdAt: string
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

// Message API Types
export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: 'chat' | 'system' | 'notification'
}

export interface SendMessageRequest {
  roomId: string
  content: string
}

// API Client Configuration
export interface Configuration {
  basePath?: string
  fetchApi?: any
  middleware?: any[]
}

export class DefaultApi {
  constructor(configuration?: Configuration) {}

  // User endpoints
  async createUser(createUserRequest: CreateUserRequest): Promise<ApiResponse<User>> {
    throw new Error('Backend not available - using fallback types')
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    throw new Error('Backend not available - using fallback types')
  }

  // Room endpoints
  async getRooms(): Promise<ApiResponse<Room[]>> {
    throw new Error('Backend not available - using fallback types')
  }

  async createRoom(): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  async getRoomDetails(roomId: string): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  async joinRoom(joinRoomRequest: JoinRoomRequest): Promise<ApiResponse<RoomDetails>> {
    throw new Error('Backend not available - using fallback types')
  }

  // Health check
  async getHealth(): Promise<ApiResponse<{ status: string }>> {
    throw new Error('Backend not available - using fallback types')
  }
}

export { DefaultApi as Api }

// Export all types for easy imports
export * from './models'
`

  const modelsFile = `// Model types

export interface User {
  id: string
  nickname: string
  socketId: string
  currentRoomId: string | null
  createdAt: string
  lastSeen: string
  isConnected: boolean
}

export interface Room {
  id: string
  name: string
  participantCount: number
  maxParticipants: number
  participants: string[]
  createdAt: string
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

export interface Message {
  id: string
  content: string
  authorId: string
  authorNickname: string
  roomId: string
  createdAt: string
  type: 'chat' | 'system' | 'notification'
}
`

  const outputDir = path.join(process.cwd(), 'src', 'generated', 'api')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(path.join(outputDir, 'index.ts'), fallbackTypes)
  fs.writeFileSync(path.join(outputDir, 'models.ts'), modelsFile)

  console.log('✅ Fallback API types created')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateApiTypes()
}

export { generateApiTypes }