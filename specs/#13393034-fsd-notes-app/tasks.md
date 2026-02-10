# Tasks: FSD Notes App

**Input**: Design documents from `/specs/#13393034-fsd-apps/notes-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following constitution TDD requirements, tests are MANDATORY for business logic. All test tasks MUST be completed BEFORE implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Requirements**: All tasks must follow the constitution v2.1.0:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- TDD approach: write failing tests first, then implement
- Follow Custom FSD architecture (frontend)
- Frontend: verify with pnpm run type-check, lint, test, build

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `apps/notes-app/` (standalone frontend SPA)
- **Source code**: `apps/notes-app/src/` following Custom FSD 6-layer structure
- **Path alias**: `#/` → `src/*` (cross-slice imports)

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Project initialization, tooling, and basic FSD structure

- [x] T001 Create `apps/notes-app/package.json` with all dependencies (React 19, Vite 7.x, TailwindCSS 4.x, TanStack Query 5.x, Zustand 5.x, React Router 7.x, React Hook Form, Zod, MSW 2.x, shadcn/ui) and scripts (dev, build, preview, type-check, lint, test, test:e2e)
- [x] T002 [P] Create TypeScript configs: `apps/notes-app/tsconfig.json` (base with `#/*` path alias), `apps/notes-app/tsconfig.app.json` (app-specific), `apps/notes-app/tsconfig.node.json` (node-specific)
- [x] T003 [P] Create `apps/notes-app/vite.config.ts` with React plugin, @tailwindcss/vite plugin, `#` path alias, and Vitest configuration
- [x] T004 [P] Create `apps/notes-app/index.html` entry HTML file
- [x] T005 [P] Create ESLint config (`apps/notes-app/eslint.config.js`) with TypeScript and React rules
- [x] T006 Install dependencies: run `pnpm install` in `apps/notes-app/`
- [x] T007 Initialize shadcn/ui: run `pnpm dlx shadcn@latest init` and add base components (Button, Input, Dialog, Card, Textarea, Select, Label, Badge, Separator)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Shared Layer (Non-domain)

- [x] T008 Create `apps/notes-app/src/Shared/Type/Common.ts` with shared API response types (`ApiResponse<T>`, `ApiError`) and `apps/notes-app/src/Shared/Type/index.ts` barrel export
- [x] T009 [P] Create `apps/notes-app/src/Shared/Api/httpClient.ts` with custom fetch wrapper (BASE_URL `/api`, GET/POST/PUT/DELETE methods, error handling) and `apps/notes-app/src/Shared/Api/index.ts` barrel export
- [x] T010 [P] Create `apps/notes-app/src/Shared/Config/Routes.ts` with route path constants (`/`, `/notes/new`, `/notes/:id`, `/categories`) and `apps/notes-app/src/Shared/Config/index.ts` barrel export
- [x] T011 [P] Create `apps/notes-app/src/Shared/Lib/DateFormat.ts` with date formatting utility (ISO string → human-readable) and `apps/notes-app/src/Shared/Lib/index.ts` barrel export
- [x] T012 [P] Create `apps/notes-app/src/Shared/Ui/ErrorBoundary/ErrorBoundary.tsx` + `index.ts` with React Error Boundary component, and `apps/notes-app/src/Shared/Ui/index.ts` barrel export

### Entities Layer (Domain - read-oriented)

- [ ] T013 [P] Create `apps/notes-app/src/Entities/Note/Type/Note.ts` with Note type definition (id, title, content, categoryId, createdAt, updatedAt) and `apps/notes-app/src/Entities/Note/index.ts` initial barrel export
- [ ] T014 [P] Create `apps/notes-app/src/Entities/Category/Type/Category.ts` with Category type definition (id, name, isDefault) and `apps/notes-app/src/Entities/Category/index.ts` initial barrel export
- [ ] T015 [P] Create `apps/notes-app/src/Entities/Category/Config/CategoryConfig.ts` with DEFAULT_CATEGORIES, ALL_CATEGORY_ID, UNCATEGORIZED_CATEGORY_ID constants
- [ ] T016 Create `apps/notes-app/src/Entities/Note/__Mock__/noteMockData.ts` with initial mock notes data (5+ notes across categories) — NOT exported from index.ts
- [ ] T017 [P] Create `apps/notes-app/src/Entities/Category/__Mock__/categoryMockData.ts` with initial mock categories data (default + 3 custom categories) — NOT exported from index.ts
- [ ] T018 Create `apps/notes-app/src/Entities/Note/Api/Get.ts` with getNotes (list with filters), getNote (by id) HTTP functions and `apps/notes-app/src/Entities/Note/Api/Query.ts` with noteQueryOptions factory + noteQueryKeys. Update `apps/notes-app/src/Entities/Note/index.ts` barrel export
- [ ] T019 Create `apps/notes-app/src/Entities/Category/Api/Get.ts` with getCategories HTTP function and `apps/notes-app/src/Entities/Category/Api/Query.ts` with categoryQueryOptions factory + categoryQueryKeys. Update `apps/notes-app/src/Entities/Category/index.ts` barrel export
- [ ] T020 Create `apps/notes-app/src/Entities/Note/Model/Hook/useNotes.ts` (list query hook with categoryId/keyword/sort params) and `apps/notes-app/src/Entities/Note/Model/Hook/useNote.ts` (single note query hook). Update barrel export
- [ ] T021 [P] Create `apps/notes-app/src/Entities/Category/Model/Hook/useCategories.ts` (categories list query hook). Update barrel export

