/**
 * Todo Store Interface Contract
 *
 * This file defines the public interface for the Todo store.
 * Since this is a frontend-only application with LocalStorage,
 * there's no REST API. This interface serves as the "contract"
 * for the Zustand store.
 *
 * Feature: Simple Todo List
 * Date: 2026-01-29
 */

// ============================================
// Entity Types
// ============================================

/**
 * Represents a single todo item
 */
export interface TodoItem {
  /** Unique identifier (UUID) */
  id: string;

  /** Todo text content (1-500 characters) */
  text: string;

  /** Whether the todo is completed */
  completed: boolean;

  /** Creation timestamp (Unix ms) */
  createdAt: number;
}

// ============================================
// Store Interface
// ============================================

/**
 * Todo Store State and Actions
 *
 * @example
 * ```typescript
 * const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
 *
 * // Add a new todo
 * addTodo('Buy groceries');
 *
 * // Toggle completion status
 * toggleTodo('uuid-here');
 *
 * // Delete a todo
 * deleteTodo('uuid-here');
 * ```
 */
export interface TodoStore {
  // ============================================
  // State
  // ============================================

  /**
   * List of todo items, sorted by createdAt DESC (newest first)
   */
  todos: TodoItem[];

  // ============================================
  // Actions
  // ============================================

  /**
   * Add a new todo item
   *
   * @param text - Todo text (will be trimmed, must be 1-500 chars)
   * @returns void
   * @throws Error if text is empty or exceeds 500 characters
   *
   * Behavior:
   * - Creates new TodoItem with UUID and current timestamp
   * - Inserts at the beginning of the list (newest first)
   * - Persists to LocalStorage immediately
   */
  addTodo: (text: string) => void;

  /**
   * Toggle the completion status of a todo
   *
   * @param id - UUID of the todo to toggle
   * @returns void
   *
   * Behavior:
   * - Flips completed: true ↔ false
   * - No-op if id not found
   * - Persists to LocalStorage immediately
   */
  toggleTodo: (id: string) => void;

  /**
   * Delete a todo item (immediate, no confirmation)
   *
   * @param id - UUID of the todo to delete
   * @returns void
   *
   * Behavior:
   * - Removes item from list
   * - No-op if id not found
   * - Persists to LocalStorage immediately
   */
  deleteTodo: (id: string) => void;
}

// ============================================
// Constants
// ============================================

/**
 * LocalStorage key for persisting todos
 */
export const STORAGE_KEY = 'todo-app-todos';

/**
 * Maximum allowed text length for a todo
 */
export const MAX_TEXT_LENGTH = 500;

/**
 * Minimum required text length for a todo
 */
export const MIN_TEXT_LENGTH = 1;
