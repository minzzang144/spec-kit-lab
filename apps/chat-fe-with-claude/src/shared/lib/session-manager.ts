import { STORAGE_KEYS } from '@/shared/constants'

export interface SessionData {
  userId: string
  nickname: string
  createdAt: string
}

export class SessionManager {
  private static readonly KEY = STORAGE_KEYS.SESSION

  static save(data: SessionData): void {
    try {
      sessionStorage.setItem(this.KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save session data:', error)
    }
  }

  static load(): SessionData | null {
    try {
      const data = sessionStorage.getItem(this.KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load session data:', error)
      return null
    }
  }

  static clear(): void {
    try {
      sessionStorage.removeItem(this.KEY)
    } catch (error) {
      console.error('Failed to clear session data:', error)
    }
  }

  static isValid(data: SessionData | null): data is SessionData {
    if (!data) return false

    return Boolean(
      data.userId &&
      data.nickname &&
      data.createdAt &&
      typeof data.userId === 'string' &&
      typeof data.nickname === 'string' &&
      typeof data.createdAt === 'string'
    )
  }

  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export default SessionManager