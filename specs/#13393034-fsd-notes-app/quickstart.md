# Quickstart: FSD Notes App

**Branch**: `spec/#13393034-fsd-notes-app`
**Date**: 2026-02-10

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# 프로젝트 루트에서
cd apps/notes-app

# 의존성 설치
pnpm install

# MSW Service Worker 초기화 (최초 1회)
pnpm exec msw init public/ --save

# 개발 서버 시작
pnpm dev
```

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | 개발 서버 시작 (Vite + MSW) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm preview` | 빌드된 앱 미리보기 |
| `pnpm type-check` | TypeScript 타입 검사 |
| `pnpm lint` | ESLint 실행 |
| `pnpm test` | Vitest 단위/통합 테스트 |
| `pnpm test:e2e` | Playwright E2E 테스트 |

## Project Structure Overview

```
apps/notes-app/src/
├── App/         # 앱 초기화, 프로바이더, 라우팅, MSW 설정
├── Pages/       # 4개 페이지 (NoteList, NoteWrite, NoteDetail, CategoryManage)
├── Widgets/     # 6개 위젯 (NoteList, NoteWrite, NoteDetail, SearchBar, Sidebar, CategoryFilter)
├── Features/    # 5개 기능 (NoteWrite, NoteDelete, NoteSearch, CategoryWrite, CategoryFilter)
├── Entities/    # 2개 엔티티 (Note, Category)
└── Shared/      # 공유 유틸 (Api, Config, Lib, Type, Ui)
```

## Key URLs

| URL | Page | Description |
|---|---|---|
| `/` | NoteListPage | 노트 목록, 검색, 카테고리 필터 |
| `/notes/new` | NoteWritePage | 새 노트 작성 |
| `/notes/:id` | NoteDetailPage | 노트 상세 보기 + 편집 |
| `/categories` | CategoryManagePage | 카테고리 관리 |

## Path Alias

Cross-slice import에는 `#/` prefix를 사용합니다:

```typescript
// Cross-slice (절대 경로)
import { useNotes } from '#/Entities/Note';
import { httpClient } from '#/Shared/Api';

// Same-slice (상대 경로)
import type { Note } from '../../Type/Note';
```

## Mock API

MSW(Mock Service Worker)를 사용하여 백엔드 없이 동작합니다:
- 개발 모드: 브라우저 Service Worker가 fetch 요청을 인터셉트
- 테스트 모드: Node.js 서버가 요청을 인터셉트
- 데이터: in-memory 저장 (새로고침 시 초기 상태로 리셋)

## Custom FSD 규칙 검증 포인트

이 앱은 다음 규칙들을 실전 코드로 검증합니다:

1. **6개 레이어 계층**: App → Pages → Widgets → Features → Entities → Shared
2. **상위/하위 도메인**: Note(상위) ← NoteWrite/NoteDelete(하위)
3. **Import 규칙**: 상대/절대 경로, 레이어 방향, Public API
4. **세그먼트 종류**: __Mock__, Api, Config, Model, Type, Ui
5. **TanStack Query**: Entities=queryOptions, Features=mutationOptions
6. **Zustand**: slices pattern, Features/Model/Store
7. **파일 네이밍**: PascalCase 디렉토리, camelCase hooks
8. **UI 컴포넌트 구조**: ComponentName/ 폴더 + index.ts
9. **Entity Ui 순수성**: 단일 도메인의 순수 표시만 (onClick/라우팅/다른 도메인 금지)
10. **Feature Ui 자기완결성**: 단일 비즈니스 관심사 컴포넌트 (children 래퍼 금지, 내부 Dialog/Dropdown 사용 가능)
11. **Widget Ui 조합/래핑**: 2개 이상 비즈니스 관심사 조합 또는 children 래퍼
12. **서브 컴포넌트 기준**: 자체 hook/외부 import 없음 → sibling, 있음 → 별도 폴더
13. **Dialog/Dropdown 배치**: 관심사 1개 → Feature Ui 내부, 관심사 2개+ → Widget Ui 내부, 범용 → Shared/Ui
14. **순수 UI 인터랙션**: Dialog 닫기·취소·스크롤 등 비즈니스 의미 없는 인터랙션은 컴포넌트 내부 로컬 상태 또는 Shared/Ui
