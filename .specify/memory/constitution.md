<!--
Sync Impact Report:
Version change: 2.1.1 → 2.1.2 (E2E testing requirements generalization)
Modified sections:
  - Code Quality Rules > Frontend Testing: Generalized E2E requirements
    - Changed from "E2E tests for critical flows: Checkout, auth, payment"
    - To "E2E tests for all user stories" with specific requirements
Removed sections: None
Added sections: None
Templates requiring updates:
  - ✅ spec-template.md: E2E Test Scenarios section added
  - ⚠ tasks-template.md: Should include E2E test phase
Follow-up TODOs: Update tasks-template.md with mandatory E2E phase
-->

# Spec Kit Lab Constitution

## I. Technology Stack (NON-NEGOTIABLE)

### Frontend
- **Language**: TypeScript (strict mode)
- **Framework**: React 18+
- **Build Tool**: Vite

### Backend
- **Language**: TypeScript (strict mode)
- **Framework**: NestJS (Express 기반)
- **Database**: PostgreSQL (production), SQLite (development/testing)
- **ORM**: Prisma (preferred) or TypeORM
- **Validation**: class-validator + class-transformer
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI 자동 생성

### Styling & UI
- **CSS Framework**: TailwindCSS (utility-first only)
- **Component Library**: shadcn/ui
- **Design System**: Follow shadcn/ui patterns for consistency

### State Management & Data Fetching
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand (for global UI state only)
- **Form State**: React Hook Form

### Testing
- **Frontend**: Vitest + Testing Library (unit/integration), Playwright (E2E)
- **Backend**: Jest + Supertest (unit/integration/E2E API testing)
- **Coverage Requirement**: >80% for business logic (both frontend/backend)

### Code Quality Tools
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

## II. Architecture Principles

### Repository Structure (NON-NEGOTIABLE)

This repository is a **pnpm + Turborepo monorepo**. All implementation code MUST respect the workspace layout defined in `pnpm-workspace.yaml`.

- **Applications**: `apps/[APP_NAME]/` — all new apps go under `apps/`
- **Shared packages**: `packages/[PACKAGE_NAME]/` — reusable libraries
- **NEVER** create application directories at the repository root

When `/speckit.plan` generates implementation paths, the **Project root** for any new app MUST be `apps/[APP_NAME]/`, NOT `[APP_NAME]/`.

### Frontend Structure (FSD - Feature-Sliced Design)
**Note**: `[APP_NAME]` is defined during spec creation with `/speckit.plan`

> **Authority**: All new frontend apps MUST follow `.claude/rules/custom-fsd-architecture.md`. Implementation details (naming, imports, MSW, segments, Zustand placement, etc.) are defined there, not here.

```
apps/[APP_NAME]/src/
├── App/           # Application initialization, providers, routing
├── Pages/         # Page components (route-level)
├── Widgets/       # Complex UI blocks (header, sidebar, etc.)
├── Features/      # Business-value user scenarios (CRUD, filter, search, navigation)
├── Entities/      # Business entities (read-only, pure display)
├── Shared/        # Reusable utilities, UI kit, API client
```

### Backend Architecture (NestJS Modular)
**Note**: `[APP_NAME]` is defined during spec creation with `/speckit.plan`

```
apps/[APP_NAME]/backend/src/
├── app.module.ts         # Root application module
├── main.ts              # Application entry point
├── common/              # Shared utilities, guards, interceptors
│   ├── guards/          # Authentication, authorization guards
│   ├── interceptors/    # Logging, transform, etc.
│   ├── pipes/           # Validation, transformation pipes
│   └── decorators/      # Custom decorators
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   ├── users/          # User management module
│   ├── products/       # Product module (example)
│   └── [feature]/      # Other feature modules
├── database/           # Database configuration, migrations
│   ├── migrations/     # Database migrations
│   └── seeds/          # Database seeds
├── config/             # Configuration management
└── types/              # Shared TypeScript types
```

