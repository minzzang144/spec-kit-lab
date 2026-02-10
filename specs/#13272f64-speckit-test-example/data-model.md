# Data Model: Simple Todo List

**Feature**: Simple Todo List
**Date**: 2026-01-29
**Branch**: `spec/#13272f64-speckit-test-example`

## Entities

### TodoItem

할 일 항목을 나타내는 핵심 엔티티

```typescript
interface TodoItem {
  id: string;           // UUID (crypto.randomUUID())
  text: string;         // 할 일 내용 (1-500자)
  completed: boolean;   // 완료 여부
  createdAt: number;    // 생성 시점 (Unix timestamp ms)
}
```

**Validation Rules**:
| Field | Rule |
|-------|------|
| id | Required, UUID format |
| text | Required, 1-500 characters, trimmed, not empty |
| completed | Required, boolean, default: false |
| createdAt | Required, Unix timestamp milliseconds |

**State Transitions**:
```
[Created] → completed: false
    ↓ toggle
[Completed] → completed: true
    ↓ toggle
[Active] → completed: false
    ↓ delete
[Removed]
```

---

### TodoList (Aggregate)

Todo 항목들의 집합 (LocalStorage에 저장)

```typescript
interface TodoStore {
  todos: TodoItem[];    // 생성 역순 정렬 (최신이 상단)

  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}
```

**Storage Key**: `todo-app-todos`

**Storage Format** (LocalStorage):
```json
{
  "state": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "text": "장보기",
        "completed": false,
        "createdAt": 1706500000000
      }
    ]
  },
  "version": 0
}
```

---

## Relationships

```
TodoList (1) ────────── (N) TodoItem
             contains
```

- TodoList는 0개 이상의 TodoItem을 포함
- TodoItem은 단일 TodoList에 속함 (단일 사용자 환경)

---

## Indexes & Ordering

| Field | Purpose |
|-------|---------|
| createdAt | 정렬 기준 (DESC - 최신이 상단) |
| id | 개별 항목 식별 |

---

## Constraints

| Constraint | Description |
|------------|-------------|
| MAX_TEXT_LENGTH | 500자 |
| MIN_TEXT_LENGTH | 1자 (공백만 불가) |
| MAX_ITEMS | 100개 이상 지원 (SC-003) |
| STORAGE_KEY | `todo-app-todos` (고정) |

---

## Data Flow

```
User Input → Zustand Store → LocalStorage
                  ↓
             React Components (re-render)
```

1. **Create**: 사용자 입력 → `addTodo()` → 새 TodoItem 생성 → LocalStorage 동기화
2. **Toggle**: 항목 클릭 → `toggleTodo()` → completed 토글 → LocalStorage 동기화
3. **Delete**: 삭제 버튼 → `deleteTodo()` → 항목 제거 → LocalStorage 동기화
4. **Load**: 앱 시작 → LocalStorage에서 복원 → Zustand 초기화
