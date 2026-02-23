---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
handoffs:
  - label: Review Session
    description: Analyze session to extract learnings and suggest improvements
    command: /session-review --speckit
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### Step 1: Detect Current State and Determine Next Cycle

a. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` to get current branch info.

b. **Determine current cycle based on branch and tasks.md**:

   1. Read `tasks.md` and identify Phase structure:
      - Phase 1+2 (Setup + Foundation) → `base` cycle
      - Phase 3 (User Story 1) → `us1` cycle
      - Phase 4 (User Story 2) → `us2` cycle
      - Phase N+2 (User Story N) → `usN` cycle

   2. Check Phase-level completion rate (`[x]` checkboxes in tasks.md).

   3. **If on `spec/#ticket-*` branch** (starting fresh or returning to spec):
      - Determine next incomplete cycle from tasks.md checkbox completion
      - Phase 1+2 incomplete → start `base` cycle
      - Phase 1+2 complete, Phase 3 incomplete → start `us1` cycle
      - Phase 1+2 + Phase 3 complete, Phase 4 incomplete → start `us2` cycle
      - All phases complete → display "모든 구현이 완료되었습니다." and exit

   4. **If on `feature/#ticket-*` branch** (resuming mid-cycle):
      - Parse cycle from branch name (e.g., `feature/#ticket-base-feature` → `base` cycle)
      - Read tasks.md to find incomplete tasks within current cycle's phases
      - Resume from first incomplete task

   5. **Push spec branch to remote** (if on spec and not already pushed):
      - Run: `git push -u origin $(git branch --show-current)`
      - This ensures planning artifacts are available on remote before implementation starts.

c. **Display cycle status summary**:

   ```text
   Cycle Status:
   - base (Phase 1+2): [completed/in-progress/pending] (N/M tasks)
   - us1 (Phase 3): [completed/in-progress/pending] (N/M tasks)
   - us2 (Phase 4): [completed/in-progress/pending] (N/M tasks)

   Next: [cycle-name] ([resume/start])
   ```

### Step 2: Create or Switch to Cycle Branch

**For each new cycle**, create a feature branch using Stacked PR pattern:

| Cycle | Branch Name | Fork From | PR Base |
|-------|------------|-----------|---------|
| `base` | `feature/#ticket-base-feature` | `spec/#ticket-feature` | `spec/#ticket-feature` |
| `us1` | `feature/#ticket-us1-feature` | `feature/#ticket-base-feature` | `feature/#ticket-base-feature` |
| `us2` | `feature/#ticket-us2-feature` | `feature/#ticket-us1-feature` | `feature/#ticket-us1-feature` |
| `usN` | `feature/#ticket-usN-feature` | `feature/#ticket-us(N-1)-feature` | `feature/#ticket-us(N-1)-feature` |

**Branch creation commands**:

- **base cycle**: `.specify/scripts/bash/create-feature-branch.sh --json --cycle base`
- **us1 cycle**: `.specify/scripts/bash/create-feature-branch.sh --json --cycle us1 --from feature/#ticket-base-feature`
- **us2 cycle**: `.specify/scripts/bash/create-feature-branch.sh --json --cycle us2 --from feature/#ticket-us1-feature`

**If already on the correct cycle branch** (resuming): skip branch creation, continue from Step 3.

### Step 3: Check Checklists (Base Cycle Only)

If this is the `base` cycle and `FEATURE_DIR/checklists/` exists:
- Scan all checklist files for completion status
- Create status table:

  ```text
  | Checklist | Total | Completed | Incomplete | Status |
  |-----------|-------|-----------|------------|--------|
  | ux.md     | 12    | 12        | 0          | PASS   |
  | test.md   | 8     | 5         | 3          | FAIL   |
  ```

- **If incomplete**: STOP and ask user to proceed or halt
- **If all complete**: Proceed automatically

### Step 4: Load Implementation Context

- **REQUIRED**: Read tasks.md for the complete task list
- **REQUIRED**: Read plan.md for tech stack, architecture, file structure
- **IF EXISTS**: Read data-model.md for entities and relationships
- **IF EXISTS**: Read contracts/ for API specifications and test requirements
- **IF EXISTS**: Read research.md for technical decisions and constraints
- **IF EXISTS**: Read quickstart.md for integration scenarios

