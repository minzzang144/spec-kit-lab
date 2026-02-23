# Research: Recipe Book App

**Branch**: `spec/#13403104-fsd-recipe-app` | **Date**: 2026-02-23

## 1. Technology Stack Decisions

### Decision: Frontend-only App with MSW Mock Backend

**Decision**: Frontend-only SPA with MSW (Mock Service Worker) for API simulation.
**Rationale**: Spec explicitly states "The app operates with mock data. Data is simulated in-memory without a real backend server." This matches the notes-app pattern and allows full testing of FSD architecture without backend complexity.
**Alternatives considered**:
- Full-stack (NestJS backend): Rejected — over-engineering for architecture testing purpose
- JSON Server: Rejected — MSW provides more realistic API simulation with request/response control

### Decision: Same Tech Stack as notes-app

**Decision**: Reuse the proven notes-app tech stack with identical versions.
**Rationale**: notes-app already validated these versions work together. Focus testing effort on architecture rules, not dependency compatibility.

| Dependency | Version | Configuration |
|------------|---------|---------------|
| React | ^19.0.0 | Standard SPA |
| TypeScript | ~5.7.3 | Strict mode |
| Vite | ^7.0.0 | @tailwindcss/vite plugin |
| TailwindCSS | ^4.0.6 | @tailwindcss/vite (v4 plugin method) |
| TanStack Query | ^5.66.0 | QueryClientProvider |
| Zustand | ^5.0.3 | Slices pattern, `create()` |
| React Hook Form | ^7.54.2 | With @hookform/resolvers |
| Zod | ^3.24.1 | Form validation schemas |
| React Router | ^7.1.5 | Library mode |
| MSW | ^2.7.3 | Browser worker (public/) |
| shadcn/ui | new-york style | Aliases: #/Shared/Ui/Shadcn |
| Vitest | ^3.0.5 | jsdom environment |
| Playwright | ^1.50.1 | E2E testing |

### Decision: TailwindCSS v4 with @tailwindcss/vite Plugin

**Decision**: Use `@tailwindcss/vite` plugin (v4 method), not PostCSS.
**Rationale**: Verified via context7 — TailwindCSS v4 deprecated `tailwind.config.js` in favor of the dedicated Vite plugin. notes-app already uses this pattern.
**Configuration**: `import tailwindcss from '@tailwindcss/vite'` in `vite.config.ts`

### Decision: TanStack Query v5 queryOptions/mutationOptions Factory

**Decision**: Use `queryOptions()` and plain object spread pattern for type-safe query/mutation configuration.
**Rationale**: Verified via context7 — v5 provides `queryOptions()` helper for type inference. The `mutationOptions()` helper exists but is less commonly used; plain objects with spread work equally well. notes-app uses the factory pattern defined in gem-fsd-architecture.

### Decision: Zustand v5 Slices Pattern

**Decision**: Use Zustand slices pattern for CategoryFilter store.
**Rationale**: Verified via context7 — v5 maintains the `StateCreator` + slices pattern. CategoryFilter state is shared between Widget (list filtering) and navigation (filter persistence), meeting the "2+ Widgets sharing state" criteria.

## 2. Architecture Decisions

### Decision: Snake_case DTO to Test Mapper Pattern

**Decision**: Mock API returns snake_case responses (e.g., `cooking_time`, `category_id`, `created_at`) to require Mapper transformation.
**Rationale**: Tests the Mapper pattern from gem-fsd-architecture Section 10. If API returned camelCase, Mapper would be unnecessary and the pattern untested.

### Decision: Embedded Category in Recipe API Response

**Decision**: Recipe list/detail API returns category info embedded in each recipe object (like NoSQL document).
**Rationale**: Tests the cross-entity `import type` exception from gem-fsd-architecture Section 7. Recipe's Dto type needs to reference Category's domain type, exercising the three conditions (import type only, index.ts via, Type segment only).

### Decision: Ingredient as Embedded Type (Not Separate Entity)

**Decision**: Ingredient is a value type embedded in Recipe, not a separate Entity slice.
**Rationale**: Ingredients don't exist independently — they only make sense within a recipe. Per spec: "Ingredients exist only as part of a recipe (embedded, not standalone)." Ingredient type is defined alongside Recipe in `Entities/Recipe/Type/Domain/Recipe.ts`.

### Decision: CategoryFilter in Features (Not Entities)

**Decision**: Category filter state management as a Feature slice (`Features/CategoryFilter`), not part of Entity.
**Rationale**: Filtering is a user interaction (Feature concern), not a data reading concern (Entity). The Zustand store lives in Feature because it represents a user action (selecting a filter). Entity/Category only provides the category list data via TanStack Query.

### Decision: Sub-domain Splitting by Concern

**Decision**: Recipe sub-domains follow concern-based splitting:
- `Entities/Recipe` — parent (shared types, GET API, Mapper)
- `Features/RecipeWrite` — create/update mutations
- `Features/RecipeDelete` — delete mutation
- `Widgets/RecipeList` — list composition
- `Widgets/RecipeDetail` — detail composition
- `Widgets/RecipeWrite` — form composition

**Rationale**: Follows gem-fsd-architecture Section 3 principle: "domains split by concern, not by page." Each concern exists only in the layers it needs.

### Decision: RecipeCard as Widget Component (Not Entity)

**Decision**: The recipe card (showing title + description + cooking time + difficulty + category badge) is placed in Widget layer, not Entity.
**Rationale**: Per gem-fsd-architecture Section 4 Ui rules: "Entity Ui는 단일 도메인의 단일 정보만 표시. 여러 도메인 정보를 조합하는 '카드' 형태는 Entity가 아닌 Widget의 책임." The card combines Recipe domain info with Category domain badge.

### Decision: DeleteRecipeAction as Feature Ui

**Decision**: Delete button with confirmation dialog is a Feature Ui component (`Features/RecipeDelete/Ui/DeleteRecipeAction`).
**Rationale**: Per gem-fsd-architecture Section 4: "단일 비즈니스 관심사 + Dialog → Feature Ui 내부 구현." Delete is a single concern with an internal confirmation flow, matching the `Action` suffix convention for self-contained business execution.

## 3. API Design Decisions

### Decision: RESTful Mock API with Standard Patterns

**Decision**: Standard REST endpoints with consistent response format.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/recipes | List recipes (query: categoryId) |
| GET | /api/recipes/:id | Get recipe detail |
| POST | /api/recipes | Create recipe |
| PUT | /api/recipes/:id | Update recipe |
| DELETE | /api/recipes/:id | Delete recipe |
| GET | /api/categories | List categories |

**Response format**: Direct data (no envelope wrapper for simplicity in mock context).

### Decision: Predefined Category Seed Data

**Decision**: 6 predefined categories: Breakfast, Lunch, Dinner, Dessert, Snack, Drink.
**Rationale**: Per spec assumptions. Provides enough variety for meaningful filtering tests.

### Decision: Predefined Ingredient Unit List

**Decision**: 9 predefined units: g, kg, ml, L, cups, tbsp, tsp, pieces, pinch.
**Rationale**: Per spec assumptions. Managed as a constant in Shared/Config.
