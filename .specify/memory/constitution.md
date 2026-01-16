<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (Initial constitution based on Frontend Design Guideline)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (Readability, Predictability, Cohesion, Coupling)
  - Frontend Development Standards
  - Code Organization Guidelines
Templates requiring updates:
  - ✅ plan-template.md (Constitution Check section updated with all 4 principles + Frontend Standards)
  - ✅ tasks-template.md (No changes needed - task categorization already aligns with principles)
  - ✅ spec-template.md (Verified - no constitution-specific references, no changes needed)
  - ✅ command files (Verified - no outdated references, all use generic guidance)
Follow-up TODOs: None
-->

# Spec Kit Lab Constitution

## Core Principles

### I. Readability (가독성)

**MUST**: Code MUST be clear and easy to understand at first glance.

**Rules**:

- Replace magic numbers with named constants that convey semantic meaning
- Abstract complex logic/interactions into dedicated components/HOCs to reduce cognitive load
- Separate significantly different conditional UI/logic into distinct components for single responsibility
- Replace complex/nested ternaries with `if`/`else` or IIFEs for readability
- Colocate simple, localized logic or use inline definitions to reduce context switching
- Assign complex boolean conditions to named variables that make the meaning explicit

**Rationale**: Improves clarity, maintainability, testability, and reduces cognitive load by separating concerns and making code self-documenting.

### II. Predictability (예측 가능성)

**MUST**: Code MUST behave as expected based on its name, parameters, and context.

**Rules**:

- Use consistent return types for similar functions/hooks (e.g., all API hooks return `UseQueryResult<T, Error>`)
- Avoid hidden side effects; functions MUST only perform actions implied by their signature (Single Responsibility Principle)
- Use unique, descriptive names for custom wrappers/functions to avoid ambiguity (e.g., `getWithAuth` instead of generic `get`)

**Rationale**: Ensures predictable behavior without unintended side effects, creates more robust and testable code, and allows developers to understand specific actions directly from names.

### III. Cohesion (응집도)

**MUST**: Related code MUST be kept together and modules MUST have a well-defined, single purpose.

**Rules**:

- Choose field-level or form-level cohesion based on form requirements (field-level for independent validation, form-level for related fields)
- Organize directories by feature/domain, not just by code type (e.g., `domains/user/`, `domains/product/`)
- Define constants near related logic or ensure names link them clearly to prevent silent failures

**Rationale**: Increases cohesion by keeping related files together, simplifies feature understanding and maintenance, and prevents logic-constant mismatches.

### IV. Coupling (결합도)

**MUST**: Dependencies between different parts of the codebase MUST be minimized.

**Rules**:

- Avoid premature abstraction of duplicates if use cases might diverge; prefer lower coupling over forced abstraction
- Break down broad state management into smaller, focused hooks/contexts to reduce coupling and prevent unnecessary re-renders
- Use Component Composition instead of Props Drilling to eliminate unnecessary intermediate dependencies

**Rationale**: Reduces coupling by ensuring components only depend on necessary state slices, makes refactoring easier, clarifies data flow, and improves performance.

## Frontend Development Standards

### Code Organization

**MUST**: Organize code by feature/domain structure:

```
src/
├── components/ # Shared/common components
├── hooks/      # Shared/common hooks
├── utils/      # Shared/common utils
├── domains/
│   ├── user/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── product/
│   └── order/
└── App.tsx
```

**Rationale**: Increases cohesion, simplifies feature understanding, development, maintenance, and deletion.

### Component Design

**MUST**:

- Abstract complex interactions into dedicated components (e.g., `AuthGuard`, `InviteButton`)
- Separate conditional rendering paths into distinct components (e.g., `ViewerSubmitButton` vs `AdminSubmitButton`)
- Use composition over props drilling

**Rationale**: Reduces cognitive load, improves testability, and ensures single responsibility.

### State Management

**MUST**:

- Create focused hooks for specific concerns (e.g., `useCardIdQueryParam` instead of broad `useQueryParams`)
- Break down broad state management into smaller, focused hooks/contexts

**Rationale**: Ensures components only depend on necessary state slices and prevents unnecessary re-renders.

### Form Handling

**SHOULD**: Choose field-level or form-level cohesion based on requirements:

- **Field-level**: For independent validation, async checks, or reusable fields
- **Form-level**: For related fields, wizard forms, or interdependent validation

**Rationale**: Balances field independence vs. form unity based on actual requirements.

## Governance

**Amendment Procedure**:

- Constitution changes require documentation of rationale
- Version MUST follow semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Backward incompatible governance/principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:

- All PRs/reviews MUST verify compliance with constitution principles
- Complexity MUST be justified if violating principles
- Constitution supersedes all other practices

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
