import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TodoList } from '../TodoList'
import { useTodoStore } from '@entities/todo'

describe('TodoList', () => {
  beforeEach(() => {
    useTodoStore.setState({ todos: [] })
    localStorage.clear()
  })

  it('should render empty state when no todos', () => {
    render(<TodoList />)

    expect(screen.getByText('할 일이 없습니다')).toBeInTheDocument()
  })

  it('should render todos from store', () => {
    useTodoStore.setState({
      todos: [
        { id: '1', text: 'First todo', completed: false, createdAt: Date.now() },
        { id: '2', text: 'Second todo', completed: false, createdAt: Date.now() - 1000 },
      ],
    })

    render(<TodoList />)

    expect(screen.getByText('First todo')).toBeInTheDocument()
    expect(screen.getByText('Second todo')).toBeInTheDocument()
  })

  it('should display todos in order (newest first)', () => {
    const now = Date.now()
    useTodoStore.setState({
      todos: [
        { id: '1', text: 'Newest', completed: false, createdAt: now },
        { id: '2', text: 'Oldest', completed: false, createdAt: now - 1000 },
      ],
    })

    render(<TodoList />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Newest')
    expect(items[1]).toHaveTextContent('Oldest')
  })

  it('should have accessible list role', () => {
    useTodoStore.setState({
      todos: [
        { id: '1', text: 'Test todo', completed: false, createdAt: Date.now() },
      ],
    })

    render(<TodoList />)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })
})
