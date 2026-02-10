# Data Model: FSD Notes App

**Branch**: `spec/#13393034-fsd-notes-app`
**Date**: 2026-02-10

## Entities

### Note

사용자가 작성한 메모. Entities/Note/Type/Note.ts에 정의.

| Field      | Type     | Required | Constraints                  | Description          |
|------------|----------|----------|------------------------------|----------------------|
| id         | string   | Yes      | UUID, 자동 생성               | 고유 식별자            |
| title      | string   | Yes      | 최소 1자, 최대 100자          | 노트 제목              |
| content    | string   | No       | 최대 50,000자                 | 노트 본문 (플레인 텍스트) |
| categoryId | string   | Yes      | 유효한 Category ID, 기본값: "uncategorized" | 소속 카테고리 ID       |
| createdAt  | string   | Yes      | ISO 8601 형식, 자동 생성      | 작성일시               |
| updatedAt  | string   | Yes      | ISO 8601 형식, 자동 갱신      | 수정일시               |

**Relationships**:
- Note → Category: Many-to-One (하나의 노트는 하나의 카테고리에 속함)

**TypeScript Type**:
```typescript
// Entities/Note/Type/Note.ts
export type Note = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly categoryId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};
```

### Category

노트를 분류하는 카테고리. Entities/Category/Type/Category.ts에 정의.

| Field     | Type    | Required | Constraints            | Description            |
|-----------|---------|----------|------------------------|------------------------|
| id        | string  | Yes      | UUID 또는 예약 ID       | 고유 식별자              |
| name      | string  | Yes      | 최소 1자, 고유           | 카테고리 이름            |
| isDefault | boolean | Yes      | true이면 삭제 불가        | 기본 카테고리 여부        |

**Relationships**:
- Category → Note: One-to-Many (하나의 카테고리에 여러 노트가 속함)

**TypeScript Type**:
```typescript
// Entities/Category/Type/Category.ts
export type Category = {
  readonly id: string;
  readonly name: string;
  readonly isDefault: boolean;
};
```

### Default Categories (Constants)

```typescript
// Entities/Category/Config/CategoryConfig.ts
export const DEFAULT_CATEGORIES = [
  { id: 'all', name: '전체', isDefault: true },
  { id: 'uncategorized', name: '미분류', isDefault: true },
] as const;

export const ALL_CATEGORY_ID = 'all';
export const UNCATEGORIZED_CATEGORY_ID = 'uncategorized';
```

**Note**: `all` 카테고리는 가상 필터용 (DB에 저장되지 않음). `uncategorized`는 실제 카테고리.

## Feature-Specific Types

### NoteWrite (Features/NoteWrite/Type/NoteWrite.ts)

```typescript
export type CreateNoteRequest = {
  readonly title: string;
  readonly content?: string;
  readonly categoryId?: string;
};

export type CreateNoteResponse = Note;
```

### NoteEdit (Features/NoteEdit/Type/NoteEdit.ts)

```typescript
export type UpdateNoteRequest = {
  readonly title?: string;
  readonly content?: string;
  readonly categoryId?: string;
};

export type UpdateNoteResponse = Note;
```

### NoteSearch (Features/NoteSearch/Type/NoteSearch.ts)

```typescript
export type NoteSearchParams = {
  readonly keyword: string;
  readonly categoryId?: string;
};
```

### CategoryWrite (Features/CategoryWrite/Type/CategoryWrite.ts)

```typescript
export type CreateCategoryRequest = {
  readonly name: string;
};

export type CreateCategoryResponse = Category;
```

### CategoryFilter (Features/CategoryFilter/Type/CategoryFilter.ts)

```typescript
export type FilterState = {
  readonly selectedCategoryId: string; // 'all' | specific category ID
};
```

## Validation Rules

### Note Validation (Zod Schema - used with React Hook Form)

```typescript
import { z } from 'zod';

export const noteFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 최대 100자까지 입력 가능합니다'),
  content: z
    .string()
    .max(50000, '본문은 최대 50,000자까지 입력 가능합니다')
    .optional()
    .default(''),
  categoryId: z.string().optional(),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
```

### Category Validation (Zod Schema)

```typescript
import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, '카테고리 이름을 입력해주세요')
    .trim(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
```

## Entity Relationships Diagram

```
┌──────────────┐     Many-to-One     ┌──────────────────┐
│     Note     │ ──────────────────→ │    Category      │
│              │                      │                  │
│ id           │                      │ id               │
│ title        │                      │ name             │
│ content      │                      │ isDefault        │
│ categoryId ──┼──────────────────→  │                  │
│ createdAt    │                      └──────────────────┘
│ updatedAt    │
└──────────────┘
```

## MSW Mock Data Structure

### In-Memory Database

```typescript
// App/Mock/browser.ts 에서 관리되는 in-memory 데이터
let notes: Note[] = [...initialNotes];
let categories: Category[] = [...DEFAULT_CATEGORIES, ...userCategories];
let nextNoteId: number = initialNotes.length + 1;
let nextCategoryId: number = userCategories.length + 1;
```

MSW handler들이 이 in-memory 데이터를 CRUD 처리하며, 브라우저 새로고침 시 초기 상태로 리셋된다.
