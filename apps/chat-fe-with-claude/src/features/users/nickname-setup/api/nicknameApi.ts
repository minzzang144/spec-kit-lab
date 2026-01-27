// API client for nickname-related operations
export interface CheckNicknameResponse {
  isAvailable: boolean
  message?: string
}

export interface CreateUserRequest {
  nickname: string
}

export interface CreateUserResponse {
  id: string
  nickname: string
  socketId: string
  createdAt: string
}

export class NicknameApi {
  private baseUrl = '/api'

  // Check if nickname is available (Backend API)
  async checkNicknameAvailability(nickname: string): Promise<CheckNicknameResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/check-nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })

      if (!response.ok) {
        throw new Error('Failed to check nickname availability')
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking nickname:', error)
      // Fallback: assume available for development
      return {
        isAvailable: true,
        message: 'Nickname check unavailable (using fallback)'
      }
    }
  }

  // Create user with nickname (Backend API)
  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating user:', error)
      // Fallback: create mock user for development
      return {
        id: `user_${Date.now()}`,
        nickname: request.nickname,
        socketId: `socket_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
    }
  }
}

export const nicknameApi = new NicknameApi()