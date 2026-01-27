# Implementation Plan: 모노레포 환경 구성

**Branch**: `001-monorepo-setup` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: pnpm Turbo를 사용하여 모노레포 환경을 구축하려고 해. apps/* packages/* 로 아마 구성될 것 같은데 app은 현재 환경 구성하는단계가 아닌 나중에 병렬로 각각 생성하려고 하는데 어때?

## Summary

pnpm workspace와 Turbo 빌드 시스템을 활용한 모노레포 환경 구축. 중형 규모(5-15개 프로젝트) 웹 개발 조직을 위한 효율적인 프로젝트 관리 시스템 구현. @repo/config 패키지를 통한 중앙화된 설정 관리와 ESLint/Prettier 통합으로 일관된 코드 품질 보장.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 18.17.0+
**Primary Dependencies**: pnpm 9.14.4+, Turbo 2.3.0+, ESLint 8.15.0+, Prettier 3.6.2+
**Storage**: N/A (설정 파일 기반)
**Testing**: Jest (패키지 테스트), Vitest (앱 테스트 시 사용 예정)
**Target Platform**: 개발자 워크스테이션 (macOS, Linux, Windows)
**Project Type**: 모노레포 - 여러 앱과 공유 패키지로 구성
**Performance Goals**: 빌드 시간 30% 단축, 의존성 설치 50% 단축, 개발 서버 시작 <10초
**Constraints**: 순환 의존성 엄격히 금지, fail-fast 빌드 전략, 의존성 버전 통일 강제
**Scale/Scope**: 5-15개 프로젝트, 중소 조직 개발팀 (5-20명), 기존 코드 없는 신규 구축

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack (I)**:

Frontend:
- ❌ TypeScript strict mode used (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ React 18+ as framework (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Vite as build tool (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ TailwindCSS for styling (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ shadcn/ui as component library (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ TanStack Query for server state (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Zustand for client state (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ React Hook Form for all forms (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)

Backend:
- ❌ TypeScript strict mode used (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ NestJS framework used (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ PostgreSQL (production) / SQLite (dev/test) databases (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Prisma or TypeORM as ORM (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ class-validator + class-transformer for validation (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ JWT + Passport for authentication (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Swagger/OpenAPI documentation enabled (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)

**Architecture Principles (II)**:

Frontend (FSD):
- ❌ FSD (Feature-Sliced Design) architecture used (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Layer hierarchy respected (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Higher layers only import from lower layers (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Each slice has Public API via `index.ts` (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Container/Presenter pattern used (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Custom hooks extract business logic (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)

Backend (NestJS Modular):
- ❌ NestJS modular architecture followed (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Each module follows standard structure (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Controllers only handle HTTP requests/responses (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Services contain all business logic (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ DTOs handle validation and transformation (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ No circular dependencies between modules (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)

**Code Quality Rules (III)**:

Testing:
- ✅ TDD approach: tests written before implementation (모노레포 설정 자체가 검증 가능한 구조로 설계)
- ❌ Frontend: 80%+ test coverage planned (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Backend: 80%+ test coverage planned (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Backend: separate test database for integration tests (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)

General:
- ✅ Magic numbers replaced with named constants (설정 파일에서 상수 사용)
- ✅ Functions under 50 lines, files under 300 lines (설정 파일들이 간결하게 구성)
- ✅ Proper naming conventions (kebab-case 디렉토리, @repo/ 접두사 등)

**Documentation Rules (IV)**:

- ✅ spec.md is technology-agnostic (pnpm, Turbo 등 구체적 도구명 없이 모노레포 요구사항 기술)
- ✅ plan.md contains all technical implementation details (pnpm, Turbo 등 구체적 구현 기술 포함)
- ✅ Clear separation between WHAT/WHY (spec) and HOW (plan)
- ❌ API documentation generated via Swagger/OpenAPI decorators (현재 단계에서는 CLI 도구 API 정의만 수행)

**Development Workflow (V)**:

- ✅ One task = one commit strategy planned
- ✅ Conventional commits format to be used
- ✅ Plan Mode workflow to be followed for implementation
- ❌ Frontend verification: pnpm run type-check, lint, test, build (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ❌ Backend verification: pnpm run type-check, lint, test, test:e2e, build (현재 단계에서는 모노레포 구조만 구축, 향후 앱 추가 시 적용)
- ✅ Manual review checklist includes database optimization (의존성 그래프 최적화 고려)

## Project Structure

### Documentation (this feature)

```text
specs/001-monorepo-setup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── workspace-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**모노레포 구조 - pnpm workspace 기반**:

```text
monorepo/
├── apps/                       # 독립 실행 가능한 애플리케이션들
│   ├── web/                    # Next.js 웹 애플리케이션 (향후 추가)
│   ├── admin/                  # 관리자 대시보드 (향후 추가)
│   └── mobile/                 # React Native 모바일 앱 (향후 추가)
├── packages/                   # 공유 라이브러리 및 설정
│   ├── ui/                     # 공통 React 컴포넌트 (향후 추가)
│   ├── utils/                  # 공통 유틸리티 함수 (향후 추가)
│   ├── types/                  # 공유 TypeScript 타입 (향후 추가)
│   ├── eslint-config/          # ESLint 설정 패키지
│   │   ├── package.json
│   │   ├── index.js            # 기본 ESLint 설정
│   │   └── react.js            # React 특화 설정
│   ├── typescript-config/      # TypeScript 설정 패키지
│   │   ├── package.json
│   │   ├── base.json           # 기본 TypeScript 설정
│   │   ├── nextjs.json         # Next.js 특화 설정
│   │   └── react.json          # React 특화 설정
│   └── tailwind-config/        # Tailwind CSS 설정 (향후 추가)
├── tools/                      # 개발 도구 및 스크립트 (향후 추가)
│   ├── build-scripts/          # 사용자 정의 빌드 도구
│   └── generators/             # 코드 생성기
├── docs/                       # 프로젝트 문서
├── .github/                    # GitHub Actions 워크플로우
│   └── workflows/
├── package.json                # 루트 패키지 설정
├── pnpm-workspace.yaml         # pnpm 워크스페이스 정의
├── turbo.json                  # Turbo 빌드 설정
├── tsconfig.json               # 루트 TypeScript 설정 (project references)
├── .eslintrc.js                # 루트 ESLint 설정
├── .prettierrc.js              # Prettier 설정
├── .npmrc                      # pnpm 설정
├── .gitignore                  # Git ignore 설정
└── README.md                   # 프로젝트 문서
```

**Structure Decision**: 이 구조는 pnpm workspace와 Turbo의 최적화된 패턴을 따르며, 확장성과 유지보수성을 고려한 표준적인 모노레포 레이아웃입니다. apps/는 배포 가능한 애플리케이션, packages/는 공유 코드와 설정을 담당하는 명확한 분리를 제공합니다.

## Complexity Tracking

> **Current phase: monorepo setup only - no Constitution violations expected**

모든 Constitution 요구사항은 향후 앱 추가 시점에서 적용됩니다. 현재 단계는 기반 구조 설정에 집중하며, 실제 애플리케이션 코드 작성 시 Constitution의 모든 규칙이 적용됩니다.

---

## Implementation Phases

### Phase 0: Research & Foundation ✅
- [x] pnpm workspace 최적 설정 연구
- [x] Turbo 빌드 시스템 구성 연구
- [x] 중형 규모 모노레포 베스트 프랙티스 조사
- [x] TypeScript project references 활용 방안 연구

### Phase 1: Core Structure & Configuration ✅
- [x] 데이터 모델 정의 (워크스페이스, 프로젝트, 의존성 그래프)
- [x] CLI 도구 API 계약 정의
- [x] 빠른 시작 가이드 작성
- [x] Agent 컨텍스트 업데이트

### Phase 2: Tasks Generation (다음 단계)
이제 `/speckit.tasks` 명령을 실행하여 구체적인 구현 작업들을 세분화할 수 있습니다.

**Branch Status**: `001-monorepo-setup`
**Generated Artifacts**:
- [x] `research.md` - pnpm Turbo 기반 모노레포 설정 연구 결과
- [x] `data-model.md` - 워크스페이스, 프로젝트, 의존성 엔터티 정의
- [x] `quickstart.md` - 단계별 모노레포 구축 가이드
- [x] `contracts/workspace-api.yaml` - CLI 도구 OpenAPI 명세
- [x] Agent 컨텍스트 업데이트 완료

**Next Steps**: `/speckit.tasks` 명령을 실행하여 실제 구현 작업을 정의하고 시작할 수 있습니다.