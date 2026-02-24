# Tasks: Recipe Book App

**Input**: Design documents from `/specs/#13403104-fsd-recipe-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Following constitution TDD requirements, tests are MANDATORY for business logic. E2E tests are MANDATORY for all user stories.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Requirements**:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- TDD approach: write failing tests first, then implement
- Follow FSD architecture per gem-fsd-architecture.md
- Frontend: verify with pnpm run type-check, lint, test, build

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

**CRITICAL — MONOREPO**: All app code lives under `apps/recipe-app/`.
- **Project root**: `apps/recipe-app/`
- **Source root**: `apps/recipe-app/src/`
- **FSD layers**: `src/App/`, `src/Pages/`, `src/Widgets/`, `src/Features/`, `src/Entities/`, `src/Shared/`
- **Path alias**: `#/` maps to `src/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project skeleton with all tooling configured

- [x] T001 Create project directory `apps/recipe-app/` with package.json including all dependencies (React 19, Vite 7, TailwindCSS 4, TanStack Query 5, Zustand 5, RHF, Zod, React Router 7, MSW 2, Vitest, Testing Library, Playwright)
- [x] T002 Configure TypeScript with strict mode (tsconfig.json, tsconfig.app.json, tsconfig.node.json) with `#/*` path alias
- [ ] T003 Configure Vite (vite.config.ts) with React plugin, @tailwindcss/vite plugin, `#` path alias, and Vitest settings (jsdom, globals, setup file)
- [ ] T004 [P] Configure ESLint (eslint.config.js) with TypeScript ESLint and React hooks plugins
- [ ] T005 [P] Configure Prettier (.prettierrc) with import sort plugin
- [ ] T006 Setup shadcn/ui components.json (new-york style, aliases: `#/Shared/Ui/Shadcn`, `#/Shared/Model`) and install base components (button, input, select, textarea, dialog, badge, card, label, separator) into `src/Shared/Ui/Shadcn/`
- [ ] T007 Create test setup file `src/test-setup.ts` with Testing Library jest-dom matchers and MSW server setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Shared Layer

- [ ] T008 Create `src/Shared/Model/Shadcn/Utils.ts` with cn() utility, group barrel, and segment barrel
- [ ] T009 [P] Create `src/Shared/Api/httpClient.ts` with fetch wrapper (GET/POST/PUT/DELETE, error handling via throw) and barrel
- [ ] T010 [P] Create `src/Shared/Config/Route.ts` (ROUTES constant for all app routes) and `src/Shared/Config/IngredientUnit.ts` (INGREDIENT_UNIT_LIST constant) with barrel
- [ ] T011 [P] Create `src/Shared/Type/index.ts` barrel for shared types
- [ ] T012 Create `src/Shared/Ui/ErrorBoundary/ErrorBoundary.tsx` with fallback UI, and `src/Shared/Ui/index.ts` barrel (re-export ErrorBoundary + Shadcn components)

### Category Entity (No Cross-Entity Dependencies)

- [ ] T013 Create `src/Entities/Category/Type/Domain/Category.ts` (Category type) with group barrel and segment barrel
- [ ] T014 Create `src/Entities/Category/__Mock__/Seed.ts` (6 predefined categories), `Db.ts` (getCategoryList), `Handler.ts` (GET /api/categories) with __Mock__ barrel
- [ ] T015 Create `src/Entities/Category/Api/Get.ts`, `Key.ts`, `Query.ts` (categoryQueryOption with queryOptions) with segment barrel
- [ ] T016 Create `src/Entities/Category/Model/Hook/useCategoryList.ts` with group barrel and segment barrel
- [ ] T017 Create `src/Entities/Category/Ui/CategoryBadge/CategoryBadge.tsx` (colored badge component) with component barrel and segment barrel
- [ ] T018 Create `src/Entities/Category/index.ts` slice barrel (re-export Type, Api, Model, Ui — NOT __Mock__)

### Recipe Entity (Cross-Entity Type Reference to Category)