### MSW Mock API Setup

- [ ] T022 Create `apps/notes-app/src/Entities/Note/__Mock__/noteHandlers.ts` with MSW handlers for GET /api/notes (with categoryId, keyword, sort query params) and GET /api/notes/:id — reads from in-memory mock data
- [ ] T023 [P] Create `apps/notes-app/src/Entities/Category/__Mock__/categoryHandlers.ts` with MSW handlers for GET /api/categories and GET /api/categories/:id/notes-count — reads from in-memory mock data
- [ ] T024 Create `apps/notes-app/src/App/Mock/browser.ts` combining all MSW handlers (note + category read handlers), initializing ServiceWorker. Import handlers directly from __Mock__ segments (allowed for App layer)
- [ ] T025 Create `apps/notes-app/src/main.tsx` with async MSW initialization (dev mode only), then React app render

### App Layer (Non-domain)

- [ ] T026 Create `apps/notes-app/src/App/Style/global.css` with `@import "tailwindcss"` and custom CSS variables (shadcn/ui theming)
- [ ] T027 [P] Create `apps/notes-app/src/App/Config/Env.ts` with environment configuration (API base URL, MSW flag)
- [ ] T028 Create `apps/notes-app/src/App/Provider/QueryProvider.tsx` with TanStack Query QueryClientProvider setup and `apps/notes-app/src/App/Provider/index.ts` barrel export
- [ ] T029 Create `apps/notes-app/src/App/Router/AppRouter.tsx` with createBrowserRouter and route definitions (/, /notes/new, /notes/:id, /categories) as lazy-loaded pages. Create `apps/notes-app/src/App/Router/index.ts` barrel export

### Foundational Verification

- [ ] T030 Run MSW Service Worker init (`pnpm exec msw init public/ --save`), verify dev server starts (`pnpm dev`), and confirm GET /api/notes and GET /api/categories return mock data in browser

**Checkpoint**: Foundation ready — all shared infrastructure, entities, mock API, and app shell are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — 노트 작성 (Priority: P1) MVP

**Goal**: Users can create new notes with title, content, and category selection

**Independent Test**: Open app → click "새 노트 작성" → enter title/content → select category → save → verify note appears in list

### Tests for User Story 1 (MANDATORY - TDD Required)

> **CONSTITUTION REQUIREMENT: Write these tests FIRST, ensure they FAIL before implementation**
> **E2E TESTS ARE MANDATORY**: Per constitution v2.1.2, all user stories MUST have E2E tests

- [ ] T031 [P] [US1] Unit test for NoteWrite mutation in `apps/notes-app/src/Features/NoteWrite/Api/Post.test.ts` — test createNote POST request format and response (Vitest + MSW server)
- [ ] T032 [P] [US1] Unit test for NoteEditor widget in `apps/notes-app/src/Widgets/NoteEditor/Ui/NoteEditor/NoteEditor.test.tsx` — test form rendering, validation (empty title), category select, submit callback (Vitest + Testing Library)

### Implementation for User Story 1

#### Features/NoteWrite (하위 도메인 of Note)

