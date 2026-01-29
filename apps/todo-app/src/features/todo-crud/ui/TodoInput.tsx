import { useState, useId } from 'react'
import { Button, Input } from '@shared/index'
import { useTodoStore } from '@entities/todo'

export function TodoInput() {
  const [text, setText] = useState('')
  const inputId = useId()
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = () => {
    if (text.trim()) {
      addTodo(text)
      setText('')
    }
  }

  return (
    <div className="flex gap-2">
      <label htmlFor={inputId} className="sr-only">
        새 할 일
      </label>
      <Input
        id={inputId}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 입력하세요"
        className="flex-1"
        aria-label="새 할 일"
      />
      <Button onClick={handleSubmit}>추가</Button>
    </div>
  )
}
