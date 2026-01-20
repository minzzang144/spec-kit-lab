<!--
Sync Impact Report:
Version change: 2.0.0 → 2.0.1 (Package manager update)
Modified sections:
  - Development Workflow: Agent Workflow verification checklist (npm → pnpm)
Added sections: None
Removed sections: None
Templates requiring updates:
  - No template updates required (tooling change only)
Follow-up TODOs: None - package manager change is isolated
-->

# Spec Kit Lab Constitution

## I. Technology Stack (NON-NEGOTIABLE)

### Core
- **Language**: TypeScript (strict mode)
- **Framework**: React 18+
- **Build Tool**: Vite

### Styling & UI
- **CSS Framework**: TailwindCSS (utility-first only)
- **Component Library**: shadcn/ui
- **Design System**: Follow shadcn/ui patterns for consistency

### State Management & Data Fetching
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand (for global UI state only)
- **Form State**: React Hook Form

### Testing
- **Unit/Integration**: Vitest + Testing Library
- **E2E Testing**: Playwright
- **Coverage Requirement**: >80% for business logic

### Code Quality Tools
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

## II. Architecture Principles

### Folder Structure (FSD - Feature-Sliced Design)
```
src/
├── app/           # Application initialization, providers, routing
├── pages/         # Page components (route-level)
├── widgets/       # Complex UI blocks (header, sidebar, etc.)
├── features/      # User scenarios (auth, cart, filters)
├── entities/      # Business entities (user, product, order)
├── shared/        # Reusable utilities, UI kit, API client
```

### Layer Rules (NON-NEGOTIABLE)
- **Higher layers can import from lower layers ONLY**
  - ✅ `features` → `entities` → `shared`
  - ❌ `entities` → `features` (FORBIDDEN)
- **Each layer is independent**: No cross-imports within same layer
- **Public API only**: Use `index.ts` to expose module interface

### Design Principles
- **Single Responsibility Principle (SRP)**:
  - Each component/function does ONE thing
  - If a component handles >2 concerns, split it
- **Separation of Concerns**:
  - UI components (presentation) ≠ Business logic
  - Use custom hooks for logic extraction
- **Composition over Inheritance**:
  - Prefer composing small components over large monolithic ones
- **Dependency Inversion**:
  - Depend on abstractions (interfaces) not implementations

### State Management Rules
- **Server State**: Always use TanStack Query
  - NO manual fetching in components
  - NO storing server data in Zustand
- **Client State**: Zustand for UI state only
  - Examples: theme, sidebar open/closed, modal state
- **Form State**: React Hook Form for ALL forms
  - NO uncontrolled components without RHF
  - Use Zod for validation schemas

### Component Architecture
- **Container/Presenter Pattern**:
  - Container: data fetching, logic (`*.container.tsx`)
  - Presenter: pure UI rendering (`*.presenter.tsx`)
- **Custom Hooks for Reusability**:
  - Extract logic to `use*.ts` hooks
  - Keep components focused on rendering

## III. Code Quality Rules

### Testing Requirements (NON-NEGOTIABLE)
- **TDD for business logic**: Write tests BEFORE implementation
- **Test Coverage**: Minimum 80% for `/features`, `/entities`
- **Integration tests for happy paths**: Focus on user journeys
- **E2E tests for critical flows**: Checkout, auth, payment

### Accessibility (NON-NEGOTIABLE)
- **WCAG 2.1 AA compliance**: All UI components must meet AA standards
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text

### Error Handling
- **No try-catch in route handlers**: Use error boundary or middleware
  - Why? Centralized error handling prevents inconsistent error responses
  - React Query handles API errors automatically
  - Use Error Boundaries for component-level errors
- **Explicit Error States**: Always show loading/error/empty states
- **Type-Safe Errors**: Use discriminated unions for error types

### Code Organization
- **No Magic Numbers**: Extract to named constants
- **No Nested Ternaries**: Max 1 level of ternary operators
- **Function Length**: Keep functions under 50 lines (prefer 20-30)
- **File Length**: Keep files under 300 lines (split if larger)
- **Naming Conventions**:
  - Components: PascalCase (`UserProfile.tsx`)
  - Hooks: camelCase with `use` prefix (`useUserData.ts`)
  - Utils: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Performance
- **Code Splitting**: Use React.lazy() for route-based splitting
- **Memoization**: Use React.memo, useMemo, useCallback judiciously
- **Bundle Size**: Keep initial bundle < 200KB (gzipped)

## IV. Documentation Rules

### spec.md: WHAT & WHY (Technology-Agnostic)
**Purpose**: Describe the problem and desired outcome without implementation details

**Must Include**:
- User stories and use cases
- Business requirements and constraints
- Success criteria and acceptance tests
- UI/UX requirements (wireframes, user flows)

**Must NOT Include** (NON-NEGOTIABLE):
- ❌ Framework names (React, Vue, etc.)
- ❌ Library names (TanStack Query, Zustand, etc.)
- ❌ Architecture patterns (FSD, MVC, etc.)
- ❌ Technical implementation details

**Example**:
```markdown
✅ GOOD: "Users must be able to filter products by price range"
❌ BAD: "Create a Zustand store for filter state with TanStack Query"
```

### plan.md: HOW (All Technical Details)
**Purpose**: Translate spec into concrete technical implementation

**Must Include**:
- Framework and library choices
- Architecture decisions (FSD layers, folder structure)
- Component hierarchy and data flow
- API endpoints and data models
- Performance optimization strategies
- Testing strategy for this feature

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
feat(auth): implement login form with validation
fix(cart): resolve quantity update bug
refactor(user): extract profile logic to custom hook
test(checkout): add E2E test for payment flow
```

**Scope**: Use FSD layer or feature name
- `auth`, `cart`, `user`, `product`
- `shared`, `entities`, `features`

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
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Tests
pnpm run test

# Build
pnpm run build
```

##### 2. Manual Review
- [ ] Code follows FSD architecture
- [ ] No cross-layer violations (use `/analyze` to check)
- [ ] Components under 300 lines
- [ ] Functions under 50 lines
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Responsive design verified (mobile, tablet, desktop)

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
- [ ] Feature works in dev environment
- [ ] No console errors or warnings
- [ ] Network requests succeed
- [ ] Loading/error states display correctly

**Only after ALL verification passes**: Commit the code

## VI. Governance

### Constitution Priority
- This Constitution **overrides all other instructions**
- If conflict arises, Constitution wins
- Agent must flag Constitution violations immediately

### Modification Process
1. Propose change with justification
2. Team approval required
3. Update Constitution
4. Update affected specs/plans
5. Create migration guide if needed

### Enforcement
- Use `/analyze` command to check violations
- Agent must refuse work that violates Constitution
- Pre-commit hooks enforce code quality rules

**Version**: 2.0.0 | **Ratified**: 2025-01-20 | **Last Amended**: 2025-01-20