- [ ] T033 [P] [US1] Create `apps/notes-app/src/Features/NoteWrite/Type/NoteWrite.ts` with CreateNoteRequest and CreateNoteResponse types. Create `apps/notes-app/src/Features/NoteWrite/index.ts` barrel export
- [ ] T034 [US1] Create `apps/notes-app/src/Features/NoteWrite/Api/Post.ts` with postNote HTTP function and `apps/notes-app/src/Features/NoteWrite/Api/Mutation.ts` with noteWriteMutationOptions factory + noteWriteMutationKeys. Update barrel export
- [ ] T035 [US1] Create `apps/notes-app/src/Features/NoteWrite/__Mock__/noteWriteHandlers.ts` with MSW handler for POST /api/notes (validate title required, generate id/timestamps, add to in-memory store). Update `apps/notes-app/src/App/Mock/browser.ts` to include this handler
- [ ] T036 [US1] Create `apps/notes-app/src/Features/NoteWrite/Model/Hook/useCreateNote.ts` with mutation hook (uses noteWriteMutationOptions, invalidates noteQueryKeys on success, navigates to home). Update barrel export

#### Widgets/NoteEditor

- [ ] T037 [US1] Create `apps/notes-app/src/Widgets/NoteEditor/Model/Hook/useNoteForm.ts` with React Hook Form + Zod schema (noteFormSchema from data-model.md) for note create/edit form state management
- [ ] T038 [US1] Create `apps/notes-app/src/Widgets/NoteEditor/Ui/NoteEditor/NoteEditor.tsx` + `index.ts` with note form UI (title input, content textarea, category select using useCategories, save/cancel buttons, unsaved changes prompt). Create `apps/notes-app/src/Widgets/NoteEditor/index.ts` barrel export

#### Pages/NoteWritePage

- [ ] T039 [US1] Create `apps/notes-app/src/Pages/NoteWritePage/Ui/NoteWritePage/NoteWritePage.tsx` + `index.ts` composing NoteEditor widget with useCreateNote hook. Create `apps/notes-app/src/Pages/NoteWritePage/index.ts` barrel export. Wire into AppRouter

#### E2E Test (MANDATORY)

- [ ] T040 [US1] **E2E test** in `apps/notes-app/e2e/note-write.spec.ts` — E2E-US1-001: create note with title/content/category → verify in list; E2E-US1-002: attempt save without title → validation error shown (Playwright)

#### Verification

- [ ] T041 [US1] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 1 complete — notes can be created with full form validation

---

## Phase 4: User Story 2 — 노트 목록 조회 (Priority: P1) MVP

**Goal**: Users can view all notes sorted by latest first, with empty state handling

**Independent Test**: Open app → see note list sorted by createdAt desc → click note → navigate to detail

### Tests for User Story 2 (MANDATORY - TDD Required)

- [ ] T042 [P] [US2] Unit test for NoteCard component in `apps/notes-app/src/Entities/Note/Ui/NoteCard/NoteCard.test.tsx` — test rendering title, category badge, date, click handler (Vitest + Testing Library)
- [ ] T043 [P] [US2] Unit test for NoteList widget in `apps/notes-app/src/Widgets/NoteList/Ui/NoteList/NoteList.test.tsx` — test list rendering, loading state, empty state with CTA button (Vitest + Testing Library)

### Implementation for User Story 2

#### Entities/Note/Ui

- [ ] T044 [P] [US2] Create `apps/notes-app/src/Entities/Note/Ui/NoteCard/NoteCard.tsx` + `index.ts` displaying note title, category badge (using CategoryBadge), formatted createdAt, onClick navigation. Update Entities/Note barrel export
- [ ] T045 [P] [US2] Create `apps/notes-app/src/Entities/Note/Ui/EmptyNoteState/EmptyNoteState.tsx` + `index.ts` with "아직 작성된 노트가 없습니다" message and "첫 노트 작성하기" CTA button. Update barrel export

#### Entities/Category/Ui

- [ ] T046 [US2] Create `apps/notes-app/src/Entities/Category/Ui/CategoryBadge/CategoryBadge.tsx` + `index.ts` displaying category name as a badge component. Update Entities/Category barrel export

#### Widgets/NoteList

- [ ] T047 [US2] Create `apps/notes-app/src/Widgets/NoteList/Ui/NoteList/NoteList.tsx` + `NoteList.loading.tsx` + `index.ts` composing useNotes hook, rendering NoteCard list (sorted by createdAt desc) with loading skeleton and EmptyNoteState. Create `apps/notes-app/src/Widgets/NoteList/index.ts` barrel export

#### Pages/HomePage

- [ ] T048 [US2] Create `apps/notes-app/src/Pages/HomePage/Ui/HomePage/HomePage.tsx` + `index.ts` composing NoteList widget with "새 노트 작성" navigation button. Create `apps/notes-app/src/Pages/HomePage/index.ts` barrel export. Wire into AppRouter

