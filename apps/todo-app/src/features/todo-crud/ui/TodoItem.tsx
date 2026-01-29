import type { TodoItem as TodoItemType } from '@entities/todo'
import { useTodoStore } from '@entities/todo'
import { cn } from '@shared/index'

interface TodoItemProps {
  todo: TodoItemType
}

export function TodoItem({ todo }: TodoItemProps) {
  const toggleTodo = useTodoStore((state) => state.toggleTodo)

  const handleToggle = () => {
    toggleTodo(todo.id)
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <input
        type="checkbox"
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onChange={handleToggle}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={todo.text}
      />
      <label
        htmlFor={`todo-${todo.id}`}
        className={cn(
          'flex-1 cursor-pointer',
          todo.completed && 'line-through text-gray-400'
        )}
      >
        {todo.text}
      </label>
    </div>
  )
}
