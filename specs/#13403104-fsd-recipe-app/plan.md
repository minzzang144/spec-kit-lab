# Implementation Plan: Recipe Book App

**Branch**: `spec/#13403104-fsd-recipe-app` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/#13403104-fsd-recipe-app/spec.md`

## Summary

A frontend-only Recipe Book SPA that serves as an architecture test bed for the gem-fsd-architecture rules. The app implements full CRUD for recipes with category-based filtering, using MSW for API simulation. The architecture exercises sub-domain splitting, cross-entity type references, Type segment grouping (Domain/Dto/Query/Param), Mapper pattern, Zustand slices, and layer-specific error handling.

## Technical Context

**Language/Version**: TypeScript ~5.7.3 (strict mode)
**Primary Dependencies**: React ^19.0.0, Vite ^7.0.0, TailwindCSS ^4.0.6, TanStack Query ^5.66.0, Zustand ^5.0.3, React Hook Form ^7.54.2, Zod ^3.24.1, React Router ^7.1.5, MSW ^2.7.3, shadcn/ui (new-york)
**Storage**: In-memory (MSW mock, no persistent storage)
**Testing**: Vitest ^3.0.5 + Testing Library (unit/integration), Playwright ^1.50.1 (E2E)
**Target Platform**: Web browser (SPA)
**Project Type**: Single frontend app in monorepo (`apps/recipe-app/`)
**Performance Goals**: Page transitions < 500ms, filter response < 1s
**Constraints**: Frontend-only, no real backend, single-user, no auth
**Scale/Scope**: ~30 source files, 3 entities, 4 user stories, 6 predefined categories

## Technology Version Check (MANDATORY)

### Frontend Dependencies Version Check

| Dependency | Constitution Says | Installed Version | Configuration Method | Verified via context7 |
|------------|-------------------|-------------------|---------------------|----------------------|
| React | React 18+ | ^19.0.0 | Standard SPA | [x] (same as notes-app) |
| TailwindCSS | TailwindCSS | ^4.0.6 | @tailwindcss/vite plugin | [x] v4 uses dedicated Vite plugin |
| Vite | Vite | ^7.0.0 | vite.config.ts | [x] (same as notes-app) |
| Zustand | Zustand | ^5.0.3 | create() with slices pattern | [x] v5 StateCreator + slices |
| TanStack Query | TanStack Query | ^5.66.0 | QueryClientProvider + queryOptions() | [x] v5 queryOptions helper |
| React Hook Form | React Hook Form | ^7.54.2 | @hookform/resolvers + Zod | [x] (same as notes-app) |
| React Router | React Router 7 | ^7.1.5 | Library mode | [x] (same as notes-app) |
| MSW | MSW 2 | ^2.7.3 | Browser worker | [x] (same as notes-app) |
| shadcn/ui | shadcn/ui | new-york style | #/Shared/Ui/Shadcn aliases | [x] (same as notes-app) |

### Backend Dependencies Version Check (if applicable)

N/A — Frontend-only app with MSW mock.

### Breaking Changes Identified

- [x] TailwindCSS v4: Uses @tailwindcss/vite plugin instead of tailwind.config.js (already handled)
- [x] React 19: Concurrent features by default (no breaking changes for this use case)

### Version Lock Decision

**Lock versions in package.json?**: Yes — use same versions as notes-app
**Reason**: Proven compatibility, focus on architecture testing not dependency debugging

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack (I)**:

Frontend:
- [x] TypeScript strict mode used
- [x] React 18+ as framework (React 19)
- [x] Vite as build tool (Vite 7)
- [x] TailwindCSS for styling (utility-first only, v4)
- [x] shadcn/ui as component library
- [x] TanStack Query for server state (v5)
- [x] Zustand for client state (UI state only — CategoryFilter)
- [x] React Hook Form for all forms (recipe create/edit form)

Backend:
- N/A (frontend-only app with MSW mock)

**Architecture Principles (II)**:

Frontend (FSD):
- [x] FSD (Feature-Sliced Design) architecture used (gem-fsd-architecture.md)
- [x] Layer hierarchy respected: App > Pages > Widgets > Features > Entities > Shared
- [x] Higher layers only import from lower layers (no reverse imports)
- [x] Each slice has Public API via index.ts (barrel exports)
- [ ] ~~Container/Presenter pattern~~ → Not used; gem-fsd-architecture defines its own Ui patterns
- [x] Custom hooks extract business logic from components

Backend (NestJS Modular):
- N/A

**Code Quality Rules (III)**:

Testing:
- [x] TDD approach: tests written before implementation
- [x] Frontend: 80%+ test coverage planned for Features and Entities (Vitest + Testing Library + Playwright)

