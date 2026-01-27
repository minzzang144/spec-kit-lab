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

    // Generate OpenAPI types using openapi-typescript
    console.log('🔄 Generating OpenAPI types...')
    execSync(`npx openapi-typescript ${BACKEND_URL}/api-json -o ${outputDir}/types.ts`,
      { stdio: 'inherit' }
    )

    // Create a simple API client wrapper
    console.log('🔄 Creating API client wrapper...')
    const clientWrapper = createApiClientWrapper()
    fs.writeFileSync(path.join(outputDir, 'client.ts'), clientWrapper)

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

function createApiClientWrapper() {
  return `// Generated API Client Wrapper
// Auto-generated from backend OpenAPI schema: ${new Date().toISOString()}
// Backend API: ${BACKEND_URL}/api-json

import type { paths } from './types'

const BASE_URL = '${BACKEND_URL}'

type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = \`\${this.baseUrl}\${path}\`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(\`API request failed: \${response.status} \${response.statusText}\`)
    }

    const data = await response.json()
    return data
  }

  // User endpoints
  async createUser(data: { nickname?: string }, socketId: string) {
    return this.request<any>(\`/users?socketId=\${socketId}\`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUsers(connected?: boolean) {
    const query = connected ? '?connected=true' : ''
    return this.request<any[]>(\`/users\${query}\`)
  }

  async getUserById(id: string) {
    return this.request<any>(\`/users/\${id}\`)
  }

  // Room endpoints
  async getRooms() {
    return this.request<any[]>('/rooms')
  }

  async createRoom(creatorId: string, data: { creatorNickname?: string } = {}) {
    return this.request<any>(\`/rooms?creatorId=\${creatorId}\`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRoomById(roomId: string, currentUserId?: string) {
    const query = currentUserId ? \`?currentUserId=\${currentUserId}\` : ''
    return this.request<any>(\`/rooms/\${roomId}\${query}\`)
  }

  async joinRoom(roomId: string, userId: string) {
    return this.request<any>(\`/rooms/\${roomId}/participants?userId=\${userId}\`, {
      method: 'POST',
    })
  }

  async leaveRoom(roomId: string, userId: string) {
    return this.request<any>(\`/rooms/\${roomId}/participants/remove?userId=\${userId}\`, {
      method: 'POST',
    })
  }

  // Health check
  async getHealth() {
    return this.request<{ status: string; timestamp: string; uptime: number }>('/api/health')
  }
}

export { ApiClient }
export default new ApiClient()

// Re-export types for convenience
export type { paths } from './types'
`
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateApiTypes()
}

export { generateApiTypes }