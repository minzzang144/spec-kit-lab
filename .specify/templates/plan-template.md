# Implementation Plan: [FEATURE]

**Branch**: `[spec/#ticket-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/#ticket-feature-name/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack (I)**:

Frontend:
- [ ] TypeScript strict mode used
- [ ] React 18+ as framework
- [ ] Vite as build tool
- [ ] TailwindCSS for styling (utility-first only)
- [ ] shadcn/ui as component library
- [ ] TanStack Query for server state
- [ ] Zustand for client state (UI state only)
- [ ] React Hook Form for all forms

Backend:
- [ ] TypeScript strict mode used
- [ ] NestJS framework used
- [ ] PostgreSQL (production) / SQLite (dev/test) databases
- [ ] Prisma or TypeORM as ORM
- [ ] class-validator + class-transformer for validation
- [ ] JWT + Passport for authentication
- [ ] Swagger/OpenAPI documentation enabled

**Architecture Principles (II)**:

Frontend (FSD):
- [ ] FSD (Feature-Sliced Design) architecture used
- [ ] Layer hierarchy respected: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- [ ] Higher layers only import from lower layers (no reverse imports)
- [ ] Each slice has Public API via `index.ts`
- [ ] Container/Presenter pattern used for complex components
- [ ] Custom hooks extract business logic from components

Backend (NestJS Modular):
- [ ] NestJS modular architecture followed
- [ ] Each module follows standard structure (controller, service, entity, dto, tests)
- [ ] Controllers only handle HTTP requests/responses
- [ ] Services contain all business logic
- [ ] DTOs handle validation and transformation
- [ ] No circular dependencies between modules

**Code Quality Rules (III)**:

Testing:
- [ ] TDD approach: tests written before implementation
- [ ] Frontend: 80%+ test coverage planned for `/features` and `/entities` (Vitest + Testing Library + Playwright)
- [ ] Backend: 80%+ test coverage planned for services and controllers (Jest + Supertest)
- [ ] Backend: separate test database for integration tests

Frontend Quality:
- [ ] WCAG 2.1 AA compliance planned for all UI components
- [ ] Error boundaries planned (no try-catch in route handlers)
- [ ] React Query handles server state (no manual fetching)
- [ ] Container/Presenter pattern for complex components

Backend Quality:
- [ ] Global exception filters for error handling
- [ ] DTOs with class-validator for all input validation
- [ ] JWT authentication with secure HttpOnly cookies
- [ ] API endpoints documented with Swagger/OpenAPI
- [ ] Rate limiting and CORS configured
- [ ] Database queries optimized (no N+1 problems)

General:
- [ ] Magic numbers replaced with named constants
- [ ] Functions under 50 lines, files under 300 lines
- [ ] Proper naming conventions (PascalCase components/services, camelCase hooks, UPPER_SNAKE_CASE constants)

**Documentation Rules (IV)**:

- [ ] spec.md is technology-agnostic (no React, NestJS, Prisma, etc. mentioned)
- [ ] plan.md contains all technical implementation details (frameworks, libraries, architecture)
- [ ] Clear separation between WHAT/WHY (spec) and HOW (plan)
- [ ] API documentation generated via Swagger/OpenAPI decorators

**Development Workflow (V)**:

- [ ] One task = one commit strategy planned
- [ ] Conventional commits format to be used
- [ ] Plan Mode workflow to be followed for implementation
- [ ] Frontend verification: pnpm run type-check, lint, test, build
- [ ] Backend verification: pnpm run type-check, lint, test, test:e2e, build
- [ ] Manual review checklist includes backend API documentation and database optimization

## Project Structure

### Documentation (this feature)

```text
specs/#ticket-feature/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── app/            # Application initialization, providers, routing
│   ├── pages/          # Full pages (e.g., home/, profile/)
│   ├── widgets/        # Independent UI blocks (e.g., header/, sidebar/)
│   ├── features/       # User interactions (e.g., auth/login/, cart/add-item/)
│   ├── entities/       # Business entities (e.g., user/, product/)
│   └── shared/         # Reusable code (ui/, lib/, api/, types/)
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