- [ ] T019 Create `src/Entities/Recipe/Type/` with Domain/Recipe.ts (Recipe, Ingredient, Difficulty types), Dto/RecipeResponseDto.ts (snake_case RecipeDto with `import type { Category }` from `#/Entities/Category`), Query/RecipeQuery.ts (GetRecipeListQuery), Param/RecipeParam.ts — all with group barrels and segment barrel
- [ ] T020 Create `src/Entities/Recipe/__Mock__/Seed.ts` (5-6 sample recipes across categories), `Db.ts` (in-memory CRUD: getRecipeList, getRecipeById, createRecipe, updateRecipe, deleteRecipe), `Handler.ts` (GET handlers only) with __Mock__ barrel
- [ ] T021 Create `src/Entities/Recipe/Model/Lib/RecipeMapper.ts` (toRecipe, toRecipeList — snake_case DTO to camelCase domain) with group barrel and segment barrel
- [ ] T022 Create `src/Entities/Recipe/Api/Get.ts` (getRecipe, getRecipeList — uses RecipeMapper), `Key.ts` (recipeQueryKey), `Query.ts` (recipeQueryOption) with segment barrel
- [ ] T023 Create `src/Entities/Recipe/Model/Hook/useRecipe.ts` and `useRecipeList.ts` with group barrel (update segment barrel)
- [ ] T024 Create `src/Entities/Recipe/index.ts` slice barrel (re-export Type, Api, Model — NOT __Mock__, Ui added later in US1)

### App Layer

- [ ] T025 Create `src/App/Style/global.css` with TailwindCSS v4 imports (@import "tailwindcss")
- [ ] T026 [P] Create `src/App/Provider/QueryProvider.tsx` (QueryClientProvider wrapper) with barrel
- [ ] T027 Create `src/App/Mock/browser.ts` — import and aggregate Entity handlers (Category + Recipe) into setupWorker
- [ ] T028 Create `src/App/Router/AppRouter.tsx` with React Router routes (/, /recipes, /recipes/:id, /recipes/new, /recipes/:id/edit) using lazy loading and ErrorBoundary wrapping, with barrel
- [ ] T029 Create `src/main.tsx` entry point (MSW init in development, render App with Provider + Router) and `src/vite-env.d.ts`

### Foundational Tests

- [ ] T030 [P] Write unit test `src/Entities/Recipe/Model/Lib/RecipeMapper.test.ts` for toRecipe and toRecipeList mapping (snake_case to camelCase)
- [ ] T031 [P] Write unit test `src/Shared/Api/httpClient.test.ts` for GET/POST/PUT/DELETE and error handling

**Checkpoint**: Foundation ready — all shared infrastructure, entities, and routing in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Browse Recipe List with Category Filter (Priority: P1) MVP

**Goal**: Users can see recipe cards and filter by category. Delivers core browsing experience.

**Independent Test**: Load recipe list page with pre-populated mock data, verify card display with all fields, filter by category, verify empty states.

### Implementation for User Story 1

- [ ] T032 [US1] Create `src/Features/CategoryFilter/Type/CategoryFilter.ts` (CategoryFilterState — FE-only, flat, not in Dto/) with segment barrel
- [ ] T033 [US1] Create `src/Features/CategoryFilter/Model/Store/useCategoryFilterStore.ts` (Zustand store: selectedCategoryId, setSelectedCategoryId) with group barrel and segment barrel
- [ ] T034 [US1] Create `src/Features/CategoryFilter/Model/Hook/useCategoryFilter.ts` (derived state: isAllSelected) with group barrel (update segment barrel)
- [ ] T035 [US1] Create `src/Features/CategoryFilter/Ui/CategoryFilterBar/CategoryFilterBar.tsx` (filter bar with category chips, uses useCategoryList + useCategoryFilter) with component barrel and segment barrel
- [ ] T036 [US1] Create `src/Features/CategoryFilter/index.ts` slice barrel

- [ ] T037 [P] [US1] Create `src/Entities/Recipe/Ui/RecipeDifficulty/RecipeDifficulty.tsx` (difficulty badge — single domain info), `src/Entities/Recipe/Ui/RecipeCookingTime/RecipeCookingTime.tsx` (formatted time — single domain info), `src/Entities/Recipe/Ui/EmptyRecipeState/EmptyRecipeState.tsx` (empty message) — each with component barrel, plus segment barrel. Update slice barrel.

- [ ] T038 [US1] Create `src/Widgets/RecipeList/Ui/RecipeListCard/RecipeListCard.tsx` (multi-domain: Recipe info + CategoryBadge from Entities/Category) with component barrel
- [ ] T039 [US1] Create `src/Widgets/RecipeList/Ui/RecipeListEmpty/RecipeListEmpty.tsx` (empty state with Link to create page — separate folder: has routing) with component barrel
- [ ] T040 [US1] Create `src/Widgets/RecipeList/Ui/RecipeList/RecipeList.tsx` (data fetch via useRecipeList + filter via useCategoryFilter, loading/error/empty states) and `RecipeList.loading.tsx` (skeleton sibling) with component barrel and segment barrel
- [ ] T041 [US1] Create `src/Widgets/RecipeList/index.ts` slice barrel

