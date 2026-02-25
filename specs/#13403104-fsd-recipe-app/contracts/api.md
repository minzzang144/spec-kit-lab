# API Contracts: Recipe Book App

**Branch**: `spec/#13403104-fsd-recipe-app` | **Date**: 2026-02-23

All endpoints are simulated via MSW handlers. Base URL: `/api`

---

## Recipes

### GET /api/recipes

List all recipes, optionally filtered by category.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string | No | Filter by category ID. Omit for all recipes. |

**Response**: `200 OK`

```json
[
  {
    "_id": "recipe-1",
    "title": "Fluffy Pancakes",
    "description": "Light and fluffy pancakes perfect for weekend breakfast...",
    "category_id": "cat-breakfast",
    "category": {
      "id": "cat-breakfast",
      "name": "Breakfast",
      "color": "#F59E0B"
    },
    "cooking_time": 20,
    "difficulty": "Easy",
    "ingredients": [
      { "name": "Flour", "amount": 200, "unit": "g" },
      { "name": "Milk", "amount": 300, "unit": "ml" },
      { "name": "Eggs", "amount": 2, "unit": "pieces" }
    ],
    "created_at": "2026-02-01T09:00:00.000Z",
    "updated_at": "2026-02-01T09:00:00.000Z"
  }
]
```

---

### GET /api/recipes/:id

Get a single recipe by ID.

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Recipe ID |

**Response**: `200 OK` — Same shape as single item in list response.

**Error Response**: `404 Not Found`

```json
{ "error": "Recipe not found" }
```

---

### POST /api/recipes

Create a new recipe.

**Request Body**:

```json
{
  "title": "Fluffy Pancakes",
  "description": "Light and fluffy pancakes...",
  "category_id": "cat-breakfast",
  "cooking_time": 20,
  "difficulty": "Easy",
  "ingredients": [
    { "name": "Flour", "amount": 200, "unit": "g" },
    { "name": "Milk", "amount": 300, "unit": "ml" }
  ]
}
```

**Response**: `201 Created` — Returns the created recipe (full shape with embedded category).

**Error Response**: `400 Bad Request`

```json
{ "error": "Validation failed", "details": ["title is required"] }
```

---

### PUT /api/recipes/:id

Update an existing recipe.

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Recipe ID |

**Request Body**: Same shape as POST request body.

**Response**: `200 OK` — Returns the updated recipe (full shape).

**Error Responses**:
- `404 Not Found`: Recipe does not exist
- `400 Bad Request`: Validation failure

---

### DELETE /api/recipes/:id

Delete a recipe.

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Recipe ID |

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

```json
{ "error": "Recipe not found" }
```

---

## Categories

### GET /api/categories

List all predefined categories.

**Response**: `200 OK`

```json
[
  { "id": "cat-breakfast", "name": "Breakfast", "color": "#F59E0B" },
  { "id": "cat-lunch", "name": "Lunch", "color": "#10B981" },
  { "id": "cat-dinner", "name": "Dinner", "color": "#6366F1" },
  { "id": "cat-dessert", "name": "Dessert", "color": "#EC4899" },
  { "id": "cat-snack", "name": "Snack", "color": "#F97316" },
  { "id": "cat-drink", "name": "Drink", "color": "#06B6D4" }
]
```

---

## MSW Handler Distribution

Per gem-fsd-architecture Section 12:

| Handler Location | Methods | Endpoints |
|-----------------|---------|-----------|
| `Entities/Recipe/__Mock__/Handler.ts` | GET | /api/recipes, /api/recipes/:id |
| `Entities/Category/__Mock__/Handler.ts` | GET | /api/categories |
| `Features/RecipeWrite/__Mock__/Handler.ts` | POST, PUT | /api/recipes, /api/recipes/:id |
| `Features/RecipeDelete/__Mock__/Handler.ts` | DELETE | /api/recipes/:id |