### Step 5: Project Setup Verification (Base Cycle Only)

For the `base` cycle only, create/verify ignore files based on actual project setup:

**Detection & Creation Logic**:
- Check if repository is a git repo → create/verify .gitignore
- Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
- Check if .eslintrc* exists → create/verify .eslintignore
- Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
- Check if .prettierrc* exists → create/verify .prettierignore
- Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)

**If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only.
**If ignore file missing**: Create with full pattern set for detected technology.

**Common Patterns by Technology** (from plan.md tech stack):
- **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
- **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
- **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `.idea/`, `*.log`, `.env*`
- **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

### Step 6: Execute Tasks for Current Cycle

Parse and execute tasks from the relevant phases:

| Cycle | Phases |
|-------|--------|
| `base` | Phase 1 (Setup) + Phase 2 (Foundation) |
| `us1` | Phase 3 (User Story 1) |
| `us2` | Phase 4 (User Story 2) |
| `usN` | Phase N+2 |

**Execution rules**:
- Phase-by-phase, respecting task dependencies
- Sequential tasks in order, parallel tasks `[P]` together
- TDD approach: test tasks before implementation tasks
- **1 task = 1 commit** protocol

**Progress tracking**:
- Report progress after each completed task
- Halt on non-parallel task failure
- **IMPORTANT: tasks.md checkbox + implementation code in same commit**:
  1. Complete task implementation
  2. Mark task as `[x]` in tasks.md
  3. `git add` implementation files + tasks.md
  4. Single commit

### Step 7: Code Review (Per Cycle)

After completing all tasks for the current cycle:

a. **Announce**: "[cycle] 사이클 구현이 완료되었습니다. 코드 리뷰를 진행합니다."

b. **Run code review**: Execute `/everything-claude-code:code-review` skill
   - If unavailable, inform user with installation instructions:
     ```
     code-review 스킬을 사용할 수 없습니다.
     설치: claude mcp add everything-claude-code -- npx -y @anthropic-ai/claude-code-mcp@latest
     ```

c. **Address findings**:
   - Critical/High: Fix before proceeding
   - Medium/Low: Document or fix if time permits

d. **Commit review fixes** separately:
   - `fix(<scope>): address code review feedback for [cycle]`

### Step 8: Push and Create PR (Per Cycle)

a. **Push current branch**:
   ```bash
   git push -u origin [current-branch]
   ```

b. **Run PR review**: Execute `/pr-review-toolkit:review-pr` skill
   - If unavailable, use `/everything-claude-code:code-review` as fallback

c. **Fix Critical/High issues** from PR review before creating PR

d. **Create PR with Stacked PR pattern**:

   The PR base is determined by the cycle (from Step 2 table):
   - `base` → base: `spec/#ticket-feature`
   - `us1` → base: `feature/#ticket-base-feature`
   - `us2` → base: `feature/#ticket-us1-feature`

   ```bash
   gh pr create --base [pr-base-branch] --title "[PR title]" --body "$(cat <<'EOF'
   ## Summary
   [Brief description from tasks.md for this cycle's phases]

   ## Cycle
   - **Cycle**: [base|us1|us2|...]
   - **Phases**: [Phase numbers and titles covered]
   - **Stacked on**: [PR base branch]

   ## Changes
   [List of completed tasks and key changes]

   ## Test Plan
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Code Review
   - [x] Per-cycle code review completed
   - [x] Pre-PR review completed

   Generated with [Claude Code](https://claude.ai/code) using SpecKit workflow
   EOF
   )"
   ```

e. **Post review summary** (optional):
   ```bash
   gh pr comment [PR_NUMBER] --body "[Review summary]"
   ```

f. **Report cycle completion**:
   - Display PR URL
   - Show remaining cycles status

### Step 9: Advance to Next Cycle (or Complete)

After PR creation for current cycle:

a. **If more cycles remain**:
   - Inform user about next cycle
   - The next `/speckit.implement` invocation will start the next cycle

b. **If all cycles complete**:
   ```text
   All implementation cycles complete!

   PR Status:
   - base (Phase 1+2): PR #N → spec/#ticket-feature
   - us1 (Phase 3): PR #N → feature/#ticket-base-feature
   - us2 (Phase 4): PR #N → feature/#ticket-us1-feature

   Next: Merge PRs in order (base → us1 → us2).
   ```

---

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