### Backend Module Structure (NON-NEGOTIABLE)
Each NestJS module must follow this structure:
```
modules/[feature]/
├── [feature].module.ts        # Module definition
├── [feature].controller.ts    # API endpoints
├── [feature].service.ts       # Business logic
├── [feature].entity.ts        # Database entity (Prisma model)
├── dto/                       # Data Transfer Objects
│   ├── create-[feature].dto.ts
│   ├── update-[feature].dto.ts
│   └── [feature]-response.dto.ts
├── guards/                    # Module-specific guards (if needed)
├── pipes/                     # Module-specific pipes (if needed)
└── tests/                     # Module tests
    ├── [feature].controller.spec.ts
    ├── [feature].service.spec.ts
    └── [feature].e2e.spec.ts
```

### Layer Rules (NON-NEGOTIABLE)
**Frontend (FSD)**:
- Higher layers can import from lower layers ONLY
- ✅ `Pages → Widgets → Features → Entities → Shared`
- ❌ `Entities → Features` (FORBIDDEN)

**Backend (NestJS)**:
- Controllers only handle HTTP requests/responses
- Services contain all business logic
- Entities represent database models only
- DTOs handle data validation and transformation
- No circular dependencies between modules

### Design Principles
- **Single Responsibility Principle (SRP)**:
  - Each component/service/controller does ONE thing
  - If handling >2 concerns, split it
- **Separation of Concerns**:
  - Controllers ≠ Business logic ≠ Data access
  - Use services for business logic, repositories for data access
- **Composition over Inheritance**:
  - Prefer composing small modules over large monolithic ones
- **Dependency Inversion**:
  - Depend on abstractions (interfaces) not implementations

### State Management Rules
- **Server State**: Always use TanStack Query on frontend
  - NO manual fetching in components
  - NO storing server data in Zustand
  - `queryOptions` factory → `Entities/{Domain}/Api/Query.ts`
  - `mutationOptions` factory → `Features/{Domain}/Api/Mutation.ts`
- **Client State**: Zustand for shared UI state (2+ Widgets sharing the same state)
  - Single-component state → `useState` (no Zustand)
- **Form State**: React Hook Form for ALL forms
  - NO uncontrolled components without RHF
  - Use Zod for validation schemas

### API Design Rules (NON-NEGOTIABLE)
- **RESTful Design**: Follow REST conventions for resource endpoints
- **Consistent Naming**: Use kebab-case for URLs (`/api/user-profiles`)
- **HTTP Status Codes**: Use appropriate status codes (200, 201, 400, 401, 403, 404, 500)
- **Response Format**: Consistent JSON response structure
```typescript
// Success Response
{ data: T, message?: string }

// Error Response
{ error: string, message: string, statusCode: number }
```
- **Validation**: All input validation at DTO level using class-validator
- **Documentation**: All endpoints must have Swagger/OpenAPI documentation

### Component Architecture
- **Container/Presenter Pattern** (Frontend):
  - Container: data fetching, logic (`*.container.tsx`)
  - Presenter: pure UI rendering (`*.presenter.tsx`)
- **Service/Controller Pattern** (Backend):
  - Controller: HTTP handling (`*.controller.ts`)
  - Service: business logic (`*.service.ts`)

## III. Code Quality Rules

### Testing Requirements (NON-NEGOTIABLE)

#### Frontend Testing
- **TDD for business logic**: Write tests BEFORE implementation
- **Test Coverage**: Minimum 80% for `/features`, `/entities`
- **Integration tests for happy paths**: Focus on user journeys
- **E2E tests for all user stories**: Each user story MUST have E2E tests covering:
  - 핵심 사용자 시나리오 (complete user journey from start to finish)
  - 데이터 persistence (if applicable)
  - Happy path + critical error scenarios

