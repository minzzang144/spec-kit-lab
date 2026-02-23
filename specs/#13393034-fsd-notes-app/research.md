# Research: FSD Notes App

**Branch**: `spec/#13393034-fsd-notes-app`
**Date**: 2026-02-10

## R1: Mock API Strategy (MSW vs json-server vs Mirage)

### Decision: MSW (Mock Service Worker) 2.x

### Rationale
- **네트워크 레벨 인터셉트**: 실제 fetch/axios 호출을 Service Worker에서 가로채므로, 프론트엔드 코드가 실제 API와 동일하게 동작
- **Custom FSD `__Mock__` 세그먼트와 자연스럽게 통합**: 각 도메인의 `__Mock__/` 디렉토리에 MSW handler를 배치하여 FSD 규칙을 검증
- **테스트 환경 공유**: 개발 시 브라우저 Service Worker, 테스트 시 Node.js server로 동일한 handler 재사용
- **타입 안전**: TypeScript와 완전 호환, request/response 타입 정의 가능

### Alternatives Considered
- **json-server**: 별도 프로세스 필요, FSD 구조와 통합 어려움, 커스텀 로직 제한적
- **Mirage.js**: 좋은 대안이나 MSW v2 대비 커뮤니티 규모 작음, Service Worker 기반이 아님

### Implementation Notes
- `App/Mock/browser.ts`에서 worker 초기화
- 각 Feature/Entity의 `__Mock__/` 세그먼트에 handler 배치
- `main.tsx`에서 개발 모드일 때만 MSW 활성화
- MSW handler는 `index.ts`(Public API)에서 export 금지 (Custom FSD 규칙 준수)

---

## R2: Routing Strategy (React Router v7 Library Mode)

### Decision: React Router v7, Library Mode (createBrowserRouter)

### Rationale
- **Library Mode**: Framework 모드(파일 기반 라우팅)가 아닌 Library 모드 사용. Custom FSD의 Pages 레이어와 충돌 없음
- **createBrowserRouter**: Data API 지원 (loader, action, errorElement), Type-safe routing
- **FSD Pages 레이어와 호환**: `Pages/NoteList/`, `Pages/NoteWrite/` 등 FSD 슬라이스가 라우트 컴포넌트를 제공
- **App/Router 세그먼트**: 라우터 설정은 `App/Router/AppRouter.tsx`에 위치 (Non-domain 레이어)

### Alternatives Considered
- **TanStack Router**: Type-safe하지만 생태계가 React Router 대비 작음
- **React Router v7 Framework Mode**: 파일 기반 라우팅이 FSD 디렉토리 구조와 충돌

### Route Structure
```
/                    → NoteListPage (노트 목록, 검색, 필터)
/notes/new           → NoteWritePage (새 노트 작성)
/notes/:id           → NoteDetailPage (노트 상세 보기 + 편집)
/categories          → CategoryManagePage (카테고리 관리)
```

---

## R3: State Management Pattern (TanStack Query + Zustand)

### Decision: TanStack Query for server state, Zustand for UI state

### Rationale
- **Custom FSD 규칙 준수** (`custom-fsd-architecture.md` Section 9):
  - Entities/Api: `queryOptions` factory (읽기)
  - Features/Api: `mutationOptions` factory (비즈니스 가치 있는 사용자 시나리오: CRUD, 필터, 검색, 네비게이션)
  - **Entities/Model/Store**: Zustand 상태 선언 (state-only, setter 없음)
  - **Features/Model/Logic**: Zustand 업데이트 로직 (setState 호출)
- **서버 상태와 UI 상태의 명확한 분리**:
  - 서버 상태: 노트 목록, 카테고리 목록 → TanStack Query
  - UI 상태: 선택된 카테고리 필터, 검색 키워드 → Zustand (Entities Store)

### Zustand 사용 범위
| 상태 | 관리 방식 | 이유 |
|---|---|---|
| 노트 목록 데이터 | TanStack Query | 서버 상태 |
| 카테고리 목록 데이터 | TanStack Query | 서버 상태 |
| 선택된 카테고리 필터 | Zustand — `Entities/Category/Model/Store/useCategoryStore` | 여러 Widget에서 공유하는 UI 상태 |
| 검색 키워드 | Zustand — `Entities/Note/Model/Store/useNoteStore` | SearchBar Widget + NoteList Widget이 공유 |
| 사이드바 열림/닫힘 | useState (Widget 내부) | 단일 컴포넌트 상태 |
| 노트 폼 데이터 | React Hook Form | 폼 상태 |

### Zustand Store 설계 (Custom FSD Section 9 준수)

**상태 선언 (Entities)**:
```
Entities/Category/Model/Store/
├── FilterSlice.ts        ← 상태 타입 + createFilterSlice (setter 없음)
└── useCategoryStore.ts   ← create() 조합 (use{Domain}Store 규칙)

Entities/Note/Model/Store/
├── SearchSlice.ts        ← 상태 타입 + createSearchSlice (setter 없음)
└── useNoteStore.ts       ← create() 조합
```

