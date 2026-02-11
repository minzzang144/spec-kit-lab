# Implementation Plan: FSD Notes App

**Branch**: `spec/#13393034-fsd-notes-app` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/#13393034-fsd-apps/notes-app/spec.md`

**Note**: This plan implements a Notes/Memo application designed to validate all rules in the Custom FSD Architecture rule file.

## Summary

Custom FSD Architecture 규칙의 전체 검증을 위한 Notes/Memo 앱을 구현한다. 노트 CRUD, 카테고리 관리, 검색, 필터링, 사이드바 네비게이션 기능을 포함하며, 6개 FSD 레이어, 상위/하위 도메인, TanStack Query/Zustand 통합, Import 규칙, 세그먼트 그룹핑 등 Custom FSD의 모든 규칙을 실전 코드로 검증한다. 백엔드 없이 MSW(Mock Service Worker)로 API를 모킹하여 프론트엔드에 집중한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 19, Vite 7.x, TailwindCSS 4.x (@tailwindcss/vite plugin), TanStack Query 5.x, Zustand 5.x, React Router 7.x (library mode), React Hook Form + Zod, MSW 2.x, shadcn/ui
**Storage**: MSW Mock API (in-memory, 브라우저 Service Worker 기반)
**Testing**: Vitest + Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web (SPA, 최신 Chrome/Firefox/Safari/Edge)
**Project Type**: Single Frontend App (apps/notes-app/)
**Performance Goals**: 목록 로드 2초 이내, 검색/필터 500ms 이내, 초기 번들 < 200KB (gzipped)
**Constraints**: 단일 사용자, 오프라인 미지원, 플레인 텍스트만
**Scale/Scope**: ~20 files across 6 FSD layers, 3 pages, 5+ widgets, 2 entities, 3+ features

## Technology Version Check (MANDATORY)

### Frontend Dependencies Version Check

| Dependency       | Constitution Says | Target Version | Configuration Method                    | Verified via context7 |
|------------------|-------------------|----------------|----------------------------------------|----------------------|
| React            | React 18+         | 19.x           | Standard JSX transform                  | [x]                  |
| Vite             | Vite              | 7.x            | vite.config.ts                          | [x]                  |
| TailwindCSS      | TailwindCSS       | 4.x            | @tailwindcss/vite plugin (NOT tailwind.config.js) | [x]                  |
| Zustand          | Zustand           | 5.x            | create() with slices pattern            | [x]                  |
| TanStack Query   | TanStack Query    | 5.x            | QueryClientProvider + queryOptions factory | [x]                  |
| React Router     | N/A (new choice)  | 7.x            | Library mode (createBrowserRouter)      | [x]                  |
| React Hook Form  | React Hook Form   | 7.x            | useForm + zodResolver                   | [x]                  |
| MSW              | N/A (mock layer)  | 2.x            | browser worker + http handlers          | [x]                  |
| shadcn/ui        | shadcn/ui         | latest          | CLI-based component installation        | [x]                  |

### Backend Dependencies Version Check

백엔드 없음. Mock API(MSW)로 대체. spec.md Assumptions에 명시.

### Breaking Changes Identified

- [x] TailwindCSS v4: `tailwind.config.js` 사용하지 않음. `@tailwindcss/vite` 플러그인 사용, CSS에서 `@import "tailwindcss"` 사용
- [x] React 19: Concurrent features 기본 활성화, `use()` hook 추가, ref forwarding 자동화
- [x] Zustand v5: `create()` API 유지, TypeScript 타입 개선
- [x] React Router v7: framework mode와 library mode 분리. Library mode로 `createBrowserRouter` 사용

### Version Lock Decision

**Lock versions in package.json?**: Yes
**Reason**: FSD 규칙 검증이 목적이므로, 의존성 변경으로 인한 예기치 않은 이슈를 방지

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack (I)**:

Frontend:
- [x] TypeScript strict mode used
- [x] React 18+ as framework (React 19 사용)
- [x] Vite as build tool (Vite 7.x)
- [x] TailwindCSS for styling (utility-first only, v4 + @tailwindcss/vite)
- [x] shadcn/ui as component library
- [x] TanStack Query for server state (v5, queryOptions/mutationOptions factory)
- [x] Zustand for client state (UI state only, v5 slices pattern)
- [x] React Hook Form for all forms (+ Zod validation)