#### Backend Testing
- **Unit Tests**: All services and utilities (Jest)
- **Integration Tests**: Database interactions, external services
- **E2E API Tests**: Complete request/response cycles (Supertest)
- **Test Coverage**: Minimum 80% for services and controllers
- **Test Database**: Use separate test database (SQLite for speed)

### Accessibility (NON-NEGOTIABLE)
- **WCAG 2.1 AA compliance**: All UI components must meet AA standards
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text

### Error Handling

#### Frontend Error Handling
- **No try-catch in route handlers**: Use error boundary or middleware
  - Why? Centralized error handling prevents inconsistent error responses
  - React Query handles API errors automatically
  - Use Error Boundaries for component-level errors
- **Explicit Error States**: Always show loading/error/empty states
- **Type-Safe Errors**: Use discriminated unions for error types

#### Backend Error Handling
- **Global Exception Filter**: Use NestJS built-in exception filters
- **Custom Exceptions**: Extend HttpException for domain-specific errors
- **Validation Errors**: Automatic validation using ValidationPipe
- **Logging**: Log all errors with context (request ID, user ID)
```typescript
// Example custom exception
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}
```

### Security Requirements (NON-NEGOTIABLE)
- **Authentication**: JWT tokens with secure HttpOnly cookies
- **Authorization**: Guard-based role/permission checking
- **Input Validation**: All DTOs must use class-validator
- **SQL Injection**: Use Prisma/TypeORM parameterized queries only
- **CORS**: Configure CORS for production domains only
- **Rate Limiting**: Implement rate limiting for public APIs
- **Helmet**: Use helmet middleware for security headers

### Code Organization
- **No Magic Numbers**: Extract to named constants
- **No Nested Ternaries**: Max 1 level of ternary operators
- **Function Length**: Keep functions under 50 lines (prefer 20-30)
- **File Length**: Keep files under 300 lines (split if larger)
- **Naming Conventions**:
  - Components: PascalCase (`UserProfile.tsx`)
  - Hooks: camelCase with `use` prefix (`useUserData.ts`)
  - Services/Controllers: PascalCase (`UserService`, `UserController`)
  - Utils: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Performance
- **Frontend**:
  - Code Splitting: Use React.lazy() for route-based splitting
  - Memoization: Use React.memo, useMemo, useCallback judiciously
  - Bundle Size: Keep initial bundle < 200KB (gzipped)
- **Backend**:
  - Database Queries: Use indexes and optimize N+1 queries
  - Caching: Implement Redis caching for frequently accessed data
  - Response Time: API responses < 500ms for 95th percentile

## IV. Documentation Rules

### spec.md: WHAT & WHY (Technology-Agnostic)
**Purpose**: Describe the problem and desired outcome without implementation details

**Must Include**:
- User stories and use cases
- Business requirements and constraints
- Success criteria and acceptance tests
- UI/UX requirements (wireframes, user flows)
- API requirements (inputs/outputs, not implementation)

**Must NOT Include** (NON-NEGOTIABLE):
- ❌ Framework names (React, NestJS, etc.)
- ❌ Library names (TanStack Query, Prisma, etc.)
- ❌ Architecture patterns (FSD, modular, etc.)
- ❌ Technical implementation details

**Example**:
```markdown
✅ GOOD: "Users must be able to filter products by price range"
❌ BAD: "Create a NestJS service with Prisma for product filtering"
```

### plan.md: HOW (All Technical Details)
**Purpose**: Translate spec into concrete technical implementation

**Must Include**:
- Framework and library choices (React, NestJS, Prisma)
- Architecture decisions (FSD layers, NestJS modules)
- Component/service hierarchy and data flow
- API endpoints and data models
- Database schema and relationships
- Performance optimization strategies
- Testing strategy for this feature

### API Documentation (Backend)
- **Swagger/OpenAPI**: Automatically generated from decorators
- **Endpoint Documentation**: Each endpoint must have:
  - Purpose and business logic description
  - Request/response examples
  - Error scenarios and status codes
  - Authentication/authorization requirements

