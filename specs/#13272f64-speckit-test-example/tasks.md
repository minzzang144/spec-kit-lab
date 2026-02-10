# Tasks: Simple Todo List

**Input**: Design documents from `/specs/#13272f64-speckit-test-example/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following constitution TDD requirements, tests are MANDATORY for business logic. All test tasks MUST be completed BEFORE implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Requirements**: All tasks must follow the constitution v2.1.0:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- TDD approach: write failing tests first, then implement
- Follow FSD architecture for frontend
- Frontend: verify with pnpm run type-check, lint, test, build

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **App Location**: `apps/todo-app/`
- **Frontend paths**: Follow FSD structure
  - `src/app/` - App initialization, providers
  - `src/pages/` - Route-level pages
  - `src/features/` - User interactions
  - `src/entities/` - Business entities
  - `src/shared/` - Reusable utilities, UI kit

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create React project with Vite and configure build tools

- [x] T001 Create Vite + React + TypeScript project in `apps/todo-app/`
- [x] T002 Configure TypeScript strict mode in `apps/todo-app/tsconfig.json`
- [x] T003 [P] Configure ESLint in `apps/todo-app/eslint.config.js`
- [x] T004 [P] Configure TailwindCSS in `apps/todo-app/tailwind.config.js` and `apps/todo-app/postcss.config.js`
- [x] T005 [P] Configure Vitest in `apps/todo-app/vitest.config.ts`
- [x] T006 Create FSD directory structure in `apps/todo-app/src/` (app, pages, features, entities, shared)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared UI Components

- [x] T007 [P] Create cn() utility in `apps/todo-app/src/shared/lib/utils.ts`
- [x] T008 [P] Create Button component in `apps/todo-app/src/shared/ui/button.tsx`
- [x] T009 [P] Create Input component in `apps/todo-app/src/shared/ui/input.tsx`
- [x] T010 [P] Create Checkbox component in `apps/todo-app/src/shared/ui/checkbox.tsx`
- [x] T011 Create shared index.ts exports in `apps/todo-app/src/shared/index.ts`

### Entity Types & Constants

- [x] T012 [P] Create TodoItem type in `apps/todo-app/src/entities/todo/types/todo.types.ts`
- [x] T013 [P] Create todo constants (MAX_TEXT_LENGTH, STORAGE_KEY) in `apps/todo-app/src/entities/todo/config/constants.ts`

### App Shell

- [x] T014 Create App component in `apps/todo-app/src/App.tsx`
- [x] T015 Create main entry point in `apps/todo-app/src/main.tsx`
- [x] T016 Create base styles in `apps/todo-app/src/index.css`
- [x] T017 Update index.html title in `apps/todo-app/index.html`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 할 일 추가하기 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 텍스트를 입력하고 추가 버튼을 눌러 할 일 항목을 목록에 추가할 수 있다

**Independent Test**: 앱을 실행하고 할 일을 추가하여 목록에 표시되는지 확인. 새로고침 후에도 데이터 유지.

### Tests for User Story 1 (TDD Required) ⚠️

> **CONSTITUTION REQUIREMENT: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T018 [P] [US1] Unit test for todoStore addTodo action in `apps/todo-app/src/entities/todo/model/__tests__/todoStore.test.ts`
- [x] T019 [P] [US1] Unit test for TodoInput component in `apps/todo-app/src/features/todo-crud/ui/__tests__/TodoInput.test.tsx`
- [x] T020 [P] [US1] Unit test for TodoList component in `apps/todo-app/src/features/todo-crud/ui/__tests__/TodoList.test.tsx`

### Implementation for User Story 1 (After Tests Pass)

Entity Layer:
- [x] T021 [US1] Implement todoStore with addTodo action and LocalStorage persist in `apps/todo-app/src/entities/todo/model/todoStore.ts`
- [x] T022 [US1] Create todo entity public API in `apps/todo-app/src/entities/todo/index.ts`

Feature Layer:
- [x] T023 [US1] Create TodoInput component (text input + add button) in `apps/todo-app/src/features/todo-crud/ui/TodoInput.tsx`
- [x] T024 [US1] Create TodoList component (display todos) in `apps/todo-app/src/features/todo-crud/ui/TodoList.tsx`
- [x] T025 [US1] Create todo-crud feature public API in `apps/todo-app/src/features/todo-crud/index.ts`

Page Layer:
- [x] T026 [US1] Create TodoPage composing TodoInput and TodoList in `apps/todo-app/src/pages/todo/TodoPage.tsx`
- [x] T027 [US1] Create pages public API in `apps/todo-app/src/pages/todo/index.ts`
- [x] T028 [US1] Integrate TodoPage into App.tsx

Verification:
- [x] T029 [US1] Run verification (pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build)

**Checkpoint**: User Story 1 완료 - 할 일 추가 및 목록 표시 기능 동작, 새로고침 후 데이터 유지

---

## Phase 4: User Story 2 - 할 일 완료 표시하기 (Priority: P2)

**Goal**: 사용자가 할 일 항목을 클릭하여 완료/미완료 상태를 토글할 수 있다

**Independent Test**: 할 일을 추가한 후 클릭하여 완료 상태로 변경. 취소선/색상 변경으로 시각적 구분 확인.

### Tests for User Story 2 (TDD Required) ⚠️

- [x] T030 [P] [US2] Unit test for todoStore toggleTodo action in `apps/todo-app/src/entities/todo/model/__tests__/todoStore.test.ts` (extend existing)
- [x] T031 [P] [US2] Unit test for TodoItem component toggle behavior in `apps/todo-app/src/features/todo-crud/ui/__tests__/TodoItem.test.tsx`

### Implementation for User Story 2 (After Tests Pass)

Entity Layer:
- [x] T032 [US2] Add toggleTodo action to todoStore in `apps/todo-app/src/entities/todo/model/todoStore.ts`

Feature Layer:
- [x] T033 [US2] Create TodoItem component with toggle and visual feedback in `apps/todo-app/src/features/todo-crud/ui/TodoItem.tsx`
- [x] T034 [US2] Update TodoList to use TodoItem component in `apps/todo-app/src/features/todo-crud/ui/TodoList.tsx`

Verification:
- [x] T035 [US2] Run verification (pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build)

**Checkpoint**: User Story 2 완료 - 할 일 완료/미완료 토글 기능 동작

---

## Phase 5: User Story 3 - 할 일 삭제하기 (Priority: P3)

**Goal**: 사용자가 삭제 버튼을 눌러 할 일 항목을 즉시 삭제할 수 있다 (확인 없이)

**Independent Test**: 할 일을 추가한 후 삭제 버튼 클릭하여 목록에서 제거 확인. 새로고침 후에도 삭제된 상태 유지.

### Tests for User Story 3 (TDD Required) ⚠️

- [x] T036 [P] [US3] Unit test for todoStore deleteTodo action in `apps/todo-app/src/entities/todo/model/__tests__/todoStore.test.ts` (extend existing)
- [x] T037 [P] [US3] Unit test for TodoItem component delete behavior in `apps/todo-app/src/features/todo-crud/ui/__tests__/TodoItem.test.tsx` (extend existing)

### Implementation for User Story 3 (After Tests Pass)

Entity Layer:
- [x] T038 [US3] Add deleteTodo action to todoStore in `apps/todo-app/src/entities/todo/model/todoStore.ts`

Feature Layer:
- [x] T039 [US3] Add delete button to TodoItem component in `apps/todo-app/src/features/todo-crud/ui/TodoItem.tsx`

Verification:
- [x] T040 [US3] Run verification (pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build)

**Checkpoint**: User Story 3 완료 - 모든 CRUD 기능 동작

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI/UX 개선 및 접근성

- [x] T041 [P] Add empty state UI when no todos in `apps/todo-app/src/features/todo-crud/ui/TodoList.tsx`
- [x] T042 [P] Add keyboard accessibility (Enter to submit) in `apps/todo-app/src/features/todo-crud/ui/TodoInput.tsx`
- [x] T043 [P] Add ARIA labels for accessibility in all components
- [x] T044 Add responsive styling for mobile/desktop in `apps/todo-app/src/index.css`
- [x] T045 Run final verification (pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories should be implemented sequentially (P1 → P2 → P3)
  - Each story builds on previous (TodoItem needs addTodo first)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (needs TodoList and store structure)
- **User Story 3 (P3)**: Depends on US2 (extends TodoItem component)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Entity layer before Feature layer
- Feature layer before Page layer
- Verification at the end of each story

### Parallel Opportunities

- All Setup tasks T003-T005 marked [P] can run in parallel
- All Foundational tasks T007-T013 marked [P] can run in parallel
- Tests within a story marked [P] can run in parallel
- Polish tasks T041-T043 marked [P] can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all shared UI components in parallel:
T007: Create cn() utility in apps/todo-app/src/shared/lib/utils.ts
T008: Create Button component in apps/todo-app/src/shared/ui/button.tsx
T009: Create Input component in apps/todo-app/src/shared/ui/input.tsx
T010: Create Checkbox component in apps/todo-app/src/shared/ui/checkbox.tsx

# Launch entity types in parallel:
T012: Create TodoItem type in apps/todo-app/src/entities/todo/types/todo.types.ts
T013: Create todo constants in apps/todo-app/src/entities/todo/config/constants.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently (add todos, refresh, data persists)
5. Deploy/demo if ready - MVP delivered!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → MVP! (can add todos)
3. Add User Story 2 → Test → (can toggle complete)
4. Add User Story 3 → Test → Full feature (can delete)
5. Polish → Final product

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task (One Task = One Commit)
- Stop at any checkpoint to validate story independently

---

## Implementation Branches

### Recommended: Single Mode

This is a small feature (3 User Stories) suitable for single developer work.

```
develop
  └── spec/#13272f64-speckit-test-example (current)
       └── feature/#13272f64-speckit-test-example (implementation)
```

- All tasks executed in one branch
- One PR for entire feature implementation

### If Parallel Mode needed

| Phase | Branch |
|-------|--------|
| Foundation (Phase 1-2) | `feature/#13272f64-speckit-test-example` |
| US1 | `feature/#13272f64-us1-speckit-test-example` |
| US2 | `feature/#13272f64-us2-speckit-test-example` |
| US3 | `feature/#13272f64-us3-speckit-test-example` |

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 6 | Project initialization |
| Phase 2: Foundational | 11 | Shared UI, types, app shell |
| Phase 3: US1 (P1) | 12 | 할 일 추가하기 (MVP) |
| Phase 4: US2 (P2) | 6 | 할 일 완료 표시하기 |
| Phase 5: US3 (P3) | 5 | 할 일 삭제하기 |
| Phase 6: Polish | 5 | UI/UX, 접근성 |
| **Total** | **45** | |

### Tasks by User Story

| User Story | Tests | Implementation | Total |
|------------|-------|----------------|-------|
| US1 (할 일 추가) | 3 | 9 | 12 |
| US2 (완료 표시) | 2 | 4 | 6 |
| US3 (삭제) | 2 | 3 | 5 |
