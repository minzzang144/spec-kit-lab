import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TodoItem } from '../types/todo.types'
import { STORAGE_KEY, MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from '../config/constants'

interface TodoState {
  todos: TodoItem[]
}

interface TodoActions {
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}

type TodoStore = TodoState & TodoActions

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],

      addTodo: (text: string) => {
        const trimmedText = text.trim()

        // Validation
        if (trimmedText.length < MIN_TEXT_LENGTH) {
          return
        }
        if (trimmedText.length > MAX_TEXT_LENGTH) {
          return
        }

        const newTodo: TodoItem = {
          id: crypto.randomUUID(),
          text: trimmedText,
          completed: false,
          createdAt: Date.now(),
        }

        set((state) => ({
          todos: [newTodo, ...state.todos],
        }))
      },

      toggleTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        }))
      },

      deleteTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }))
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