## V. Development Workflow

### Commit Strategy (NON-NEGOTIABLE)

#### One Task = One Commit
- Every task (T001, T002, T003) gets a separate commit
- Commit immediately after task completion
- NO bulk commits combining multiple tasks

#### Conventional Commits Format
Follow https://www.conventionalcommits.org/en/v1.0.0/

**Format**: `<type>(<scope>): <description>`

**Types**:
- `feat`: New feature (T001, T002, etc.)
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `chore`: Build process, dependencies, tooling

**Examples**:
```bash
feat(auth): implement JWT authentication service
feat(users): add user profile API endpoint
fix(products): resolve price calculation bug
refactor(auth): extract JWT logic to separate service
test(users): add E2E tests for user creation
```

**Scope**: Use module/feature name
- Frontend: `auth`, `cart`, `user`, `product`, `shared`, `entities`, `features`
- Backend: `auth`, `users`, `products`, `database`, `common`

#### Commit Message Template
```
<type>(<scope>): <short summary (50 chars max)>

[Optional body: explain WHAT changed and WHY]

[Optional footer: breaking changes, issue references]

Task: T001
```

### Agent Workflow (CRITICAL)

#### Always Start with Plan Mode
**Before ANY implementation work**:

1. **Press `Shift+Tab`** to toggle Plan Mode in Cursor Agent
2. Agent will:
   - Research codebase for relevant files
   - Ask clarifying questions
   - Create detailed implementation plan
   - Wait for your approval
3. **Review the plan**: Edit/adjust before implementation
4. **Save to workspace**: Store in `.cursor/plans/` for documentation

**Why Plan Mode**:
- Prevents wasted effort on wrong approach
- Creates reviewable roadmap before coding
- Documents decision-making process
- Enables easy restart if direction changes

**Exception**: Skip Plan Mode only for:
- Trivial changes (typo fixes, formatting)
- Repeated tasks you've done 5+ times

#### Verification After Completion (NON-NEGOTIABLE)

**After completing ANY task, run verification checklist**:

##### 1. Automated Checks (Must Pass)
```bash
# Frontend checks
cd frontend
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build

# Backend checks
cd backend
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run build
```

##### 2. Manual Review
- [ ] Code follows architecture patterns (FSD frontend, modular backend)
- [ ] No cross-layer violations (use `/analyze` to check)
- [ ] Components/services under 300 lines
- [ ] Functions under 50 lines
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] API endpoints documented in Swagger
- [ ] Database queries optimized (no N+1 problems)

##### 3. Sub-Agent Review (Recommended)
Use Cursor's **Agent Review** feature:
1. Click **Review** → **Find Issues**
2. Agent analyzes code line-by-line
3. Flags potential problems
4. Fix issues before committing

**For Critical Features**: Run multi-model review
- Select 2-3 different models
- Compare their review findings
- Apply best suggestions from all

##### 4. Integration Testing
- [ ] Feature works in dev environment (both frontend/backend)
- [ ] No console errors or warnings
- [ ] API requests succeed with proper status codes
- [ ] Loading/error states display correctly
- [ ] Database operations work correctly

**Only after ALL verification passes**: Commit the code

## VI. Governance

### Constitution Priority
- This Constitution **overrides all other instructions**
- If conflict arises, Constitution wins
- Agent must flag Constitution violations immediately

### Modification Process
1. Propose change with justification
2. Team approval required
3. Update Constitution with proper version bump
4. Update affected specs/plans
5. Create migration guide if needed

### Enforcement
- Use `/analyze` command to check violations
- Agent must refuse work that violates Constitution
- Pre-commit hooks enforce code quality rules

**Version**: 2.1.2 | **Ratified**: 2025-01-20 | **Last Amended**: 2026-01-29