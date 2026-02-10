/**
 * Represents a single todo item
 */
export interface TodoItem {
  /** Unique identifier (UUID) */
  id: string

  /** Todo text content (1-500 characters) */
  text: string

  /** Whether the todo is completed */
  completed: boolean

  /** Creation timestamp (Unix ms) */
  createdAt: number
}