**업데이트 로직 (Features)**:
```
Features/CategoryFilter/Model/Logic/
└── useCategoryFilterLogic.ts  ← setSelectedCategoryId (useCategoryStore.setState 호출)

Features/NoteSearch/Model/Logic/
└── useNoteSearchLogic.ts      ← setKeyword, clearKeyword (useNoteStore.setState 호출)
```

**소비 패턴**:
```typescript
// Widget에서
const selected = useCategoryStore((s) => s.selectedCategoryId); // Entities (읽기)
const { setSelectedCategoryId } = useCategoryFilterLogic();      // Features (쓰기)
```

---

## R4: TailwindCSS v4 Configuration

### Decision: TailwindCSS v4 with @tailwindcss/vite plugin

### Rationale
- v4는 `tailwind.config.js`를 더 이상 기본으로 사용하지 않음
- `@tailwindcss/vite` 플러그인을 Vite config에 추가
- CSS 파일에서 `@import "tailwindcss"` 사용
- shadcn/ui와 호환: shadcn/ui는 TailwindCSS 유틸리티 클래스 기반

### Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '#': resolve(__dirname, 'src') }
  }
})
```

```css
/* App/Style/global.css */
@import "tailwindcss";
```

---

## R5: HTTP Client Strategy

### Decision: Custom httpClient wrapper over fetch API

### Rationale
- **경량**: axios 같은 추가 의존성 없이 native fetch 사용
- **FSD Shared/Api 세그먼트**: `Shared/Api/httpClient.ts`에 위치
- **MSW와 자연스러운 통합**: MSW는 fetch를 직접 인터셉트
- **Base URL, 에러 핸들링 등 공통 설정**: wrapper에서 처리

### Implementation
```typescript
// Shared/Api/httpClient.ts
const BASE_URL = '/api'

export const httpClient = {
  async get<T>(url: string): Promise<T> { ... },
  async post<T>(url: string, body: unknown): Promise<T> { ... },
  async put<T>(url: string, body: unknown): Promise<T> { ... },
  async delete<T>(url: string): Promise<T> { ... },
}
```

---

## R6: Path Alias Strategy

### Decision: `#/` prefix → `src/*`

### Rationale
- Custom FSD 규칙의 명시적 요구사항
- `@/` 대신 `#/` 사용으로 기존 앱과 충돌 방지
- Cross-slice import: `#/Entities/Note`, `#/Shared/Api`
- Same-slice import: 상대 경로 (`../../Type/Note`)

### Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "#/*": ["src/*"] }
  }
}
```

---

## R7: Custom FSD 서브도메인 설계

### Decision: Note와 Category를 각각 상위 도메인으로, 비즈니스 시나리오를 하위 도메인으로 분리

### Rationale
- **Note 도메인**:
  - `Entities/Note` (상위): 공통 타입, 읽기 API, 순수 표시 Ui (NoteContentPreview, NoteDate — onClick/다른 도메인 금지)
  - `Features/NoteWrite` (하위): 노트 생성 + 수정 mutation (create + edit = Write 관심사)
  - `Features/NoteDelete` (하위): 노트 삭제 mutation
- **Category 도메인**:
  - `Entities/Category` (상위): 공통 타입, 읽기 API, 순수 표시 Ui (CategoryBadge)
  - `Features/CategoryWrite` (하위): 카테고리 생성/삭제 mutation
  - `Features/CategoryFilter` (하위): 필터 상태 관리 (Zustand)

### Import 방향 검증
```
✅ Features/NoteWrite → Entities/Note (하위→상위, 허용)
✅ Features/NoteDelete → Entities/Note (하위→상위, 허용)
✅ Features/CategoryFilter → Entities/Category (하위→상위, 허용)
❌ Features/NoteWrite → Features/NoteDelete (형제 간, 금지)
❌ Entities/Note → Features/NoteWrite (상위→하위, 금지)
```

### 서브도메인 분리 기준 (Custom FSD 규칙)
- 관심사 분기 + 공통 로직 존재: 서브도메인 분리
- Note: Write(작성+편집), Detail(상세), Delete(삭제) 관심사 → NoteWrite/NoteDelete 분리
- Category: Write(관리), Filter(필터) 관심사 → CategoryWrite/CategoryFilter 분리

---

## R8: 테스트 전략

### Decision: Vitest + Testing Library (단위/통합), Playwright (E2E)

### Rationale
- Constitution 요구사항 준수
- FSD 규칙의 테스트 파일 배치: 소스 파일 옆 sibling 방식 (`*.test.ts`, `*.test.tsx`)
- `__Mock__` 세그먼트: 테스트에서만 직접 import 허용

### 테스트 범위
| 레이어 | 테스트 대상 | 방식 |
|---|---|---|
| Entities/*/Api | HTTP 함수, queryOptions | Vitest + MSW |
| Entities/*/Ui | 컴포넌트 렌더링, 접근성 | Vitest + Testing Library |
| Features/*/Api | Mutation 함수 | Vitest + MSW |
| Features/*/Model | Hook 로직 | Vitest + renderHook |
| Widgets/* | 통합 동작 | Vitest + Testing Library |
| Pages/* | 페이지 렌더링 | Playwright E2E |
