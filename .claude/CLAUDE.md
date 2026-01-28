# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpecKit Lab is a feature specification and development workflow system that provides structured commands for feature development from specification to implementation. The project enables teams to:

- Create comprehensive feature specifications using predefined templates
- Generate implementation plans with technical research
- Break down features into actionable tasks
- Maintain consistent development workflows across projects

## Core Architecture

### Directory Structure

```
├── .claude/                    # Claude Code configurations and skills
│   ├── commands/              # SpecKit workflow commands (speckit.*)
│   ├── skills/                # Shared skills (React best practices, etc.)
│   ├── settings.json          # Claude hooks and notifications
│   └── rules/                 # Code quality guidelines
├── .cursor/                   # Cursor configurations (mirrors .claude/)
├── .specify/                  # Core workflow system
│   ├── scripts/bash/          # Workflow automation scripts
│   ├── templates/             # Feature specification templates
│   └── memory/                # Project constitution and context
└── specs/                     # Generated feature specifications (created by workflow)
```

### SpecKit Workflow System

The project implements a **strict multi-phase development workflow** that MUST be followed sequentially:

1. **Specification Phase** (`speckit.specify`): Creates feature specifications from natural language descriptions
2. **Planning Phase** (`speckit.plan`): Generates technical implementation plans with research
3. **Task Generation** (`speckit.tasks`): Breaks plans into actionable development tasks
4. **Implementation** (`speckit.implement`): Executes tasks with quality gates
5. **Analysis** (`speckit.analyze`): Cross-artifact consistency validation

### Key Workflow Scripts

Located in `.specify/scripts/bash/`:
- `common.sh`: Shared utilities for path resolution and branch management
- `create-new-feature.sh`: Initializes new feature branches and spec directories
- `setup-plan.sh`: Prepares planning phase with context loading
- `check-prerequisites.sh`: Validates workflow requirements

## SpecKit Commands

All commands follow pattern `speckit.[phase]` and are available in both `.claude/commands/` and `.cursor/commands/`:

### Primary Commands
- `speckit.specify <description>` - Generate feature specification from natural language
- `speckit.plan` - Create technical implementation plan from specification
- `speckit.tasks` - Break plan into prioritized development tasks
- `speckit.implement` - Execute tasks with automated quality checks

### Support Commands
- `speckit.clarify` - Identify and resolve specification ambiguities
- `speckit.analyze` - Validate consistency across specification, plan, and tasks
- `speckit.checklist` - Generate domain-specific quality checklists
- `speckit.taskstoissues` - Convert tasks to GitHub issues

## Feature Branch Naming Convention

- **Current Format**: `spec/#ticket-feature-name` (e.g., `spec/#13272f64-user-auth`, `spec/#PROJ123-payment-flow`)
- Ticket ID links the branch to an external issue tracker
- Generated specs use ticket ID in `specs/#ticket-feature-name/`
- **Ticket ID Requirements**:
  - Must be alphanumeric only (a-z, A-Z, 0-9)
  - No hyphens, spaces, or special characters
  - Examples: `13272f64`, `PROJ123`, `abc456`
- **Legacy Support**: Format `###-feature-name` (e.g., `001-user-auth`) is still recognized for backward compatibility

## Specification Templates

Located in `.specify/templates/`:
- **spec-template.md**: Technology-agnostic feature specifications
- **agent-file-template.md**: Context files for AI agents
- **checklist-template.md**: Quality validation checklists

### Critical Specification Rules
- Must be technology-agnostic (no framework/library names)
- Focus on WHAT users need and WHY, never HOW to implement
- Written for business stakeholders, not developers
- User stories prioritized as independently testable slices

## Code Quality Guidelines

The project follows clean code principles defined in `.claude/rules/`:
- `clean-code-unified.md`: Universal clean code guidelines
- `typescript-specifics.md`: TypeScript-specific patterns
- `toss-frontend-rule.md`: Frontend design guidelines focusing on readability, predictability, cohesion, and coupling
- `javascript-specifics.md`: Modern JavaScript patterns

## Skills Integration

### Vercel React Best Practices
- Located in both `.claude/skills/` and `.cursor/skills/`
- 45 performance optimization rules across 8 categories
- Priority-based application (CRITICAL → LOW impact)
- Automatically triggered for React/Next.js code work

## Development Workflow

1. **Start Feature**: Run `speckit.specify "feature description"`
2. **Create Plan**: Run `speckit.plan` after specification is complete
3. **Generate Tasks**: Run `speckit.tasks` to break down implementation
4. **Execute**: Run `speckit.implement` to execute tasks with quality gates
5. **Validate**: Run `speckit.analyze` for cross-artifact consistency

## Quality Gates

The system enforces quality through:
- Specification validation checklists
- Constitution compliance checks (technology-agnostic requirements)
- Cross-artifact consistency analysis
- Automated prerequisite checking

## Working with Features

- Each feature gets isolated directory in `specs/#ticket-feature-name/`
- Contains: `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`
- Branch-based isolation allows parallel feature development
- Ticket ID enables traceability to external issue trackers
- Legacy specs with `###-` prefix are still supported

## Error Handling

- Scripts provide JSON output for programmatic consumption
- Comprehensive error messages with resolution guidance
- Fallback behavior for non-git repositories
- Validation failures block workflow progression