#### E2E Test (MANDATORY)

- [ ] T049 [US2] **E2E test** in `apps/notes-app/e2e/note-list.spec.ts` — E2E-US2-001: verify notes displayed in latest-first order; E2E-US2-002: verify empty state with CTA (Playwright)

#### Verification

- [ ] T050 [US2] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Stories 1 & 2 complete — MVP functional: create notes and view list

---

## Phase 5: User Story 3 — 노트 상세 보기 (Priority: P2)

**Goal**: Users can view full note details in a read-only detail screen

**Independent Test**: Click a note from list → see full title, content, category, createdAt, updatedAt

### Tests for User Story 3 (MANDATORY - TDD Required)

- [ ] T051 [P] [US3] Unit test for NoteDetail widget in `apps/notes-app/src/Widgets/NoteDetail/Ui/NoteDetail/NoteDetail.test.tsx` — test rendering all note fields, edit/delete button presence (Vitest + Testing Library)

### Implementation for User Story 3

#### Widgets/NoteDetail

- [ ] T052 [US3] Create `apps/notes-app/src/Widgets/NoteDetail/Ui/NoteDetail/NoteDetail.tsx` + `index.ts` displaying note title, content, category badge, createdAt, updatedAt, with "편집" and "삭제" action buttons. Create `apps/notes-app/src/Widgets/NoteDetail/index.ts` barrel export

#### Pages/NoteViewPage

- [ ] T053 [US3] Create `apps/notes-app/src/Pages/NoteViewPage/Ui/NoteViewPage/NoteViewPage.tsx` + `index.ts` composing NoteDetail widget with useNote(id) hook, loading/error states. Create `apps/notes-app/src/Pages/NoteViewPage/index.ts` barrel export. Wire into AppRouter

#### E2E Test (MANDATORY)

- [ ] T054 [US3] **E2E test** in `apps/notes-app/e2e/note-view.spec.ts` — E2E-US3-001: click note from list → verify detail screen shows all fields (Playwright)

#### Verification

- [ ] T055 [US3] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 3 complete — full note detail view functional

---

## Phase 6: User Story 4 — 노트 편집 (Priority: P2)

**Goal**: Users can edit existing notes (title, content, category) with immediate reflection

**Independent Test**: From note detail → click edit → modify fields → save → verify changes reflected

### Tests for User Story 4 (MANDATORY - TDD Required)

- [ ] T056 [P] [US4] Unit test for NoteEdit mutation in `apps/notes-app/src/Features/NoteEdit/Api/Put.test.ts` — test updateNote PUT request format and response (Vitest + MSW server)

### Implementation for User Story 4

#### Features/NoteEdit (하위 도메인 of Note)

- [ ] T057 [P] [US4] Create `apps/notes-app/src/Features/NoteEdit/Type/NoteEdit.ts` with UpdateNoteRequest and UpdateNoteResponse types. Create `apps/notes-app/src/Features/NoteEdit/index.ts` barrel export
- [ ] T058 [US4] Create `apps/notes-app/src/Features/NoteEdit/Api/Put.ts` with putNote HTTP function and `apps/notes-app/src/Features/NoteEdit/Api/Mutation.ts` with noteEditMutationOptions factory + noteEditMutationKeys. Update barrel export
- [ ] T059 [US4] Create MSW handler for PUT /api/notes/:id in `apps/notes-app/src/Entities/Note/__Mock__/noteHandlers.ts` (add to existing handlers — validate, update in-memory store, update updatedAt). Update `apps/notes-app/src/App/Mock/browser.ts` if needed
- [ ] T060 [US4] Create `apps/notes-app/src/Features/NoteEdit/Model/Hook/useUpdateNote.ts` with mutation hook (uses noteEditMutationOptions, invalidates noteQueryKeys on success). Update barrel export

#### NoteViewPage Edit Mode Integration

- [ ] T061 [US4] Update `apps/notes-app/src/Pages/NoteViewPage/Ui/NoteViewPage/NoteViewPage.tsx` to integrate edit mode toggle — reuse NoteEditor widget with existing note data pre-filled, useUpdateNote hook for save

#### E2E Test (MANDATORY)

- [ ] T062 [US4] **E2E test** in `apps/notes-app/e2e/note-edit.spec.ts` — E2E-US4-001: navigate to detail → edit title → save → verify title updated in detail and list (Playwright)

#### Verification

- [ ] T063 [US4] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 4 complete — notes can be edited with changes reflected

---

