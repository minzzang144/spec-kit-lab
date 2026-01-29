import { useTodoStore } from '@entities/todo'
import { TodoItem } from './TodoItem'

export function TodoList() {
  const todos = useTodoStore((state) => state.todos)

  if (todos.length === 0) {
    return (
      <div
        className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-500 text-lg">할 일이 없습니다</p>
        <p className="text-gray-400 text-sm mt-1">
          위 입력창에서 새 할 일을 추가해보세요
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2" role="list">
      {todos.map((todo) => (
        <li key={todo.id} role="listitem">
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  )
}
