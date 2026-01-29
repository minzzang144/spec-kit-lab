import { describe, it, expect, beforeEach } from 'vitest'
import { useTodoStore } from '../todoStore'
import { MAX_TEXT_LENGTH } from '../../config/constants'

describe('todoStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTodoStore.setState({ todos: [] })
    // Clear localStorage
    localStorage.clear()
  })

  describe('addTodo', () => {
    it('should add a new todo with correct properties', () => {
      const { addTodo } = useTodoStore.getState()

      addTodo('Buy groceries')

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(1)
      expect(todos[0]).toMatchObject({
        text: 'Buy groceries',
        completed: false,
      })
      expect(todos[0].id).toBeDefined()
      expect(todos[0].createdAt).toBeDefined()
    })

    it('should trim whitespace from todo text', () => {
      const { addTodo } = useTodoStore.getState()

      addTodo('  Buy milk  ')

      const { todos } = useTodoStore.getState()
      expect(todos[0].text).toBe('Buy milk')
    })

    it('should add new todos at the beginning of the list', () => {
      const { addTodo } = useTodoStore.getState()

      addTodo('First todo')
      addTodo('Second todo')

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(2)
      expect(todos[0].text).toBe('Second todo')
      expect(todos[1].text).toBe('First todo')
    })

    it('should not add empty todos', () => {
      const { addTodo } = useTodoStore.getState()

      addTodo('')
      addTodo('   ')

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(0)
    })

    it('should not add todos exceeding max length', () => {
      const { addTodo } = useTodoStore.getState()
      const longText = 'a'.repeat(MAX_TEXT_LENGTH + 1)

      addTodo(longText)

      const { todos } = useTodoStore.getState()
      expect(todos).toHaveLength(0)
    })

    it('should generate unique IDs for each todo', () => {
      const { addTodo } = useTodoStore.getState()

      addTodo('First')
      addTodo('Second')

      const { todos } = useTodoStore.getState()
      expect(todos[0].id).not.toBe(todos[1].id)
    })
  })

  describe('toggleTodo', () => {
    it('should toggle todo from incomplete to complete', () => {
      const { addTodo, toggleTodo } = useTodoStore.getState()
      addTodo('Test todo')

      const { todos: initialTodos } = useTodoStore.getState()
      expect(initialTodos[0].completed).toBe(false)

      toggleTodo(initialTodos[0].id)

      const { todos } = useTodoStore.getState()
      expect(todos[0].completed).toBe(true)
    })

    it('should toggle todo from complete to incomplete', () => {
      useTodoStore.setState({
        todos: [{ id: '1', text: 'Test', completed: true, createdAt: Date.now() }],
      })

      const { toggleTodo } = useTodoStore.getState()
      toggleTodo('1')

      const { todos } = useTodoStore.getState()
      expect(todos[0].completed).toBe(false)
    })

    it('should do nothing when id not found', () => {
      const { addTodo, toggleTodo } = useTodoStore.getState()
      addTodo('Test todo')

      toggleTodo('non-existent-id')

      const { todos } = useTodoStore.getState()
      expect(todos[0].completed).toBe(false)
    })
  })
})
