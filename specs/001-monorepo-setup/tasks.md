# Tasks: 모노레포 환경 구성

**Input**: Design documents from `/specs/001-monorepo-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 모노레포 구조 자체가 검증 가능한 구조로 설계되며, 빌드/실행 테스트를 통해 검증합니다.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Requirements**: All tasks must follow the constitution:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- TDD approach: write failing tests first, then implement
- Follow clean code guidelines and proper naming conventions

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

현재 프로젝트는 모노레포 설정에 집중하므로 다음 구조를 따릅니다:
- **루트**: package.json, pnpm-workspace.yaml, turbo.json 등 기본 설정
- **packages/**: 공유 설정 패키지들 (typescript-config, eslint-config 등)
- **apps/**: 향후 애플리케이션 추가를 위한 디렉토리 (현재 단계에서는 빈 디렉토리)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 초기화 및 기본 구조 설정

- [x] T001 Create monorepo directory structure (apps/, packages/, .github/, docs/)
- [x] T002 Initialize root package.json with workspace configuration and scripts
- [x] T003 [P] Create pnpm-workspace.yaml with workspace patterns
- [x] T004 [P] Configure .npmrc with pnpm optimization settings
- [x] T005 [P] Create .gitignore with Node.js and build artifacts exclusions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Install Turbo build system in root package.json
- [x] T007 Create turbo.json with optimized task pipeline configuration
- [x] T008 [P] Create packages/typescript-config package with base.json, nextjs.json, react.json configurations
- [x] T009 [P] Create packages/eslint-config package with index.js and react.js configurations
- [x] T010 [P] Set up root tsconfig.json with project references
- [x] T011 [P] Configure root .eslintrc.js extending @repo/eslint-config
- [x] T012 [P] Set up .prettierrc.js with consistent formatting rules
- [x] T013 Install root development dependencies (eslint, prettier, typescript)
- [x] T014 Execute pnpm install to initialize workspace

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 단일 저장소에서 여러 프로젝트 관리 (Priority: P1) 🎯 MVP

**Goal**: 하나의 저장소에서 여러 프로젝트를 효율적으로 관리할 수 있는 기본 모노레포 구조 완성

**Independent Test**: 여러 프로젝트를 생성하고 각각 독립적으로 빌드/실행할 수 있으며, 공통 설정을 공유할 수 있다

### Validation & Testing for User Story 1

- [x] T015 [US1] Validate Turbo build system with `pnpm turbo build` (should complete without errors)
- [x] T016 [US1] Test workspace structure with `pnpm ls --depth=0` (verify workspace packages)
- [x] T017 [P] [US1] Validate TypeScript configuration compilation across workspace
- [x] T018 [P] [US1] Run ESLint validation across all workspace packages

### Implementation for User Story 1

- [x] T019 [P] [US1] Create sample frontend app structure in apps/sample-web/ with Next.js template
- [x] T020 [P] [US1] Create sample backend api structure in apps/sample-api/ with basic Node.js setup
- [x] T021 [US1] Configure sample-web app to use @repo/typescript-config and @repo/eslint-config
- [x] T022 [US1] Configure sample-api app to use @repo/typescript-config and @repo/eslint-config
- [x] T023 [US1] Add app-specific scripts in each sample app's package.json
- [x] T024 [US1] Update root tsconfig.json to include references to sample apps

### Integration & Quality for User Story 1

- [x] T025 [US1] Test independent app builds: `pnpm turbo build` (both apps should build successfully)
- [x] T026 [US1] Test independent app development: `pnpm turbo dev` (both apps should start)
- [x] T027 [US1] Verify apps inherit shared ESLint/Prettier configs correctly
- [x] T028 [US1] Document app creation process in README.md

**Checkpoint**: At this point, multiple projects can be managed in a single repository independently

---

## Phase 4: User Story 2 - 의존성 통합 관리 (Priority: P2)

**Goal**: 여러 프로젝트의 의존성을 중앙에서 효율적으로 관리하고, 중복을 제거할 수 있다

**Independent Test**: 공통 의존성이 루트에서 관리되고, 각 프로젝트별 고유 의존성이 분리되며, 의존성 설치/업데이트가 한 번에 수행된다

### Implementation for User Story 2

- [ ] T029 [P] [US2] Move common dev dependencies to root package.json (typescript, eslint, prettier)
- [ ] T030 [P] [US2] Configure pnpm workspace dependency hoisting in .npmrc
- [ ] T031 [US2] Create dependency management scripts in root package.json (install-all, update-all)
- [ ] T032 [P] [US2] Set up dependency version consistency checking with syncpack or similar tool
- [ ] T033 [US2] Configure Renovate or Dependabot for automated dependency updates

### Validation & Testing for User Story 2

- [ ] T034 [US2] Test dependency installation: `pnpm install` should work efficiently for entire workspace
- [ ] T035 [US2] Validate dependency deduplication: check node_modules structure for shared dependencies
- [ ] T036 [US2] Test dependency updates: ensure all projects use consistent versions
- [ ] T037 [US2] Verify memory usage and installation speed improvements

**Checkpoint**: At this point, dependencies are centrally managed with no duplicates

---

## Phase 5: User Story 3 - 프로젝트 간 코드 공유 (Priority: P2)

**Goal**: 프로젝트 간에 공통 코드, 유틸리티, 컴포넌트를 쉽게 공유하고 재사용할 수 있다

**Independent Test**: 공유 라이브러리를 생성하고, 다른 프로젝트에서 해당 라이브러리를 import하여 사용할 수 있다

### Implementation for User Story 3

- [ ] T038 [P] [US3] Create packages/shared-utils package with common utility functions
- [ ] T039 [P] [US3] Create packages/shared-types package with TypeScript type definitions
- [ ] T040 [P] [US3] Set up package.json configurations for shared packages with proper exports
- [ ] T041 [US3] Configure TypeScript path mapping for shared packages in tsconfig.json
- [ ] T042 [US3] Add workspace dependencies in sample apps to reference shared packages
- [ ] T043 [US3] Update Turbo pipeline to handle shared package dependencies correctly

### Validation & Testing for User Story 3

- [ ] T044 [US3] Test shared package import in sample-web app (import from @repo/shared-utils)
- [ ] T045 [US3] Test shared package import in sample-api app (import from @repo/shared-types)
- [ ] T046 [US3] Validate hot-reload works when shared packages change
- [ ] T047 [US3] Test build dependency chain: changes in shared packages trigger app rebuilds

**Checkpoint**: At this point, code can be shared efficiently between projects

---

## Phase 6: User Story 4 - 통합 빌드 및 배포 (Priority: P3)

**Goal**: 모든 프로젝트를 한 번에 빌드하거나, 특정 프로젝트만 선별적으로 빌드할 수 있다

**Independent Test**: 전체 빌드 명령어와 개별 프로젝트 빌드 명령어가 모두 정상 작동한다

### Implementation for User Story 4

- [ ] T048 [P] [US4] Configure Turbo caching strategy for optimal build performance
- [ ] T049 [P] [US4] Set up selective build scripts for individual projects
- [ ] T050 [P] [US4] Create GitHub Actions workflow for CI/CD pipeline
- [ ] T051 [US4] Configure Turbo remote caching for team development (optional)
- [ ] T052 [US4] Add build optimization settings in turbo.json for different environments

### Validation & Testing for User Story 4

- [ ] T053 [US4] Test full workspace build: `pnpm turbo build` completes successfully
- [ ] T054 [US4] Test selective build: `pnpm turbo build --filter=sample-web` works
- [ ] T055 [US4] Measure and document build time improvements with caching
- [ ] T056 [US4] Test parallel build execution with multiple projects

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T057 [P] Create comprehensive README.md with setup and usage instructions
- [ ] T058 [P] Add troubleshooting guide based on quickstart.md
- [ ] T059 [P] Set up VS Code workspace settings for optimal development experience
- [ ] T060 [P] Configure git hooks with husky for pre-commit validation
- [ ] T061 Create documentation for adding new apps and packages
- [ ] T062 Set up package.json scripts for common developer workflows
- [ ] T063 Validate entire setup against quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds upon US1 structure
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Requires US1 project structure
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Benefits from US1-3 being complete

### Within Each User Story

- Validation tasks can run in parallel where marked [P]
- Implementation follows logical dependency order
- Testing validates the story works independently
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can progress in parallel (if team capacity allows)
- Validation tasks within each user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all validation tasks for User Story 1 together:
Task: "Validate TypeScript configuration compilation across workspace"
Task: "Run ESLint validation across all workspace packages"

# Launch all sample app creation together:
Task: "Create sample frontend app structure in apps/sample-web/"
Task: "Create sample backend api structure in apps/sample-api/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Ready for use (MVP!)
3. Add User Story 2 → Test independently → Enhanced efficiency
4. Add User Story 3 → Test independently → Code sharing enabled
5. Add User Story 4 → Test independently → Full build optimization
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task with conventional commit format
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 63 across 4 user stories + setup + polish
- MVP scope: Phases 1-3 (28 tasks) delivers fully functional monorepo