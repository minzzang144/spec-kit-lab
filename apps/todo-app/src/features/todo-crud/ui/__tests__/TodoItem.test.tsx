import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoItem } from '../TodoItem'
import { useTodoStore } from '@entities/todo'

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: Date.now(),
  }

  beforeEach(() => {
    useTodoStore.setState({ todos: [mockTodo] })
    localStorage.clear()
  })

  it('should render todo text', () => {
    render(<TodoItem todo={mockTodo} />)

    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('should render checkbox for toggle', () => {
    render(<TodoItem todo={mockTodo} />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should toggle completion when checkbox clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    const { todos } = useTodoStore.getState()
    expect(todos[0].completed).toBe(true)
  })

  it('should show strikethrough when completed', () => {
    const completedTodo = { ...mockTodo, completed: true }
    useTodoStore.setState({ todos: [completedTodo] })

    render(<TodoItem todo={completedTodo} />)

    const text = screen.getByText('Test todo')
    expect(text).toHaveClass('line-through')
  })

  it('should not show strikethrough when incomplete', () => {
    render(<TodoItem todo={mockTodo} />)

    const text = screen.getByText('Test todo')
    expect(text).not.toHaveClass('line-through')
  })

  it('should have accessible checkbox with label', () => {
    render(<TodoItem todo={mockTodo} />)

    const checkbox = screen.getByRole('checkbox', { name: /Test todo/i })
    expect(checkbox).toBeInTheDocument()
  })
})