Backend:
- [ ] ~~TypeScript strict mode used~~ → N/A (백엔드 없음)
- [ ] ~~NestJS framework used~~ → N/A
- [ ] ~~PostgreSQL/SQLite databases~~ → N/A (MSW in-memory)
- [ ] ~~Prisma or TypeORM as ORM~~ → N/A
- [ ] ~~class-validator + class-transformer~~ → N/A
- [ ] ~~JWT + Passport for authentication~~ → N/A (단일 사용자, 인증 없음)
- [ ] ~~Swagger/OpenAPI documentation~~ → N/A

**Architecture Principles (II)**:

Frontend (FSD):
- [x] FSD (Feature-Sliced Design) architecture used → Custom FSD 규칙 적용
- [x] Layer hierarchy respected: `App` → `Pages` → `Widgets` → `Features` → `Entities` → `Shared`
- [x] Higher layers only import from lower layers (no reverse imports)
- [x] Each slice has Public API via `index.ts`
- [ ] ~~Container/Presenter pattern~~ → Custom FSD에서는 Ui 세그먼트 내 컴포넌트 폴더 구조 사용
- [x] Custom hooks extract business logic from components (Model/Hook 세그먼트)

Backend (NestJS Modular):
- [ ] ~~All backend rules~~ → N/A (백엔드 없음)

**Code Quality Rules (III)**:

Testing:
- [x] TDD approach: tests written before implementation
- [x] Frontend: 80%+ test coverage planned for `/Features` and `/Entities` (Vitest + Testing Library + Playwright)
- [ ] ~~Backend testing~~ → N/A

Frontend Quality:
- [x] WCAG 2.1 AA compliance planned for all UI components
- [x] Error boundaries planned
- [x] React Query handles server state (no manual fetching)
- [x] Custom FSD Ui 세그먼트 컴포넌트 구조 사용 (Container/Presenter 대신)

General:
- [x] Magic numbers replaced with named constants
- [x] Functions under 50 lines, files under 300 lines
- [x] Proper naming conventions (PascalCase 디렉토리/컴포넌트, camelCase hooks, UPPER_SNAKE_CASE constants)

**Documentation Rules (IV)**:

- [x] spec.md is technology-agnostic
- [x] plan.md contains all technical implementation details
- [x] Clear separation between WHAT/WHY (spec) and HOW (plan)
- [ ] ~~API documentation via Swagger~~ → N/A (contracts/ 디렉토리에 OpenAPI YAML로 문서화)

**Development Workflow (V)**:

- [x] One task = one commit strategy planned
- [x] Conventional commits format to be used
- [x] Plan Mode workflow to be followed for implementation
- [x] Frontend verification: pnpm run type-check, lint, test, build

## Project Structure

### Documentation (this feature)