## Phase 7: User Story 5 — 노트 삭제 (Priority: P2)

**Goal**: Users can delete notes with confirmation dialog

**Independent Test**: From note detail → click delete → confirm → verify note removed from list

### Tests for User Story 5 (MANDATORY - TDD Required)

- [ ] T064 [P] [US5] Unit test for NoteDelete mutation in `apps/notes-app/src/Features/NoteDelete/Api/Delete.test.ts` — test deleteNote DELETE request and response (Vitest + MSW server)

### Implementation for User Story 5

#### Features/NoteDelete (하위 도메인 of Note)

- [ ] T065 [P] [US5] Create `apps/notes-app/src/Features/NoteDelete/Api/Delete.ts` with deleteNote HTTP function and `apps/notes-app/src/Features/NoteDelete/Api/Mutation.ts` with noteDeleteMutationOptions factory + noteDeleteMutationKeys. Create `apps/notes-app/src/Features/NoteDelete/index.ts` barrel export
- [ ] T066 [US5] Create MSW handler for DELETE /api/notes/:id in `apps/notes-app/src/Entities/Note/__Mock__/noteHandlers.ts` (add to existing handlers — remove from in-memory store). Update browser.ts if needed
- [ ] T067 [US5] Create `apps/notes-app/src/Features/NoteDelete/Model/Hook/useDeleteNote.ts` with mutation hook (uses noteDeleteMutationOptions, invalidates noteQueryKeys on success, navigates to home). Update barrel export

#### NoteDetail Delete Integration

- [ ] T068 [US5] Update `apps/notes-app/src/Widgets/NoteDetail/Ui/NoteDetail/NoteDetail.tsx` to wire delete button → ConfirmDialog ("이 노트를 삭제하시겠습니까?") → useDeleteNote hook on confirm

#### E2E Test (MANDATORY)

- [ ] T069 [US5] **E2E test** in `apps/notes-app/e2e/note-delete.spec.ts` — E2E-US5-001: delete note with confirm → verify removed from list; E2E-US5-002: cancel delete → note preserved (Playwright)

#### Verification

- [ ] T070 [US5] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Stories 3-5 complete — full CRUD for notes functional

---

## Phase 8: User Story 6 — 카테고리 관리 (Priority: P3)

**Goal**: Users can create and delete custom categories; default categories are protected

**Independent Test**: Open category management → create "독서" category → verify it appears; delete it → verify notes moved to uncategorized

### Tests for User Story 6 (MANDATORY - TDD Required)

- [ ] T071 [P] [US6] Unit test for CategoryWrite mutations in `apps/notes-app/src/Features/CategoryWrite/Api/Mutation.test.ts` — test createCategory POST and deleteCategory DELETE (Vitest + MSW server)

### Implementation for User Story 6

#### Features/CategoryWrite (하위 도메인 of Category)

- [ ] T072 [P] [US6] Create `apps/notes-app/src/Features/CategoryWrite/Type/CategoryWrite.ts` with CreateCategoryRequest/Response types. Create `apps/notes-app/src/Features/CategoryWrite/index.ts` barrel export
- [ ] T073 [US6] Create `apps/notes-app/src/Features/CategoryWrite/Api/Post.ts` with postCategory HTTP function, `apps/notes-app/src/Features/CategoryWrite/Api/Delete.ts` with deleteCategory HTTP function, and `apps/notes-app/src/Features/CategoryWrite/Api/Mutation.ts` with categoryWriteMutationOptions factory (create + delete). Update barrel export
- [ ] T074 [US6] Create `apps/notes-app/src/Features/CategoryWrite/__Mock__/categoryWriteHandlers.ts` with MSW handlers for POST /api/categories (validate unique name, generate id) and DELETE /api/categories/:id (reject default, move notes to uncategorized, return movedNotesCount). Update browser.ts
- [ ] T075 [US6] Create `apps/notes-app/src/Features/CategoryWrite/Model/Hook/useCreateCategory.ts` and `apps/notes-app/src/Features/CategoryWrite/Model/Hook/useDeleteCategory.ts` with mutation hooks (invalidate categoryQueryKeys on success). Update barrel export

#### Pages/CategoryManagePage

- [ ] T076 [US6] Create `apps/notes-app/src/Pages/CategoryManagePage/Ui/CategoryManagePage/CategoryManagePage.tsx` + `index.ts` with category list (useCategories), create form (input + add button), delete button per category (disabled for isDefault, ConfirmDialog with notes count). Create `apps/notes-app/src/Pages/CategoryManagePage/index.ts` barrel export. Wire into AppRouter