Frontend Quality:
- [x] WCAG 2.1 AA compliance planned for all UI components
- [x] Error handling via layer-specific patterns (gem-fsd-architecture Section 19)
- [x] TanStack Query handles server state
- [x] Zustand only for shared UI state (CategoryFilter)

General:
- [x] Magic numbers replaced with named constants
- [x] Functions under 50 lines, files under 300 lines
- [x] Proper naming conventions per gem-fsd-architecture

**Documentation Rules (IV)**:

- [x] spec.md is technology-agnostic
- [x] plan.md contains all technical implementation details
- [x] Clear separation between WHAT/WHY (spec) and HOW (plan)

**Development Workflow (V)**:

- [x] One task = one commit strategy planned
- [x] Conventional commits format to be used
- [x] Frontend verification: type-check, lint, test, build

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| No Container/Presenter pattern | gem-fsd-architecture defines its own component architecture (Entity Ui pure display, Feature Ui self-contained action, Widget Ui composition) | Constitution's Container/Presenter is for NestJS-era; FSD architecture doc supersedes for frontend |

## Project Structure

### Documentation (this feature)

```text
specs/#13403104-fsd-recipe-app/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md             # Created by /speckit.tasks
```

### Source Code

```text
apps/recipe-app/
├── public/
│   └── mockServiceWorker.js
├── src/
│   ├── App/
│   │   ├── Config/
│   │   │   └── Env.ts
│   │   ├── Mock/
│   │   │   └── browser.ts                    ← setupWorker (handler aggregation only)
│   │   ├── Provider/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── index.ts
│   │   ├── Router/
│   │   │   ├── AppRouter.tsx
│   │   │   └── index.ts
│   │   └── Style/
│   │       └── global.css
│   │
│   ├── Pages/
│   │   ├── RecipeList/
│   │   │   ├── Ui/
│   │   │   │   ├── RecipeListPage/
│   │   │   │   │   ├── RecipeListPage.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── RecipeDetail/
│   │   │   ├── Ui/
│   │   │   │   ├── RecipeDetailPage/
│   │   │   │   │   ├── RecipeDetailPage.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── RecipeWrite/
│   │       ├── Ui/
│   │       │   ├── RecipeWritePage/
│   │       │   │   ├── RecipeWritePage.tsx    ← handles both create and edit (mode from route)
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── Widgets/
│   │   ├── RecipeList/
│   │   │   ├── Ui/
│   │   │   │   ├── RecipeList/
│   │   │   │   │   ├── RecipeList.tsx         ← data fetch + filter + render
│   │   │   │   │   ├── RecipeList.loading.tsx ← skeleton (sibling, no logic)
│   │   │   │   │   ├── RecipeList.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── RecipeListCard/
│   │   │   │   │   ├── RecipeListCard.tsx     ← multi-domain: Recipe info + CategoryBadge
│   │   │   │   │   ├── RecipeListCard.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── RecipeListEmpty/
│   │   │   │   │   ├── RecipeListEmpty.tsx    ← Link to create page (separate folder: has routing)
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── RecipeDetail/
│   │   │   ├── Ui/
│   │   │   │   ├── RecipeDetail/
│   │   │   │   │   ├── RecipeDetail.tsx       ← detail view composition
│   │   │   │   │   ├── RecipeDetail.loading.tsx
│   │   │   │   │   ├── RecipeDetail.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── RecipeIngredientList/
│   │   │   │   │   ├── RecipeIngredientList.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── RecipeWrite/
│   │       ├── Ui/
│   │       │   ├── RecipeWriteForm/
│   │       │   │   ├── RecipeWriteForm.tsx     ← React Hook Form + Zod
│   │       │   │   ├── RecipeWriteForm.hook.ts ← form logic separation
│   │       │   │   ├── RecipeWriteForm.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── IngredientFieldList/
│   │       │   │   ├── IngredientFieldList.tsx ← dynamic field array
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── Features/
│   │   ├── RecipeWrite/
│   │   │   ├── __Mock__/
│   │   │   │   ├── Handler.ts                 ← POST, PUT handlers
│   │   │   │   └── index.ts
│   │   │   ├── Api/
│   │   │   │   ├── Post.ts                    ← postRecipe()
│   │   │   │   ├── Put.ts                     ← putRecipe()
│   │   │   │   ├── Key.ts                     ← recipeWriteMutationKey
│   │   │   │   ├── Mutation.ts                ← recipeWriteMutationOption
│   │   │   │   └── index.ts
│   │   │   ├── Model/
│   │   │   │   ├── Hook/
│   │   │   │   │   ├── useCreateRecipe.ts
│   │   │   │   │   ├── useUpdateRecipe.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── Type/
│   │   │   │   ├── Dto/
│   │   │   │   │   ├── RecipeWriteRequestDto.ts  ← CreateRecipeRequestDto, UpdateRecipeRequestDto
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── RecipeDelete/
│   │   │   ├── __Mock__/
│   │   │   │   ├── Handler.ts                 ← DELETE handler
│   │   │   │   └── index.ts
│   │   │   ├── Api/
│   │   │   │   ├── Delete.ts                  ← deleteRecipe()
│   │   │   │   ├── Key.ts                     ← recipeDeleteMutationKey
│   │   │   │   ├── Mutation.ts                ← recipeDeleteMutationOption
│   │   │   │   └── index.ts
│   │   │   ├── Model/
│   │   │   │   ├── Hook/
│   │   │   │   │   ├── useDeleteRecipe.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── Ui/
│   │   │   │   ├── DeleteRecipeAction/
│   │   │   │   │   ├── DeleteRecipeAction.tsx  ← button + confirmation dialog (single concern)
│   │   │   │   │   ├── DeleteRecipeAction.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── CategoryFilter/
│   │       ├── Model/
│   │       │   ├── Store/
│   │       │   │   ├── useCategoryFilterStore.ts  ← Zustand store (selectedCategoryId)
│   │       │   │   └── index.ts
│   │       │   ├── Hook/
│   │       │   │   ├── useCategoryFilter.ts       ← derived state (isAllSelected, etc.)
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── Type/
│   │       │   ├── CategoryFilter.ts              ← FE-only state (flat, not in Dto/)
│   │       │   └── index.ts
│   │       ├── Ui/
│   │       │   ├── CategoryFilterBar/
│   │       │   │   ├── CategoryFilterBar.tsx       ← filter bar with category chips
│   │       │   │   ├── CategoryFilterBar.test.tsx
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── Entities/
│   │   ├── Recipe/
│   │   │   ├── __Mock__/
│   │   │   │   ├── Seed.ts                    ← initial recipe data (5-6 sample recipes)
│   │   │   │   ├── Db.ts                      ← in-memory CRUD functions
│   │   │   │   ├── Handler.ts                 ← GET handlers
│   │   │   │   └── index.ts
│   │   │   ├── Api/
│   │   │   │   ├── Get.ts                     ← getRecipe(id), getRecipeList(query)
│   │   │   │   ├── Key.ts                     ← recipeQueryKey
│   │   │   │   ├── Query.ts                   ← recipeQueryOption
│   │   │   │   └── index.ts
│   │   │   ├── Model/
│   │   │   │   ├── Hook/
│   │   │   │   │   ├── useRecipe.ts           ← single recipe query
│   │   │   │   │   ├── useRecipeList.ts       ← list query (with filter integration)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Lib/
│   │   │   │   │   ├── RecipeMapper.ts        ← toRecipe(), toRecipeList()
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── Type/
│   │   │   │   ├── Domain/
│   │   │   │   │   ├── Recipe.ts              ← Recipe, Ingredient, Difficulty
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Dto/
│   │   │   │   │   ├── RecipeResponseDto.ts   ← RecipeDto (snake_case, embedded Category)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Query/
│   │   │   │   │   ├── RecipeQuery.ts         ← GetRecipeListQuery
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Param/
│   │   │   │   │   ├── RecipeParam.ts         ← { id: string }
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── Ui/
│   │   │   │   ├── RecipeDifficulty/
│   │   │   │   │   ├── RecipeDifficulty.tsx   ← difficulty badge (single info)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── RecipeCookingTime/
│   │   │   │   │   ├── RecipeCookingTime.tsx  ← formatted cooking time (single info)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── EmptyRecipeState/
│   │   │   │   │   ├── EmptyRecipeState.tsx   ← empty state message
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── Category/
│   │       ├── __Mock__/
│   │       │   ├── Seed.ts                    ← 6 predefined categories
│   │       │   ├── Db.ts                      ← getCategoryList()
│   │       │   ├── Handler.ts                 ← GET /api/categories
│   │       │   └── index.ts
│   │       ├── Api/
│   │       │   ├── Get.ts                     ← getCategoryList()
│   │       │   ├── Key.ts                     ← categoryQueryKey
│   │       │   ├── Query.ts                   ← categoryQueryOption
│   │       │   └── index.ts
│   │       ├── Model/
│   │       │   ├── Hook/
│   │       │   │   ├── useCategoryList.ts
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── Type/
│   │       │   ├── Domain/
│   │       │   │   ├── Category.ts            ← Category type
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── Ui/
│   │       │   ├── CategoryBadge/
│   │       │   │   ├── CategoryBadge.tsx      ← colored category badge (single info)
│   │       │   │   ├── CategoryBadge.test.tsx
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   └── Shared/
│       ├── Api/
│       │   ├── httpClient.ts                  ← fetch wrapper with error handling
│       │   └── index.ts
│       ├── Config/
│       │   ├── Route.ts                       ← ROUTES constant
│       │   ├── IngredientUnit.ts              ← INGREDIENT_UNIT_LIST constant
│       │   └── index.ts
│       ├── Model/
│       │   ├── Shadcn/
│       │   │   ├── Utils.ts                   ← cn() utility
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── Type/
│       │   └── index.ts
│       └── Ui/
│           ├── Shadcn/                        ← shadcn CLI generated (lowercase exception)
│           │   ├── button.tsx
│           │   ├── input.tsx
│           │   ├── select.tsx
│           │   ├── textarea.tsx
│           │   ├── dialog.tsx
│           │   ├── badge.tsx
│           │   ├── card.tsx
│           │   ├── label.tsx
│           │   └── separator.tsx
│           ├── ErrorBoundary/
│           │   ├── ErrorBoundary.tsx
│           │   └── index.ts
│           └── index.ts
```