```text
specs/#13393034-fsd-apps/notes-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI YAML)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/notes-app/
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html
├── public/
│   └── mockServiceWorker.js    # MSW Service Worker
│
└── src/
    ├── main.tsx                 # Entry point
    │
    ├── App/                     # Non-domain layer: App initialization
    │   ├── Config/
    │   │   └── Env.ts
    │   ├── Provider/
    │   │   ├── QueryProvider.tsx
    │   │   └── index.ts
    │   ├── Router/
    │   │   ├── AppRouter.tsx
    │   │   └── index.ts
    │   ├── Style/
    │   │   └── global.css
    │   └── Mock/
    │       └── browser.ts       # MSW browser worker setup
    │
    ├── Pages/                   # Domain layer: route-level pages
    │   ├── HomePage/
    │   │   ├── Ui/
    │   │   │   └── HomePage/
    │   │   │       ├── HomePage.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── NoteWritePage/
    │   │   ├── Ui/
    │   │   │   └── NoteWritePage/
    │   │   │       ├── NoteWritePage.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── NoteViewPage/
    │   │   ├── Ui/
    │   │   │   └── NoteViewPage/
    │   │   │       ├── NoteViewPage.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   └── CategoryManagePage/
    │       ├── Ui/
    │       │   └── CategoryManagePage/
    │       │       ├── CategoryManagePage.tsx
    │       │       └── index.ts
    │       └── index.ts
    │
    ├── Widgets/                 # Domain layer: independent UI blocks
    │   ├── NoteList/
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useNoteListFilter.ts
    │   │   ├── Ui/
    │   │   │   └── NoteList/
    │   │   │       ├── NoteList.tsx
    │   │   │       ├── NoteList.loading.tsx
    │   │   │       ├── NoteList.test.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── NoteEditor/
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useNoteForm.ts
    │   │   ├── Ui/
    │   │   │   └── NoteEditor/
    │   │   │       ├── NoteEditor.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── NoteDetail/
    │   │   ├── Ui/
    │   │   │   └── NoteDetail/
    │   │   │       ├── NoteDetail.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── SearchBar/
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useSearchKeyword.ts
    │   │   ├── Ui/
    │   │   │   └── SearchBar/
    │   │   │       ├── SearchBar.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   ├── Sidebar/
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useSidebarState.ts
    │   │   ├── Ui/
    │   │   │   └── Sidebar/
    │   │   │       ├── Sidebar.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   └── CategoryFilter/
    │       ├── Ui/
    │       │   └── CategoryFilter/
    │       │       ├── CategoryFilter.tsx
    │       │       └── index.ts
    │       └── index.ts
    │
    ├── Features/                # Domain layer: user write actions
    │   ├── NoteWrite/           # 하위 도메인 (Note의 서브도메인)
    │   │   ├── __Mock__/
    │   │   │   └── noteWriteHandlers.ts
    │   │   ├── Api/
    │   │   │   ├── Post.ts
    │   │   │   ├── Key.ts
    │   │   │   └── Mutation.ts
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useCreateNote.ts
    │   │   ├── Type/
    │   │   │   └── NoteWrite.ts
    │   │   └── index.ts
    │   ├── NoteEdit/            # 하위 도메인 (Note의 서브도메인)
    │   │   ├── Api/
    │   │   │   ├── Put.ts
    │   │   │   ├── Key.ts
    │   │   │   └── Mutation.ts
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useUpdateNote.ts
    │   │   ├── Type/
    │   │   │   └── NoteEdit.ts
    │   │   └── index.ts
    │   ├── NoteDelete/          # 하위 도메인 (Note의 서브도메인)
    │   │   ├── Api/
    │   │   │   ├── Delete.ts
    │   │   │   ├── Key.ts
    │   │   │   └── Mutation.ts
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useDeleteNote.ts
    │   │   └── index.ts
    │   ├── NoteSearch/          # 독립 Feature
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       └── useNoteSearch.ts
    │   │   ├── Type/
    │   │   │   └── NoteSearch.ts
    │   │   └── index.ts
    │   ├── CategoryWrite/       # 하위 도메인 (Category의 서브도메인)
    │   │   ├── __Mock__/
    │   │   │   └── categoryWriteHandlers.ts
    │   │   ├── Api/
    │   │   │   ├── Post.ts
    │   │   │   ├── Delete.ts
    │   │   │   ├── Key.ts
    │   │   │   └── Mutation.ts
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       ├── useCreateCategory.ts
    │   │   │       └── useDeleteCategory.ts
    │   │   ├── Type/
    │   │   │   └── CategoryWrite.ts
    │   │   └── index.ts
    │   └── CategoryFilter/      # 하위 도메인 (Category의 서브도메인)
    │       ├── Model/
    │       │   ├── Hook/
    │       │   │   └── useCategoryFilter.ts
    │       │   └── Store/
    │       │       ├── FilterSlice.ts
    │       │       └── useFilterStore.ts
    │       ├── Type/
    │       │   └── CategoryFilter.ts
    │       └── index.ts
    │
    ├── Entities/                # Domain layer: business entities (read-oriented)
    │   ├── Note/                # 상위 도메인
    │   │   ├── __Mock__/
    │   │   │   └── noteMockData.ts
    │   │   ├── Api/
    │   │   │   ├── Get.ts
    │   │   │   ├── Key.ts
    │   │   │   └── Query.ts
    │   │   ├── Config/
    │   │   │   └── NoteConfig.ts
    │   │   ├── Model/
    │   │   │   └── Hook/
    │   │   │       ├── useNotes.ts
    │   │   │       └── useNote.ts
    │   │   ├── Type/
    │   │   │   └── Note.ts
    │   │   ├── Ui/
    │   │   │   ├── NoteCard/
    │   │   │   │   ├── NoteCard.tsx
    │   │   │   │   ├── NoteCard.test.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── EmptyNoteState/
    │   │   │       ├── EmptyNoteState.tsx
    │   │   │       └── index.ts
    │   │   └── index.ts
    │   └── Category/            # 상위 도메인
    │       ├── __Mock__/
    │       │   └── categoryMockData.ts
    │       ├── Api/
    │       │   ├── Get.ts
    │       │   ├── Key.ts
    │       │   └── Query.ts
    │       ├── Config/
    │       │   └── CategoryConfig.ts
    │       ├── Model/
    │       │   └── Hook/
    │       │       └── useCategories.ts
    │       ├── Type/
    │       │   └── Category.ts
    │       ├── Ui/
    │       │   └── CategoryBadge/
    │       │       ├── CategoryBadge.tsx
    │       │       └── index.ts
    │       └── index.ts
    │
    └── Shared/                  # Non-domain layer: shared utilities
        ├── Api/
        │   ├── httpClient.ts
        │   └── index.ts
        ├── Config/
        │   ├── Routes.ts
        │   └── index.ts
        ├── Model/
        │   ├── Lib/
        │   │   └── DateFormat.ts
        │   ├── Shadcn/
        │   │   └── Utils.ts
        │   └── index.ts
        ├── Type/
        │   ├── Common.ts
        │   └── index.ts
        └── Ui/
            ├── Button/
            │   ├── Button.tsx
            │   └── index.ts
            ├── Input/
            │   ├── Input.tsx
            │   └── index.ts
            ├── Dialog/
            │   ├── ConfirmDialog.tsx
            │   └── index.ts
            ├── ErrorBoundary/
            │   ├── ErrorBoundary.tsx
            │   └── index.ts
            └── index.ts
```

