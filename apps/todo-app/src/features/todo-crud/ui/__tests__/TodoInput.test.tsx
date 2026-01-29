import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoInput } from '../TodoInput'
import { useTodoStore } from '@entities/todo'

describe('TodoInput', () => {
  beforeEach(() => {
    useTodoStore.setState({ todos: [] })
    localStorage.clear()
  })

  it('should render input field and add button', () => {
    render(<TodoInput />)

    expect(screen.getByPlaceholderText('할 일을 입력하세요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
  })

  it('should add todo when clicking add button', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)

    const input = screen.getByPlaceholderText('할 일을 입력하세요')
    const button = screen.getByRole('button', { name: '추가' })

    await user.type(input, 'New todo item')
    await user.click(button)

    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('New todo item')
  })

  it('should clear input after adding todo', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)

    const input = screen.getByPlaceholderText('할 일을 입력하세요')
    const button = screen.getByRole('button', { name: '추가' })

    await user.type(input, 'New todo item')
    await user.click(button)

    expect(input).toHaveValue('')
  })

  it('should not add empty todo', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)

    const button = screen.getByRole('button', { name: '추가' })
    await user.click(button)

    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(0)
  })

  it('should have accessible label', () => {
    render(<TodoInput />)

    const input = screen.getByLabelText('새 할 일')
    expect(input).toBeInTheDocument()
  })
})