**Structure Decision**: Single frontend-only app at `apps/recipe-app/` following gem-fsd-architecture. Same tech stack and config patterns as `apps/notes-app/`. No backend — MSW handles all API simulation.

## FSD Architecture Design

### Domain Map

```
Entities/Recipe (parent)          ← shared types, GET API, Mapper
  ├── Features/RecipeWrite        ← POST/PUT mutations
  ├── Features/RecipeDelete       ← DELETE mutation
  ├── Widgets/RecipeList          ← list composition
  ├── Widgets/RecipeDetail        ← detail composition
  ├── Widgets/RecipeWrite         ← form composition
  ├── Pages/RecipeList            ← list page
  ├── Pages/RecipeDetail          ← detail page
  └── Pages/RecipeWrite           ← create/edit page

Entities/Category (independent)   ← shared types, GET API, CategoryBadge Ui
  └── Features/CategoryFilter     ← Zustand filter state
```

### Architecture Rules Tested

| Rule | How Tested |
|------|-----------|
| Sub-domain naming (parent prefix) | RecipeWrite, RecipeList, RecipeDetail, RecipeDelete |
| Sub-domain import (child → parent OK) | Features/RecipeWrite → Entities/Recipe |
| Type/Domain/ group | Recipe.ts, Category.ts (FE domain models) |
| Type/Dto/ group | RecipeResponseDto.ts (snake_case), RecipeWriteRequestDto.ts |
| Type/Query/ group | RecipeQuery.ts (categoryId filter) |
| Type/Param/ group | RecipeParam.ts (URL path :id) |
| FE-only state flat (not Dto/) | CategoryFilter.ts |
| Cross-entity import type | RecipeResponseDto imports Category type |
| Mapper pattern | RecipeMapper.ts (snake_case → camelCase) |
| Entity Ui (single info only) | RecipeDifficulty, RecipeCookingTime, CategoryBadge |
| Widget Ui (multi-domain) | RecipeListCard (Recipe + Category) |
| Feature Ui (single concern + dialog) | DeleteRecipeAction (delete + confirm dialog) |
| Zustand in Feature | CategoryFilter/Model/Store/ |
| MSW __Mock__ 3-file | Seed.ts + Db.ts + Handler.ts per domain |
| MSW handler distribution | Entity=GET, Feature=POST/PUT/DELETE |
| __Mock__ cross-entity import | Feature handler → Entity Db |
| Barrel export chain | Group → Segment → Slice (named export only) |
| __Mock__ not in slice barrel | Only via __Mock__/index.ts |
| Error handling by layer | Shared(throw) → Feature(onError) → Widget(isError) → App(ErrorBoundary) |
| Component.hook.ts pattern | RecipeWriteForm.hook.ts |
| Sibling vs folder sub-component | .loading.tsx (sibling) vs RecipeListCard (folder) |

### Routing Design

```
/                           → RecipeListPage (redirect or default)
/recipes                    → RecipeListPage
/recipes/:id                → RecipeDetailPage
/recipes/new                → RecipeWritePage (create mode)
/recipes/:id/edit           → RecipeWritePage (edit mode)
```

### Data Flow

```
[User Action]
  → Widget Ui (event handler)
    → Feature Model/Hook (useMutation with onSuccess: invalidateQueries)
      → Feature Api (POST/PUT/DELETE)
        → MSW __Mock__ Handler
          → Entity __Mock__ Db (in-memory CRUD)
            → Response
              → Entity Model/Lib/Mapper (DTO → Domain)
                → Entity Model/Hook (useQuery)
                  → Widget Ui (re-render)
```

### Error Flow

```
Shared/Api (httpClient: fetch → throw on !ok)
  → Features/Model/Hook (onError: toast/retry)
    → Widgets/Ui (isError → error message UI)
      → App/Router (ErrorBoundary → fallback UI)
```
