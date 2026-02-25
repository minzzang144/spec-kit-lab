# Data Model: Recipe Book App

**Branch**: `spec/#13403104-fsd-recipe-app` | **Date**: 2026-02-23

## Entity Definitions

### Recipe (Core Entity)

**Location**: `Entities/Recipe/Type/Domain/Recipe.ts`

```typescript
type Difficulty = 'Easy' | 'Medium' | 'Hard';

type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  cookingTime: number;       // minutes
  difficulty: Difficulty;
  ingredientList: Ingredient[];
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
};
```

**Validation Rules**:
- `title`: required, max 100 characters
- `description`: required, max 2000 characters
- `categoryId`: required, must reference an existing category
- `cookingTime`: required, positive integer (min 1)
- `difficulty`: required, one of 'Easy' | 'Medium' | 'Hard'
- `ingredientList`: required, 1-50 items
- Each ingredient: name (required), amount (required, positive number), unit (required)

### Category

**Location**: `Entities/Category/Type/Domain/Category.ts`

```typescript
type Category = {
  id: string;
  name: string;
  color: string;    // hex color code
};
```

**Predefined Seed Data** (6 categories):

| ID | Name | Color |
|----|------|-------|
| cat-breakfast | Breakfast | #F59E0B |
| cat-lunch | Lunch | #10B981 |
| cat-dinner | Dinner | #6366F1 |
| cat-dessert | Dessert | #EC4899 |
| cat-snack | Snack | #F97316 |
| cat-drink | Drink | #06B6D4 |

## DTO Definitions (Backend Response Format)

### RecipeResponseDto

**Location**: `Entities/Recipe/Type/Dto/RecipeResponseDto.ts`

Backend returns snake_case with embedded category (NoSQL-style).

```typescript
import type { Category } from '#/Entities/Category';

type IngredientDto = {
  name: string;
  amount: number;
  unit: string;
};

type RecipeDto = {
  _id: string;
  title: string;
  description: string;
  category_id: string;
  category: Category;              // embedded category (cross-entity type reference)
  cooking_time: number;
  difficulty: string;
  ingredients: IngredientDto[];
  created_at: string;
  updated_at: string;
};
```

**Note**: `RecipeDto` uses `import type { Category }` from `#/Entities/Category` — this is the cross-entity `import type` exception defined in gem-fsd-architecture Section 7.

### RecipeWriteRequestDto

**Location**: `Features/RecipeWrite/Type/Dto/RecipeWriteRequestDto.ts`

```typescript
type CreateRecipeRequestDto = {
  title: string;
  description: string;
  category_id: string;
  cooking_time: number;
  difficulty: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
};

type UpdateRecipeRequestDto = CreateRecipeRequestDto;
```

## Query/Filter Types

### RecipeQuery

**Location**: `Entities/Recipe/Type/Query/RecipeQuery.ts`

```typescript
type GetRecipeListQuery = {
  categoryId?: string;    // filter by category, undefined = all
};
```

### RecipeParam

**Location**: `Entities/Recipe/Type/Param/RecipeParam.ts`

```typescript
type RecipeParam = {
  id: string;             // URL path parameter /recipes/:id
};
```

## FE-Only State Types

### CategoryFilter

**Location**: `Features/CategoryFilter/Type/CategoryFilter.ts` (flat, not in Dto/)

```typescript
type CategoryFilterState = {
  selectedCategoryId: string | null;  // null = "All" selected
};
```

## Mapper Definition

### RecipeMapper

**Location**: `Entities/Recipe/Model/Lib/RecipeMapper.ts`

Transforms snake_case DTO to camelCase domain model:

```typescript
function toIngredient(dto: IngredientDto): Ingredient
function toIngredientList(dtoList: IngredientDto[]): Ingredient[]
function toRecipe(dto: RecipeDto): Recipe
function toRecipeList(dtoList: RecipeDto[]): Recipe[]
```

**Field Mapping**:

| DTO (snake_case) | Domain (camelCase) |
|------------------|--------------------|
| `_id` | `id` |
| `category_id` | `categoryId` |
| `cooking_time` | `cookingTime` |
| `ingredients` | `ingredientList` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

## Entity Relationships

```
Recipe ──── many-to-one ────► Category
  │
  └──── one-to-many (embedded) ────► Ingredient
```

- Recipe contains `categoryId` (FK) and receives embedded `category` object from API
- Ingredient is embedded within Recipe (no independent existence)
- Category exists independently, shared across all recipes

## State Management Architecture

| State | Type | Location | Reason |
|-------|------|----------|--------|
| Recipe list | Server state | TanStack Query via `Entities/Recipe/Api/Query.ts` | API data |
| Recipe detail | Server state | TanStack Query via `Entities/Recipe/Api/Query.ts` | API data |
| Category list | Server state | TanStack Query via `Entities/Category/Api/Query.ts` | API data |
| Category filter selection | Client state (shared) | Zustand via `Entities/Category/Model/Store/FilterSlice` | 2+ Widgets share filter state (Store는 Entities에 정의, Feature에서 파생 상태 hook 제공) |
| Form state | Form state | React Hook Form in `Widgets/RecipeWrite/` | Local form management |
| Dialog open/close | Local UI state | `useState` in Feature Ui component | Single component |