**Structure Decision**: Frontend-only SPA (`apps/notes-app/` 디렉토리). Custom FSD Architecture 규칙에 따라 PascalCase 디렉토리, 6-layer 구조를 엄격히 준수. 백엔드는 MSW로 대체하여 FSD 규칙 검증에 집중한다.

### Custom FSD 규칙 커버리지 매핑

| Custom FSD 규칙 | 구현 위치 | 검증 방법 |
|---|---|---|
| 6개 레이어 | App/Pages/Widgets/Features/Entities/Shared | 전체 디렉토리 구조 |
| Non-domain 레이어 (슬라이스=세그먼트) | App/Config, App/Provider, Shared/Api, Shared/Ui | 세그먼트 직접 사용 |
| Domain 레이어 (슬라이스→세그먼트) | Entities/Note/Api, Features/NoteWrite/Model | 슬라이스 내 세그먼트 구조 |
| 상위/하위 도메인 | Note(상위), NoteWrite/NoteEdit/NoteDelete(하위); Category(상위), CategoryWrite/CategoryFilter(하위) | Import 방향 검증 |
| 세그먼트 종류 (__Mock__, Api, Config, Model, Type, Ui) | Entities/Note에 모든 세그먼트 사용 | 6종 세그먼트 모두 포함 |
| 세그먼트 1단계 그룹핑 | Model/Hook, Model/Store | 최대 depth 5 준수 |
| Public API (index.ts) | 모든 슬라이스에 index.ts | 빌드 시 import 검증 |
| Import 규칙 (상대/절대) | 같은 슬라이스: `../../Type/Note`, 다른 슬라이스: `#/Entities/Note` | ESLint 규칙 가능 |
| TanStack Query 통합 | Entities/*/Api: Get+Query, Features/*/Api: Post/Put/Delete+Mutation | queryOptions/mutationOptions factory |
| Zustand slices pattern | Features/CategoryFilter/Model/Store/FilterSlice+useFilterStore | 여러 Widget에서 공유 상태 |
| 파일 네이밍 (PascalCase/camelCase) | 디렉토리 PascalCase, Hook camelCase, Slice PascalCase | 전체 파일 구조 |
| UI 컴포넌트 구조 | NoteCard/, SearchBar/ 등 | ComponentName.tsx + index.ts |
| Path Alias (#/) | tsconfig.json paths: `#/*` → `src/*` | 빌드 검증 |
| __Mock__ export 금지 | index.ts에서 __Mock__ export 안 함 | 코드 리뷰 |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 백엔드 미구현 (NestJS, PostgreSQL, Prisma 등) | Custom FSD 규칙 테스트가 목적. 프론트엔드 아키텍처 검증에 집중 | 풀스택 구현 시 FSD 규칙 검증에 집중하기 어려움 |
| Container/Presenter 미사용 | Custom FSD에서 Ui 세그먼트 내 컴포넌트 폴더 구조를 사용 | Constitution의 Container/Presenter는 Custom FSD 규칙으로 대체 |
| JWT/Passport 미사용 | 단일 사용자 앱이므로 인증 불필요 | spec.md Assumptions에 명시된 범위 |
