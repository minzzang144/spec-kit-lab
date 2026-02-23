---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/#ticket-feature-name/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following constitution TDD requirements, tests are MANDATORY for business logic. All test tasks MUST be completed BEFORE implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Requirements**: All tasks must follow the constitution v2.1.0:
- One task = one commit (commit immediately after each task)
- Use conventional commits format: `<type>(<scope>): <description>`
- TDD approach: write failing tests first, then implement
- Follow FSD architecture (frontend) and NestJS modular architecture (backend)
- Frontend: verify with pnpm run type-check, lint, test, build
- Backend: verify with pnpm run type-check, lint, test, test:e2e, build

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**CRITICAL — MONOREPO**: This repository uses pnpm + Turborepo. All app code lives under `apps/`.
- **Project root**: `apps/[APP_NAME]/` (NEVER at repo root)
- **Single project**: `apps/[APP_NAME]/src/`, `apps/[APP_NAME]/tests/`
- **Web app**: `apps/[APP_NAME]/backend/src/`, `apps/[APP_NAME]/frontend/src/`
- **Mobile**: `apps/[APP_NAME]/api/src/`, `apps/[APP_NAME]/ios/` or `android/`
- **Frontend paths**: Follow FSD structure (`src/app/`, `src/features/`, `src/entities/`, `src/shared/`)
- **Backend paths**: Follow NestJS structure (`src/modules/[feature]/`, `src/common/`, `src/database/`)
- Paths shown below assume `apps/[APP_NAME]/` as project root - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

Frontend & Backend Shared:
- [ ] T004 Setup database schema and migrations (Prisma/TypeORM)
- [ ] T005 [P] Configure environment variables and configuration management
- [ ] T006 [P] Setup shared TypeScript types between frontend and backend

Backend Foundational:
- [ ] T007 [P] Create NestJS app structure with modules, guards, interceptors
- [ ] T008 [P] Implement JWT authentication service with Passport
- [ ] T009 [P] Setup global exception filters and validation pipes
- [ ] T010 [P] Configure Swagger/OpenAPI documentation
- [ ] T011 [P] Setup database connection and base entities
- [ ] T012 [P] Implement security middleware (CORS, rate limiting, helmet)

Frontend Foundational:
- [ ] T013 [P] Setup React app with FSD structure and routing
- [ ] T014 [P] Configure TanStack Query with proper error handling
- [ ] T015 [P] Setup Zustand stores for global UI state
- [ ] T016 [P] Create base components and shared utilities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY - TDD Required) ⚠️

> **CONSTITUTION REQUIREMENT: Write these tests FIRST, ensure they FAIL before implementation**
> **E2E TESTS ARE MANDATORY**: Per constitution v2.1.2, all user stories MUST have E2E tests

Frontend Tests:
- [ ] T017 [P] [US1] Unit test for [Entity] in frontend/src/entities/[entity]/[entity].test.ts (Vitest + Testing Library)
- [ ] T018 [P] [US1] Integration test for [Feature] in frontend/src/features/[feature]/[feature].test.tsx
- [ ] T019 [P] [US1] **E2E test (MANDATORY)** for user flow in frontend/e2e/[story].spec.ts (Playwright)

Backend Tests:
- [ ] T020 [P] [US1] Unit test for [Service] in backend/src/modules/[module]/tests/[module].service.spec.ts (Jest)
- [ ] T021 [P] [US1] Controller test for [API endpoints] in backend/src/modules/[module]/tests/[module].controller.spec.ts
- [ ] T022 [P] [US1] **E2E API test (MANDATORY)** for [endpoints] in backend/src/modules/[module]/tests/[module].e2e.spec.ts (Supertest)

### Implementation for User Story 1 (After Tests Pass)

Backend Implementation:
- [ ] T023 [P] [US1] Create [Entity] Prisma model in backend/src/database/schema.prisma
- [ ] T024 [P] [US1] Create [Entity] DTO classes in backend/src/modules/[module]/dto/
- [ ] T025 [US1] Implement [Module] service in backend/src/modules/[module]/[module].service.ts
- [ ] T026 [US1] Implement [Module] controller in backend/src/modules/[module]/[module].controller.ts
- [ ] T027 [US1] Create [Module] module in backend/src/modules/[module]/[module].module.ts
- [ ] T028 [US1] Add Swagger decorators and API documentation

Frontend Implementation:
- [ ] T029 [P] [US1] Create [Entity] model in frontend/src/entities/[entity]/model/[entity].ts
- [ ] T030 [P] [US1] Create [Entity] API client in frontend/src/entities/[entity]/api/[entity].api.ts (TanStack Query)
- [ ] T031 [US1] Create [Feature] hook in frontend/src/features/[feature]/model/use[Feature].ts
- [ ] T032 [US1] Create [Component] presenter in frontend/src/features/[feature]/ui/[Component].presenter.tsx
- [ ] T033 [US1] Create [Component] container in frontend/src/features/[feature]/ui/[Component].container.tsx
- [ ] T034 [US1] Add [Feature] public API in frontend/src/features/[feature]/index.ts