- [ ] T042 [US1] Create `src/Pages/RecipeList/Ui/RecipeListPage/RecipeListPage.tsx` (compose CategoryFilterBar + RecipeList widget) with component barrel, segment barrel, and slice barrel
- [ ] T043 [US1] Update `src/App/Router/AppRouter.tsx` to wire RecipeListPage to `/` and `/recipes` routes

### Tests for User Story 1

- [ ] T044 [P] [US1] Write test `src/Features/CategoryFilter/Model/Store/useCategoryFilterStore.test.ts` for store state management
- [ ] T045 [P] [US1] Write test `src/Widgets/RecipeList/Ui/RecipeList/RecipeList.test.tsx` for list rendering, loading state, and empty state
- [ ] T046 [P] [US1] Write test `src/Entities/Category/Ui/CategoryBadge/CategoryBadge.test.tsx` for badge rendering with name and color

**Checkpoint**: User Story 1 fully functional — recipe list with category filtering works independently.

---

## Phase 4: User Story 2 — View Recipe Detail (Priority: P2)

**Goal**: Users can tap a recipe card to see full details including all ingredients.

**Independent Test**: Navigate to recipe detail via URL with recipe ID, verify all fields displayed, verify back navigation preserves filter, verify 404 for invalid ID.

### Implementation for User Story 2

- [ ] T047 [US2] Create `src/Widgets/RecipeDetail/Ui/RecipeIngredientList/RecipeIngredientList.tsx` (ingredient list display: name, amount, unit) with component barrel
- [ ] T048 [US2] Create `src/Widgets/RecipeDetail/Ui/RecipeDetail/RecipeDetail.tsx` (detail composition: title, description, CategoryBadge, RecipeCookingTime, RecipeDifficulty, RecipeIngredientList, edit/delete action slots) and `RecipeDetail.loading.tsx` (skeleton sibling) with component barrel and segment barrel
- [ ] T049 [US2] Create `src/Widgets/RecipeDetail/index.ts` slice barrel

- [ ] T050 [US2] Create `src/Pages/RecipeDetail/Ui/RecipeDetailPage/RecipeDetailPage.tsx` (useParams for :id, useRecipe hook, loading/error/notFound states) with component barrel, segment barrel, and slice barrel
- [ ] T051 [US2] Update `src/App/Router/AppRouter.tsx` to wire RecipeDetailPage to `/recipes/:id` route

### Tests for User Story 2

- [ ] T052 [P] [US2] Write test `src/Widgets/RecipeDetail/Ui/RecipeDetail/RecipeDetail.test.tsx` for detail rendering with all fields and ingredients
- [ ] T053 [P] [US2] Write test `src/Pages/RecipeDetail/Ui/RecipeDetailPage/RecipeDetailPage.test.tsx` for not-found handling and loading state

**Checkpoint**: User Stories 1 AND 2 work independently — browse list and view details.

---

## Phase 5: User Story 3 — Create and Edit Recipe (Priority: P3)

**Goal**: Users can create new recipes and edit existing ones via a validated form with dynamic ingredient management.

**Independent Test**: Navigate to create form, fill all fields, add/remove ingredients, submit, verify created recipe in list and detail. Navigate to edit form, verify pre-fill, modify, submit, verify updates.

### Implementation for User Story 3

- [ ] T054 [US3] Create `src/Features/RecipeWrite/Type/Dto/RecipeWriteRequestDto.ts` (CreateRecipeRequestDto, UpdateRecipeRequestDto) with group barrel and segment barrel
- [ ] T055 [US3] Create `src/Features/RecipeWrite/Api/Post.ts` (postRecipe), `Put.ts` (putRecipe), `Key.ts` (recipeWriteMutationKey), `Mutation.ts` (recipeWriteMutationOption) with segment barrel
- [ ] T056 [US3] Create `src/Features/RecipeWrite/__Mock__/Handler.ts` (POST, PUT handlers using Recipe Db) with __Mock__ barrel. Update `src/App/Mock/browser.ts` to include RecipeWrite handlers.
- [ ] T057 [US3] Create `src/Features/RecipeWrite/Model/Hook/useCreateRecipe.ts` and `useUpdateRecipe.ts` (useMutation with onSuccess invalidation of recipeQueryKey) with group barrel and segment barrel
- [ ] T058 [US3] Create `src/Features/RecipeWrite/index.ts` slice barrel

