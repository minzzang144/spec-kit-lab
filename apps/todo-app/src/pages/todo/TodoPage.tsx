import { TodoInput, TodoList } from '@features/todo-crud'

export function TodoPage() {
  return (
    <div className="space-y-6">
      <TodoInput />
      <TodoList />
    </div>
  )
}