#### E2E Test (MANDATORY)

- [ ] T077 [US6] **E2E test** in `apps/notes-app/e2e/category-manage.spec.ts` — E2E-US6-001: create category → verify in list and note form select; E2E-US6-002: delete category with notes → verify notes moved to uncategorized (Playwright)

#### Verification

- [ ] T078 [US6] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 6 complete — category CRUD functional

---

## Phase 9: User Story 7 — 카테고리별 노트 필터링 (Priority: P3)

**Goal**: Users can filter notes by category on the home page

**Independent Test**: On home page → select "업무" category filter → only "업무" notes shown → select "전체" → all notes shown

### Tests for User Story 7 (MANDATORY - TDD Required)

- [ ] T079 [P] [US7] Unit test for FilterSlice and useFilterStore in `apps/notes-app/src/Features/CategoryFilter/Model/Store/useFilterStore.test.ts` — test initial state (selectedCategoryId = 'all'), setSelectedCategoryId action (Vitest)

### Implementation for User Story 7

#### Features/CategoryFilter (하위 도메인 of Category, Zustand)

- [ ] T080 [P] [US7] Create `apps/notes-app/src/Features/CategoryFilter/Type/CategoryFilter.ts` with FilterState type. Create `apps/notes-app/src/Features/CategoryFilter/index.ts` barrel export
- [ ] T081 [US7] Create `apps/notes-app/src/Features/CategoryFilter/Model/Store/FilterSlice.ts` with FilterSlice type and createFilterSlice (selectedCategoryId state + setSelectedCategoryId action). Create `apps/notes-app/src/Features/CategoryFilter/Model/Store/useFilterStore.ts` combining slices with Zustand create(). Update barrel export
- [ ] T082 [US7] Create `apps/notes-app/src/Features/CategoryFilter/Model/Hook/useCategoryFilter.ts` hook wrapping useFilterStore + useCategories for UI consumption. Update barrel export

#### Widgets/CategoryFilter

- [ ] T083 [US7] Create `apps/notes-app/src/Widgets/CategoryFilter/Ui/CategoryFilter/CategoryFilter.tsx` + `index.ts` rendering category tabs/buttons (using useCategories + useCategoryFilter), highlighting active filter. Create `apps/notes-app/src/Widgets/CategoryFilter/index.ts` barrel export

#### HomePage Integration

- [ ] T084 [US7] Update `apps/notes-app/src/Pages/HomePage/Ui/HomePage/HomePage.tsx` to include CategoryFilter widget above NoteList. Update `apps/notes-app/src/Widgets/NoteList/Model/Hook/useNoteListFilter.ts` to read selectedCategoryId from useFilterStore and pass to useNotes query params

#### E2E Test (MANDATORY)

- [ ] T085 [US7] **E2E test** in `apps/notes-app/e2e/category-filter.spec.ts` — E2E-US7-001: select category filter → verify only matching notes shown; select "전체" → all notes shown; select empty category → empty state shown (Playwright)

#### Verification

- [ ] T086 [US7] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 7 complete — category filtering functional with Zustand state

---

## Phase 10: User Story 8 — 노트 검색 (Priority: P3)

**Goal**: Users can search notes by keyword (matches title and content)

**Independent Test**: Type "회의" in search bar → only matching notes displayed → clear search → all notes restored

### Tests for User Story 8 (MANDATORY - TDD Required)

- [ ] T087 [P] [US8] Unit test for SearchBar widget in `apps/notes-app/src/Widgets/SearchBar/Ui/SearchBar/SearchBar.test.tsx` — test input rendering, keyword change callback, clear functionality (Vitest + Testing Library)

### Implementation for User Story 8

#### Features/NoteSearch

- [ ] T088 [P] [US8] Create `apps/notes-app/src/Features/NoteSearch/Type/NoteSearch.ts` with NoteSearchParams type. Create `apps/notes-app/src/Features/NoteSearch/index.ts` barrel export
- [ ] T089 [US8] Create `apps/notes-app/src/Features/NoteSearch/Model/Hook/useNoteSearch.ts` with debounced search keyword state management (useState + useCallback with debounce). Update barrel export

#### Widgets/SearchBar

- [ ] T090 [US8] Create `apps/notes-app/src/Widgets/SearchBar/Model/Hook/useSearchKeyword.ts` consuming useNoteSearch for search state. Create `apps/notes-app/src/Widgets/SearchBar/Ui/SearchBar/SearchBar.tsx` + `index.ts` with search input field and clear button. Create `apps/notes-app/src/Widgets/SearchBar/index.ts` barrel export

