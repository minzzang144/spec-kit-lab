// Basic test setup
import { describe, it, expect } from 'vitest'

describe('Frontend Infrastructure', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true)
  })

  it('should be able to import utilities', async () => {
    const { SessionManager } = await import('@/shared/lib/session-manager')
    expect(SessionManager).toBeDefined()
  })
})