- [ ] T059 [US3] Create `src/Widgets/RecipeWrite/Ui/IngredientFieldList/IngredientFieldList.tsx` (React Hook Form useFieldArray for dynamic ingredient rows: add/remove) with component barrel
- [ ] T060 [US3] Create `src/Widgets/RecipeWrite/Ui/RecipeWriteForm/RecipeWriteForm.tsx` (RHF + Zod schema validation, all fields, IngredientFieldList, submit handler) and `RecipeWriteForm.hook.ts` (form logic separation) with component barrel and segment barrel
- [ ] T061 [US3] Create `src/Widgets/RecipeWrite/index.ts` slice barrel

- [ ] T062 [US3] Create `src/Pages/RecipeWrite/Ui/RecipeWritePage/RecipeWritePage.tsx` (create vs edit mode from route, pre-fill on edit via useRecipe, redirect to detail on success) with component barrel, segment barrel, and slice barrel
- [ ] T063 [US3] Update `src/App/Router/AppRouter.tsx` to wire RecipeWritePage to `/recipes/new` and `/recipes/:id/edit` routes

### Tests for User Story 3

- [ ] T064 [P] [US3] Write test `src/Features/RecipeWrite/Api/Post.test.ts` for postRecipe HTTP call with MSW
- [ ] T065 [P] [US3] Write test `src/Widgets/RecipeWrite/Ui/RecipeWriteForm/RecipeWriteForm.test.tsx` for form validation (required fields, character limits, ingredient min/max)

**Checkpoint**: User Stories 1, 2, AND 3 work — browse, view detail, create, and edit recipes.

---

## Phase 6: User Story 4 — Delete Recipe (Priority: P4)

**Goal**: Users can delete a recipe from the detail page with a confirmation dialog.

**Independent Test**: Navigate to recipe detail, click delete, verify confirmation dialog, confirm deletion, verify redirect to list and recipe removal.

### Implementation for User Story 4

- [ ] T066 [US4] Create `src/Features/RecipeDelete/Api/Delete.ts` (deleteRecipe), `Key.ts` (recipeDeleteMutationKey), `Mutation.ts` (recipeDeleteMutationOption) with segment barrel
- [ ] T067 [US4] Create `src/Features/RecipeDelete/__Mock__/Handler.ts` (DELETE handler using Recipe Db) with __Mock__ barrel. Update `src/App/Mock/browser.ts` to include RecipeDelete handler.
- [ ] T068 [US4] Create `src/Features/RecipeDelete/Model/Hook/useDeleteRecipe.ts` (useMutation with onSuccess invalidation + navigation to list) with group barrel and segment barrel
- [ ] T069 [US4] Create `src/Features/RecipeDelete/Ui/DeleteRecipeAction/DeleteRecipeAction.tsx` (button + Shadcn Dialog confirmation — single concern Feature Ui with Action suffix) with component barrel and segment barrel
- [ ] T070 [US4] Create `src/Features/RecipeDelete/index.ts` slice barrel
- [ ] T071 [US4] Integrate DeleteRecipeAction into `src/Widgets/RecipeDetail/Ui/RecipeDetail/RecipeDetail.tsx` (add delete action slot)

### Tests for User Story 4

- [ ] T072 [P] [US4] Write test `src/Features/RecipeDelete/Ui/DeleteRecipeAction/DeleteRecipeAction.test.tsx` for dialog open/close and delete confirmation flow

**Checkpoint**: All 4 user stories functional — full CRUD cycle complete.

---

## Phase 7: E2E Integration Testing (MANDATORY)

**Purpose**: Verify complete user journeys across all user stories

**CONSTITUTION REQUIREMENT (v2.1.2)**: E2E tests are MANDATORY for all user stories

### E2E Setup

- [ ] T073 Configure Playwright (playwright.config.ts) with webServer settings and add test:e2e scripts to package.json

### E2E Tests per User Story

- [ ] T074 [P] [US1] E2E test `e2e/recipe-list.spec.ts` — recipe list display, category filtering, empty state
- [ ] T075 [P] [US2] E2E test `e2e/recipe-detail.spec.ts` — detail view, ingredient list, back navigation, 404 handling
- [ ] T076 [P] [US3] E2E test `e2e/recipe-write.spec.ts` — create form, validation errors, ingredient add/remove, edit pre-fill
- [ ] T077 [P] [US4] E2E test `e2e/recipe-delete.spec.ts` — delete confirmation dialog, cancel, confirm deletion

### Cross-Story E2E Tests

- [ ] T078 E2E test `e2e/recipe-lifecycle.spec.ts` — full CRUD: create → list → detail → edit → verify → delete → verify removal
- [ ] T079 E2E test `e2e/filter-persistence.spec.ts` — filter by category → open detail → back → filter preserved → create recipe → back → appears in filter