#### HomePage Integration

- [ ] T091 [US8] Update `apps/notes-app/src/Pages/HomePage/Ui/HomePage/HomePage.tsx` to include SearchBar widget. Update `apps/notes-app/src/Widgets/NoteList/Model/Hook/useNoteListFilter.ts` to also read keyword from search state and pass to useNotes query params

#### E2E Test (MANDATORY)

- [ ] T092 [US8] **E2E test** in `apps/notes-app/e2e/note-search.spec.ts` — E2E-US8-001: type keyword → matching notes shown; clear keyword → all notes restored; no match → empty state (Playwright)

#### Verification

- [ ] T093 [US8] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 8 complete — search functional

---

## Phase 11: User Story 9 — 사이드바 네비게이션 (Priority: P3)

**Goal**: Users can navigate via sidebar with category shortcuts and responsive mobile overlay

**Independent Test**: Click sidebar menu items → navigate to correct pages; click category → filter applied; mobile → sidebar as overlay

### Tests for User Story 9 (MANDATORY - TDD Required)

- [ ] T094 [P] [US9] Unit test for Sidebar widget in `apps/notes-app/src/Widgets/Sidebar/Ui/Sidebar/Sidebar.test.tsx` — test menu items rendering, category list, navigation links, responsive toggle (Vitest + Testing Library)

### Implementation for User Story 9

#### Widgets/Sidebar

- [ ] T095 [US9] Create `apps/notes-app/src/Widgets/Sidebar/Model/Hook/useSidebarState.ts` with sidebar open/close state (useState for single Widget scope)
- [ ] T096 [US9] Create `apps/notes-app/src/Widgets/Sidebar/Ui/Sidebar/Sidebar.tsx` + `index.ts` with navigation links (Home, Category Manage), category list with filter click (uses useCategories + useCategoryFilter from Features/CategoryFilter), responsive sidebar (desktop persistent, mobile overlay with toggle). Create `apps/notes-app/src/Widgets/Sidebar/index.ts` barrel export

#### App Layout Integration

- [ ] T097 [US9] Create layout wrapper in `apps/notes-app/src/App/Router/AppLayout.tsx` composing Sidebar widget with main content area (React Router Outlet). Update AppRouter to use this layout for all routes

#### E2E Test (MANDATORY)

- [ ] T098 [US9] **E2E test** in `apps/notes-app/e2e/sidebar-navigation.spec.ts` — E2E-US9-001: click sidebar menu items → verify navigation; click sidebar category → verify filter applied on home page (Playwright)

#### Verification

- [ ] T099 [US9] Run frontend verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build`

**Checkpoint**: User Story 9 complete — sidebar navigation with responsive behavior

---

## Phase 12: E2E Integration Testing (MANDATORY)

**Purpose**: Verify complete user journeys across all user stories work together

**CONSTITUTION REQUIREMENT (v2.1.2)**: This phase is MANDATORY for all features

### E2E Test Setup

- [ ] T100 Setup Playwright in `apps/notes-app/`: create `apps/notes-app/playwright.config.ts` with webServer (pnpm dev), browser settings. Add `test:e2e` and `test:e2e:ui` scripts to package.json

### Cross-Story E2E Tests

- [ ] T101 **E2E test** in `apps/notes-app/e2e/integration-workflow.spec.ts` — E2E-INT-001: create category → create note in category → edit note → search for note → delete note — full CRUD workflow
- [ ] T102 **E2E test** in `apps/notes-app/e2e/integration-category-cascade.spec.ts` — E2E-INT-002: create category → create notes in it → delete category → verify notes moved to uncategorized → filter by uncategorized → see moved notes

### E2E Verification

- [ ] T103 Run all E2E tests (`pnpm run test:e2e`), verify all pass, document any failures and resolutions

**Checkpoint**: All E2E tests pass — feature is ready for final polish

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T104 [P] Add loading states and error boundaries to all pages — wrap with Suspense + ErrorBoundary from Shared/Ui
- [ ] T105 [P] Accessibility audit: verify all interactive elements have proper ARIA labels, keyboard navigation works across all pages (WCAG 2.1 AA)
- [ ] T106 [P] Note Config: Create `apps/notes-app/src/Entities/Note/Config/NoteConfig.ts` with NOTE_TITLE_MAX_LENGTH, NOTE_CONTENT_MAX_LENGTH constants. Refactor Zod schemas to use these constants
- [ ] T107 Responsive design polish: verify all pages work at desktop (1024px+) and mobile (320px-768px) breakpoints per SC-006
- [ ] T108 Run quickstart.md validation: follow all steps in quickstart.md from scratch and confirm they work
- [ ] T109 Final full verification: `pnpm run type-check && pnpm run lint && pnpm run test && pnpm run test:e2e && pnpm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T006 install) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1 but shares NoteEditor dependency
- **User Story 3 (Phase 5)**: Depends on Phase 2. Independent of US1/US2 for implementation, but practically builds on note list navigation
- **User Story 4 (Phase 6)**: Depends on US3 (NoteViewPage) and US1 (NoteEditor widget reuse)
- **User Story 5 (Phase 7)**: Depends on US3 (NoteDetail widget for delete button integration)
- **User Story 6 (Phase 8)**: Depends on Phase 2 only. Independent of note features
- **User Story 7 (Phase 9)**: Depends on US6 (categories exist) for meaningful testing, but can implement with defaults
- **User Story 8 (Phase 10)**: Depends on US2 (NoteList/HomePage to integrate SearchBar)
- **User Story 9 (Phase 11)**: Depends on US7 (CategoryFilter for sidebar), US2 (HomePage)
- **E2E Integration (Phase 12)**: Depends on ALL user stories complete
- **Polish (Phase 13)**: Depends on all user stories and E2E integration

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Types/Contracts before API functions
3. API functions before mutation/query hooks
4. MSW handlers before hook integration testing
5. Hooks before UI widgets
6. Widgets before page composition
7. E2E test after page is functional
8. Verification as final step

