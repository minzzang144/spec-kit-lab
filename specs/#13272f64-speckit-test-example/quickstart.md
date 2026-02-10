# Quickstart: Simple Todo List

**Feature**: Simple Todo List
**App Location**: `apps/todo-app`
**Date**: 2026-01-29

## Prerequisites

- Node.js 18+
- pnpm 8+

## Setup

```bash
# Navigate to app directory
cd apps/todo-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Development server will start at `http://localhost:5173`

## Project Structure

```
apps/todo-app/
├── src/
│   ├── app/                    # App initialization
│   │   ├── providers/          # React providers (QueryClient, etc.)
│   │   └── index.tsx           # App entry
│   │
│   ├── pages/                  # Route-level pages
│   │   └── todo/               # Todo page
│   │       └── TodoPage.tsx
│   │
│   ├── features/               # User interactions
│   │   └── todo-crud/          # Todo CRUD operations
│   │       ├── ui/             # Feature UI components
│   │       │   ├── TodoInput.tsx
│   │       │   └── TodoItem.tsx
│   │       └── index.ts
│   │
│   ├── entities/               # Business entities
│   │   └── todo/               # Todo entity
│   │       ├── model/          # Zustand store
│   │       │   └── todoStore.ts
│   │       ├── types/          # TypeScript types
│   │       │   └── todo.types.ts
│   │       └── index.ts
│   │
│   └── shared/                 # Shared utilities
│       ├── ui/                 # shadcn/ui components
│       ├── lib/                # Utilities
│       └── index.ts
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm format           # Format with Prettier

# Testing
pnpm test             # Run unit tests (Vitest)
pnpm test:coverage    # Run tests with coverage
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript (strict) |
| Framework | React 18 |
| Build | Vite |
| Styling | TailwindCSS |
| Components | shadcn/ui |
| State | Zustand (with persist) |
| Storage | LocalStorage |
| Testing | Vitest + Testing Library |

## Key Files

| File | Purpose |
|------|---------|
| `entities/todo/model/todoStore.ts` | Zustand store with LocalStorage persistence |
| `features/todo-crud/ui/TodoInput.tsx` | Text input for adding todos |
| `features/todo-crud/ui/TodoItem.tsx` | Individual todo item with toggle/delete |
| `pages/todo/TodoPage.tsx` | Main page combining all components |

## Data Persistence

Todos are persisted to `localStorage` under the key `todo-app-todos`.

```javascript
// Example stored data
localStorage.getItem('todo-app-todos')
// Returns:
{
  "state": {
    "todos": [
      { "id": "uuid", "text": "Buy milk", "completed": false, "createdAt": 1234567890 }
    ]
  },
  "version": 0
}
```

## Testing Strategy

1. **Unit Tests**: Store actions, validation logic
2. **Component Tests**: UI interactions with Testing Library
3. **Integration Tests**: Full user flows (add → toggle → delete)

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```