Integration & Quality:
- [ ] T035 [US1] Add error boundaries and loading states (React Query + Error Boundaries)
- [ ] T036 [US1] Verify accessibility compliance (WCAG 2.1 AA)
- [ ] T037 [US1] Run frontend verification (typecheck, lint, test, build)
- [ ] T038 [US1] Run backend verification (typecheck, lint, test, test:e2e, build)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY - TDD Required) ⚠️

> **E2E TESTS ARE MANDATORY**: Per constitution v2.1.2, all user stories MUST have E2E tests

- [ ] TXXX [P] [US2] Unit/Integration test for [component/service]
- [ ] TXXX [P] [US2] **E2E test (MANDATORY)** for [user journey] in e2e/[story].spec.ts (Playwright)

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T021 [US2] Implement [Service] in src/services/[service].py
- [ ] T022 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY - TDD Required) ⚠️

> **E2E TESTS ARE MANDATORY**: Per constitution v2.1.2, all user stories MUST have E2E tests

- [ ] TXXX [P] [US3] Unit/Integration test for [component/service]
- [ ] TXXX [P] [US3] **E2E test (MANDATORY)** for [user journey] in e2e/[story].spec.ts (Playwright)

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T027 [US3] Implement [Service] in src/services/[service].py
- [ ] T028 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N-1: E2E Integration Testing (MANDATORY) 🧪

**Purpose**: Verify complete user journeys across all user stories work together

**⚠️ CONSTITUTION REQUIREMENT (v2.1.2)**: This phase is MANDATORY for all features

### E2E Test Setup (if not already done)

- [ ] TXXX Setup Playwright in project root or frontend directory
- [ ] TXXX Configure playwright.config.ts with webServer and browser settings
- [ ] TXXX Add test:e2e and test:e2e:ui scripts to package.json

### Cross-Story E2E Tests

> These tests verify that all user stories work together as a complete feature

- [ ] TXXX E2E test for complete user workflow (US1 → US2 → US3 integration)
- [ ] TXXX E2E test for data persistence across all operations
- [ ] TXXX E2E test for error handling across user stories

### E2E Verification

- [ ] TXXX Run all E2E tests (pnpm run test:e2e)
- [ ] TXXX Verify E2E coverage for all user stories defined in spec.md
- [ ] TXXX Document any E2E test failures and resolutions

**Checkpoint**: All E2E tests pass - feature is ready for final polish

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
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
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

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

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Implementation Branches

When running `/speckit.implement`, feature branches are created from the spec branch.

### Branch Flow

```
develop (stable - production ready)
  │
  └── spec/#ticket-feature-name (verification - spec + implementation integration)
       │                        ↑
       │                        │ PR: feature → spec
       │                        │
       ├── [Single Mode]        │
       │   └── feature/#ticket-feature-name ──────┘
       │
       └── [Parallel Mode]
           ├── feature/#ticket-us1-feature-name ──┐
           ├── feature/#ticket-us2-feature-name ──┼── PR → spec
           └── feature/#ticket-us3-feature-name ──┘

Final: spec/#ticket-feature-name → PR → develop (release)
```

### Single Mode

For smaller features (1-2 User Stories) or single developer work:

```
feature/#ticket-feature-name
```

- All tasks executed in one branch
- One PR for entire feature implementation
- Simpler workflow, less branch management

### Parallel Mode (User Story Branches)

For larger features (3+ User Stories) or team collaboration:

| User Story | Branch Pattern | PR Target |
|------------|----------------|-----------|
| Foundation (Phase 1-2) | `feature/#ticket-feature-name` | spec branch |
| US1 | `feature/#ticket-us1-feature-name` | spec branch |
| US2 | `feature/#ticket-us2-feature-name` | spec branch |
| US3 | `feature/#ticket-us3-feature-name` | spec branch |

**Execution Strategy (Option C: Sequential-Parallel Hybrid)**:

1. **Phase 1-2 (Foundation)**: Complete in `feature/#ticket-feature-name`
   - Setup + Foundational infrastructure (shared code)
   - MUST complete before User Story branches start

2. **Phase 3+ (User Stories)**: Can proceed in parallel after Foundation
   - Each User Story gets its own branch (if needed)
   - Or continue in single branch for smaller stories

**Merge Order**:
1. Each `feature` branch → `spec` branch (implementation integration)
2. Review and test in `spec` branch
3. `spec` branch → `develop` (release)

### Choosing a Mode

| Criteria | Single Mode | Parallel Mode |
|----------|-------------|---------------|
| Feature size | Small-Medium | Large |
| User Stories | 1-2 | 3+ |
| Team size | 1 developer | Multiple developers |
| PR review preference | One large PR | Multiple smaller PRs |
| Complexity | Low | Higher (more branches) |

**Recommendation**: Start with Single Mode. Switch to Parallel Mode if:
- Feature grows larger than expected
- Team wants to parallelize work
- Stakeholders prefer incremental PR reviews
