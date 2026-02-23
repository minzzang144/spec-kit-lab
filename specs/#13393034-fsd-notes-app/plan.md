# Implementation Plan: FSD Notes App

**Branch**: `spec/#13393034-fsd-notes-app` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/#13393034-fsd-notes-app/spec.md`

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
specs/#13393034-fsd-notes-app/
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
    │   ├── Mock/
    │   │   └── browser.ts       # MSW browser worker setup (조합 전용 — 핸들러 직접 정의 금지)
    │   ├── Provider/
    │   │   ├── QueryProvider.tsx
    │   │   └── index.ts
    │   ├── Router/
    │   │   ├── AppRouter.tsx
    │   │   ├── AppLayout.tsx
    │   │   └── index.ts
    │   └── Style/
    │       └── global.css
    │
    ├── Pages/                   # Domain layer: route-level pages (슬라이스=관심사명, Page 접미사 없음)
    │   ├── NoteList/            # was HomePage — 관심사명으로 변경
    │   │   ├── Ui/
    │   │   │   ├── NoteListPage/    # 컴포넌트 파일명은 Page 접미사 유지
    │   │   │   │   ├── NoteListPage.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts         # 세그먼트 barrel
    │   │   └── index.ts
    │   ├── NoteWrite/           # was NoteWritePage — Page 접미사 제거
    │   │   ├── Ui/
    │   │   │   ├── NoteWritePage/
    │   │   │   │   ├── NoteWritePage.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteDetail/          # was NoteViewPage — 관심사명 NoteDetail로 변경
    │   │   ├── Ui/
    │   │   │   ├── NoteDetailPage/
    │   │   │   │   ├── NoteDetailPage.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   └── CategoryManage/      # was CategoryManagePage — Page 접미사 제거
    │       ├── Ui/
    │       │   ├── CategoryManagePage/
    │       │   │   ├── CategoryManagePage.tsx
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       └── index.ts
    │
    ├── Widgets/                 # Domain layer: independent UI blocks
    │   ├── NoteList/
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useNoteListFilter.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Ui/
    │   │   │   ├── NoteList/
    │   │   │   │   ├── NoteList.tsx
    │   │   │   │   ├── NoteList.loading.tsx
    │   │   │   │   ├── NoteList.test.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteWrite/            # was NoteEditor — 관심사명 일관성
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useNoteForm.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Ui/
    │   │   │   ├── NoteWrite/
    │   │   │   │   ├── NoteWrite.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteDetail/
    │   │   ├── Ui/
    │   │   │   ├── NoteDetail/
    │   │   │   │   ├── NoteDetail.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteSearch/              # Note 도메인 + Search 관심사 (concern-based naming)
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useSearchKeyword.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Ui/
    │   │   │   ├── NoteSearchInput/  # 컴포넌트 파일명은 구체적 역할명 사용
    │   │   │   │   ├── NoteSearchInput.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── CategorySidebar/         # Category 도메인 + Sidebar 관심사 (concern-based naming)
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useSidebarState.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Ui/
    │   │   │   ├── CategorySidebar/
    │   │   │   │   ├── CategorySidebar.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   └── CategoryFilter/
    │       ├── Ui/
    │       │   ├── CategoryFilter/
    │       │   │   ├── CategoryFilter.tsx
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       └── index.ts
    │
    ├── Features/                # Domain layer: business-meaningful user scenarios (CRUD, filters, search, navigation)
    │   ├── NoteWrite/           # 하위 도메인 (Note의 서브도메인) — create + edit 통합
    │   │   ├── __Mock__/
    │   │   │   ├── Handler.ts       # POST /api/notes + PUT /api/notes/:id 핸들러
    │   │   │   └── index.ts
    │   │   ├── Api/
    │   │   │   ├── Post.ts          # POST (create)
    │   │   │   ├── Put.ts           # PUT (update) — was NoteEdit/Api/Put.ts
    │   │   │   ├── Key.ts           # create + edit mutation key
    │   │   │   ├── Mutation.ts      # create + edit mutation option
    │   │   │   └── index.ts
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useCreateNote.ts
    │   │   │   │   ├── useUpdateNote.ts   # was NoteEdit/Model/Hook/useUpdateNote.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Type/
    │   │   │   ├── NoteWrite.ts     # CreateNoteRequest/Response + UpdateNoteRequest/Response
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteDelete/          # 하위 도메인 (Note의 서브도메인)
    │   │   ├── __Mock__/
    │   │   │   ├── Handler.ts       # DELETE /api/notes/:id 핸들러
    │   │   │   └── index.ts
    │   │   ├── Api/
    │   │   │   ├── Delete.ts
    │   │   │   ├── Key.ts
    │   │   │   ├── Mutation.ts
    │   │   │   └── index.ts
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useDeleteNote.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── NoteSearch/          # 독립 Feature
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useNoteSearch.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Type/
    │   │   │   ├── NoteSearch.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── CategoryWrite/       # 하위 도메인 (Category의 서브도메인)
    │   │   ├── __Mock__/
    │   │   │   ├── Handler.ts       # POST /api/categories, DELETE /api/categories/:id 핸들러
    │   │   │   └── index.ts
    │   │   ├── Api/
    │   │   │   ├── Post.ts
    │   │   │   ├── Delete.ts
    │   │   │   ├── Key.ts
    │   │   │   ├── Mutation.ts
    │   │   │   └── index.ts
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useCreateCategory.ts
    │   │   │   │   ├── useDeleteCategory.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Type/
    │   │   │   ├── CategoryWrite.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   └── CategoryFilter/      # 하위 도메인 (Category의 서브도메인)
    │       ├── Model/
    │       │   ├── Logic/               # Zustand 업데이트 로직 (Section 9: Logic → Features)
    │       │   │   ├── useCategoryFilterLogic.ts   # setSelectedCategoryId (useCategoryStore.setState 호출)
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       ├── Type/
    │       │   ├── CategoryFilter.ts
    │       │   └── index.ts
    │       └── index.ts
    │         # NOTE: Zustand 상태 선언(FilterSlice, useCategoryStore)은 Entities/Category/Model/Store에 위치
    │         # (custom-fsd-architecture.md Section 9: 상태 선언 → Entities, 업데이트 로직 → Features/Logic)
    │
    ├── Entities/                # Domain layer: business entities (read-oriented)
    │   ├── Note/                # 상위 도메인
    │   │   ├── __Mock__/
    │   │   │   ├── Seed.ts          # 초기 시드 데이터 (5+ notes)
    │   │   │   ├── Db.ts           # in-memory CRUD 함수
    │   │   │   ├── Handler.ts       # GET /api/notes, GET /api/notes/:id 핸들러
    │   │   │   └── index.ts         # __Mock__ barrel (슬라이스 barrel에서 re-export 금지)
    │   │   ├── Api/
    │   │   │   ├── Get.ts
    │   │   │   ├── Key.ts
    │   │   │   ├── Query.ts
    │   │   │   └── index.ts
    │   │   ├── Config/
    │   │   │   ├── NoteConfig.ts
    │   │   │   └── index.ts
    │   │   ├── Model/
    │   │   │   ├── Hook/
    │   │   │   │   ├── useNoteList.ts
    │   │   │   │   ├── useNote.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── Store/               # Zustand 상태 선언 (Section 9: 상태 → Entities)
    │   │   │   │   ├── SearchSlice.ts       # keyword 상태 (setter 없음)
    │   │   │   │   ├── useNoteStore.ts      # create() 조합
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── Type/
    │   │   │   ├── Note.ts
    │   │   │   └── index.ts
    │   │   ├── Ui/
    │   │   │   ├── NoteContent/          # 기본 렌더러 (className prop으로 재사용)
    │   │   │   │   ├── NoteContent.tsx
    │   │   │   │   └── index.ts
    │   │   │   ├── NoteContentPreview/   # 순수 표시: note.content 미리보기 (NoteContent 래핑)
    │   │   │   │   ├── NoteContentPreview.tsx
    │   │   │   │   └── index.ts
    │   │   │   ├── NoteDate/             # 순수 표시: note.createdAt 포맷팅
    │   │   │   │   ├── NoteDate.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   └── Category/            # 상위 도메인
    │       ├── __Mock__/
    │       │   ├── Seed.ts          # 초기 시드 데이터 (default + custom categories)
    │       │   ├── Db.ts           # in-memory CRUD 함수
    │       │   ├── Handler.ts       # GET /api/categories 핸들러
    │       │   └── index.ts
    │       ├── Api/
    │       │   ├── Get.ts
    │       │   ├── Key.ts
    │       │   ├── Query.ts
    │       │   └── index.ts
    │       ├── Config/
    │       │   ├── CategoryConfig.ts
    │       │   └── index.ts
    │       ├── Model/
    │       │   ├── Hook/
    │       │   │   ├── useCategoryList.ts
    │       │   │   └── index.ts
    │       │   ├── Store/               # Zustand 상태 선언 (Section 9: 상태 → Entities)
    │       │   │   ├── FilterSlice.ts       # selectedCategoryId 상태 (setter 없음)
    │       │   │   ├── useCategoryStore.ts  # create() 조합 (use{Domain}Store 규칙)
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       ├── Type/
    │       │   ├── Category.ts
    │       │   └── index.ts
    │       ├── Ui/
    │       │   ├── CategoryBadge/
    │       │   │   ├── CategoryBadge.tsx
    │       │   │   └── index.ts
    │       │   └── index.ts
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
        │   │   ├── DateFormat.ts
        │   │   └── index.ts
        │   ├── Shadcn/
        │   │   ├── Utils.ts
        │   │   └── index.ts
        │   └── index.ts
        ├── Type/
        │   ├── Common.ts
        │   └── index.ts
        └── Ui/
            ├── Shadcn/              # shadcn CLI 자동 생성 (소문자 파일, barrel 없음)
            │   ├── button.tsx
            │   ├── input.tsx
            │   ├── dialog.tsx
            │   ├── card.tsx
            │   ├── textarea.tsx
            │   ├── select.tsx
            │   ├── label.tsx
            │   ├── badge.tsx
            │   └── separator.tsx
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
| Non-domain 레이어 (슬라이스=세그먼트) | App/Config, App/Mock, App/Provider, Shared/Api, Shared/Ui | 세그먼트 직접 사용 |
| Domain 레이어 (슬라이스→세그먼트) | Entities/Note/Api, Features/NoteWrite/Model | 슬라이스 내 세그먼트 구조 |
| 상위/하위 도메인 | Note(상위), NoteWrite/NoteDelete(하위); Category(상위), CategoryWrite/CategoryFilter(하위) | Import 방향 검증 |
| 세그먼트 종류 (__Mock__, Api, Config, Model, Type, Ui) | Entities/Note에 모든 세그먼트 사용 | 6종 세그먼트 모두 포함 |
| 세그먼트 1단계 그룹핑 | Model/Hook, Model/Store | 최대 depth 5 준수 |
| Barrel-everywhere (슬라이스+세그먼트+그룹) | 모든 슬라이스/세그먼트/그룹에 index.ts | 빌드 시 import 검증 |
| Import 규칙 (상대/절대) | 같은 슬라이스: `../../Type` (barrel 경유), 다른 슬라이스: `#/Entities/Note` | ESLint 규칙 가능 |
| __Mock__ 3-file 패턴 | Seed.ts (시드 데이터) + Db.ts (in-memory CRUD) + Handler.ts (MSW 핸들러) | 파일 구조 검증 |
| __Mock__ 분산 핸들러 | Entity __Mock__: GET 핸들러, Feature __Mock__: POST/PUT/PATCH/DELETE 핸들러 | Handler.ts 내용 검증 |
| __Mock__ 슬라이스 barrel re-export 금지 | 슬라이스 index.ts에서 __Mock__ re-export 안 함; `#/Entities/Note/__Mock__`으로 직접 import | 코드 리뷰 |
| App/Mock 조합 전용 | App/Mock/browser.ts에서 핸들러 직접 정의 금지 — import + setupWorker만 | 코드 리뷰 |
| TanStack Query 통합 | Entities/*/Api: Get+Key+Query, Features/*/Api: Post/Put/Delete+Key+Mutation | queryOptions/mutationOptions factory |
| Zustand 상태 선언 → Entities/Model/Store | Entities/Category/Model/Store/useCategoryStore, Entities/Note/Model/Store/useNoteStore | Section 9: 상태 선언은 Entities, setter 없는 slice |
| Zustand 업데이트 로직 → Features/Model/Logic | Features/CategoryFilter/Model/Logic/useCategoryFilterLogic, Features/NoteSearch/Model/Logic/useNoteSearchLogic | Section 9: 업데이트 로직은 Features/Logic |
| 파일 네이밍 (PascalCase/camelCase) | 디렉토리 PascalCase, Hook camelCase, Slice PascalCase | 전체 파일 구조 |
| No-plurals 네이밍 | useNoteList (not useNotes), useCategoryList (not useCategories) | 복수형 접미사 금지 |
| UI 컴포넌트 구조 | NoteContentPreview/, NoteSearchInput/ 등 | ComponentName.tsx + index.ts (sibling vs 별도 폴더 기준 적용) |
| Entity Ui 순수성 | NoteContentPreview, NoteDate (순수 표시만) | onClick/라우팅/다른 도메인 금지 |
| Feature Ui 자기완결성 | SendButton, DeleteButton | 단일 액션, children 래퍼 금지 |
| Widget Ui 조합/래핑 | NoteList (Entity Ui + Feature 조합) | 네비게이션, 래퍼 컴포넌트 |
| shadcn/ui Shadcn/ 그룹 | Shared/Ui/Shadcn/ (소문자 파일, barrel 없음); Shared/Model/Shadcn/Utils.ts | CLI 생성 파일 예외 |
| Path Alias (#/) | tsconfig.json paths: `#/*` → `src/*` | 빌드 검증 |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 백엔드 미구현 (NestJS, PostgreSQL, Prisma 등) | Custom FSD 규칙 테스트가 목적. 프론트엔드 아키텍처 검증에 집중 | 풀스택 구현 시 FSD 규칙 검증에 집중하기 어려움 |
| Container/Presenter 미사용 | Custom FSD에서 Ui 세그먼트 내 컴포넌트 폴더 구조를 사용 | Constitution의 Container/Presenter는 Custom FSD 규칙으로 대체 |
| JWT/Passport 미사용 | 단일 사용자 앱이므로 인증 불필요 | spec.md Assumptions에 명시된 범위 |
