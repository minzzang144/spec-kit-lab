import { useTodoStore } from '@entities/todo'

export function TodoList() {
  const todos = useTodoStore((state) => state.todos)

  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        할 일이 없습니다
      </div>
    )
  }

  return (
    <ul className="space-y-2" role="list">
      {todos.map((todo) => (
        <li
          key={todo.id}
          role="listitem"
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <span className={todo.completed ? 'line-through text-gray-400' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  )
}