**Checkpoint**: All E2E tests pass — feature is production-ready.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements across all user stories

- [ ] T080 Accessibility audit for all pages (keyboard navigation, ARIA labels, color contrast WCAG 2.1 AA)
- [ ] T081 [P] Review and refine loading/skeleton states across all widgets
- [ ] T082 Run full verification suite (type-check, lint, test, build) and fix any issues
- [ ] T083 Final code review: FSD architecture compliance, barrel exports, import rules, naming conventions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — can start after Phase 2
- **US2 (Phase 4)**: Depends on Foundational — can start after Phase 2 (parallel with US1 if staffed)
- **US3 (Phase 5)**: Depends on Foundational — can start after Phase 2 (but references US1/US2 routes)
- **US4 (Phase 6)**: Depends on US2 (integrates into RecipeDetail widget)
- **E2E (Phase 7)**: Depends on all user stories complete
- **Polish (Phase 8)**: Depends on E2E complete

### User Story Dependencies

- **US1 (P1)**: Independent — core browsing, no dependencies on other stories
- **US2 (P2)**: Independent — reads recipe by ID, no dependency on US1 implementation (shares Entity)
- **US3 (P3)**: Independent — create/edit form, no hard dependency (but navigation from US1/US2 is natural)
- **US4 (P4)**: Depends on US2 — DeleteRecipeAction integrates into RecipeDetail widget

### Within Each User Story

- Types/DTOs → API/Mock → Hooks → Ui components → Widget composition → Page → Route wiring
- Tests can be written in parallel with or after implementation (within same user story phase)

### Parallel Opportunities

Per User Story:
- All [P] tasks within a phase can run in parallel
- Entity Ui components (T037) can parallel with Feature components (T032-T036)
- Tests (T044-T046) can parallel with each other

Cross User Stories:
- US1, US2, US3 can be developed in parallel after Phase 2 (US4 depends on US2)

---

## Parallel Example: User Story 1

```bash
# Parallel group 1: Feature setup (different slices)
Task T032: Create CategoryFilter/Type
Task T037: Create Recipe/Ui components (different slice from CategoryFilter)

# Parallel group 2: Tests (independent files)
Task T044: Test CategoryFilter store
Task T045: Test RecipeList widget
Task T046: Test CategoryBadge
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Recipe list with category filtering works independently
5. Demo-ready MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Recipe List + Filter) → Test → MVP!
3. Add US2 (Recipe Detail) → Test → Read-only complete
4. Add US3 (Create/Edit) → Test → Write capability added
5. Add US4 (Delete) → Test → Full CRUD
6. E2E + Polish → Production-ready

### Branch Strategy (Stacked PR)

This feature uses **Stacked PR** pattern:

```
spec/#13403104-fsd-recipe-app (spec branch)
  ↑ PR
  │
feature/#13403104-base-fsd-recipe-app (Phase 1+2: Setup + Foundation)
  ↑ PR
  │
feature/#13403104-us1-fsd-recipe-app (Phase 3: US1 Recipe List)
  ↑ PR
  │
feature/#13403104-us2-fsd-recipe-app (Phase 4+5+6: US2+US3+US4)
  ↑ PR
  │
feature/#13403104-us3-fsd-recipe-app (Phase 7+8: E2E + Polish)
```

---

## FSD Architecture Rules Validation

Each task should be validated against these gem-fsd-architecture rules:

- [ ] Layer hierarchy: App > Pages > Widgets > Features > Entities > Shared
- [ ] Import direction: higher layers import lower layers only
- [ ] Same slice: relative path + barrel
- [ ] Different slice: `#/Layer/Slice` absolute path (2-depth)
- [ ] Named exports only (no `export *`)
- [ ] __Mock__ barrel NOT re-exported from slice barrel
- [ ] Entity Ui: single domain, single info only
- [ ] Feature Ui: single business concern, self-contained
- [ ] Widget Ui: multi-domain composition
- [ ] PascalCase directories (except __Mock__)
- [ ] camelCase for hook/store files (use prefix)
- [ ] No plurals in naming (List suffix, not plural -s)
- [ ] Type/Domain/ for FE domain models, Type/Dto/ for transfer objects
- [ ] Cross-entity `import type` only via index.ts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task completion
- Stop at any checkpoint to validate story independently
- All file paths relative to `apps/recipe-app/src/` unless otherwise noted
- Barrel files (index.ts) are created as part of each task, not as separate tasks