### Parallel Opportunities

- Phase 1: T002, T003, T004, T005 can run in parallel
- Phase 2: T009-T012 (Shared segments) in parallel; T013-T015 (Entity types) in parallel; T016-T017 (mock data) in parallel after types
- Within each US: test tasks marked [P] can run in parallel

---

## Custom FSD Rules Coverage by Task

| Custom FSD Rule | Verified By Tasks | Key Files |
|---|---|---|
| 6-layer hierarchy | All phases | Full directory structure |
| Non-domain layers (slice=segment) | T008-T012, T026-T029 | App/*, Shared/* |
| Domain layers (slice→segment) | T013-T021, T033-T036 | Entities/*, Features/* |
| Parent/child sub-domains | T033-T036 (NoteWrite), T057-T060 (NoteEdit), T065-T067 (NoteDelete), T072-T075 (CategoryWrite), T080-T082 (CategoryFilter) | Features/NoteWrite→Entities/Note, Features/CategoryFilter→Entities/Category |
| Segment types (__Mock__, Api, Config, Model, Type, Ui) | T013-T023 | Entities/Note has ALL 6 segments |
| 1-level segment grouping | T020, T036, T081 | Model/Hook/, Model/Store/ |
| Public API (index.ts) | Every slice creation task | All index.ts files |
| Import rules (relative/absolute) | Every implementation task | `#/Entities/Note` vs `../../Type/Note` |
| TanStack Query (queryOptions in Entities) | T018-T021 | Entities/*/Api/Query.ts |
| TanStack Query (mutationOptions in Features) | T034, T058, T065, T073 | Features/*/Api/Mutation.ts |
| Zustand slices pattern | T081 | Features/CategoryFilter/Model/Store/ |
| File naming (PascalCase dirs, camelCase hooks) | All tasks | Directory names vs hook filenames |
| UI component structure | T044-T046, T052, T083, T096 | ComponentName/ + ComponentName.tsx + index.ts |
| Path alias (#/) | T002, T003 | tsconfig.json, vite.config.ts |
| __Mock__ export forbidden | T016-T017, T022-T024 | index.ts files exclude __Mock__ |

---

## Implementation Branches

### Recommended Mode: Single Mode

```
feature/#13393034-fsd-notes-app
```

**Reason**: Single developer, focused on FSD rule validation. All 9 user stories are tightly coupled for rule coverage testing. Single branch simplifies the workflow.

### Branch Flow

```
develop (stable)
  │
  └── spec/#13393034-fsd-notes-app (current — specs + verification)
       │
       └── feature/#13393034-fsd-notes-app (implementation)
            │
            └── PR → spec/#13393034-fsd-notes-app
                      │
                      └── PR → develop (release)
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task
- Stop at any checkpoint to validate story independently
- This project validates ALL 14 Custom FSD rules — see coverage table above
