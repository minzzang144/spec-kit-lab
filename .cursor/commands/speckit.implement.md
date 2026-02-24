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

### Step 6b: Implementation Summary (MANDATORY)

After all tasks for the current cycle are complete, display a summary **before** code review.
Format the summary using the project's architecture structure (e.g., FSD layers, NestJS modules, domain folders, etc.):

```text
## [cycle] 구현 완료 요약

### 변경 범위
[프로젝트 아키텍처 구조에 맞게 변경 사항을 트리 형태로 정리]
예시 (FSD):
  Entities/ → ...
  Features/ → ...
예시 (NestJS):
  modules/user/ → ...
  modules/auth/ → ...
예시 (일반):
  src/components/ → ...
  src/services/ → ...

### 적용된 패턴
- [이번 사이클에서 적용된 주요 아키텍처/디자인 패턴]

검증: [프로젝트 검증 명령어 결과 — type-check, lint, test, build 등]
```

### Step 6c: Previous Cycle Fix Protocol

If during implementation you discover issues in previous cycles:

1. **현재 사이클에 영향 있는가?**
   - **YES (작은 수정)**: Fix Forward — 현재 브랜치에서 수정하고, 커밋 메시지에 `fix: [이전 사이클 수정]` 명시. PR "이전 사이클 수정 사항" 섹션에 기록.
   - **YES (아키텍처 수정)**: Fix Forward — 현재 브랜치에서 수정하고, PR "개발자 검토 요청"에 이유와 수정 내용을 상세히 명시.
   - **NO (현재 사이클에 영향 없음)**: 현재 사이클 계속 진행. PR "TODO" 섹션에 메모만 남기기.

2. **커밋 시**: 이전 사이클 수정은 별도 커밋으로 분리 (`fix(<scope>): correct [issue] from [previous cycle]`)

### Step 7: Code Review (Per Cycle)

After completing all tasks for the current cycle:

a. **Announce**: "[cycle] 사이클 구현이 완료되었습니다. 코드 리뷰를 진행합니다."

b. **Run code review**: Execute `/everything-claude-code:code-review` skill
   - **NEVER skip code review** — 테스트 코드, E2E, 설정 파일도 리뷰 대상이다. "변경이 적다"는 이유로 생략하지 않는다.
   - If unavailable, inform user with installation instructions:
     ```
     code-review 스킬을 사용할 수 없습니다.
     설치: claude mcp add everything-claude-code -- npx -y @anthropic-ai/claude-code-mcp@latest
     ```

c. **Display review summary to user** (MANDATORY):
   Show a concise table of findings so user can see what was reviewed:

   ```text
   ## 코드 리뷰 결과

   | 심각도 | 건수 | 내용 요약 |
   |--------|------|----------|
   | CRITICAL | 0 | - |
   | HIGH | N | [구체적 이슈 설명] |
   | MEDIUM | N | [구체적 이슈 설명] |
   | LOW | N | [구체적 이슈 설명] |

   수정 대상: [수정할 이슈 목록]
   ```

d. **Address findings**:
   - Critical/High: Fix before proceeding
   - Medium/Low: Document or fix if time permits

e. **Commit review fixes** separately:
   - `fix(<scope>): address code review feedback for [cycle]`

### Step 8: Push, Confirm, Create PR, and PR Review (Per Cycle)

a. **Run verification suite**:
   ```bash
   pnpm --filter [app-name] run type-check
   pnpm --filter [app-name] run lint
   pnpm --filter [app-name] run test
   ```
   Report results. Fix any failures before proceeding.

b. **Push current branch**:
   ```bash
   git push -u origin [current-branch]
   ```

c. **Ask user for PR creation** (MANDATORY):
   Use `AskUserQuestion` to confirm before creating PR:

   ```text
   [cycle] 사이클 작업이 완료되었습니다.
   - 커밋: N개
   - 파일 변경: N개
   - 테스트: N/N 통과

   PR을 생성할까요?
   ```

   Options: "PR 생성", "추가 수정 후 PR 생성", "PR 없이 다음 사이클로"

d. **Create PR with Stacked PR pattern** (한국어 본문):

   The PR base is determined by the cycle (from Step 2 table):
   - `base` → base: `spec/#ticket-feature`
   - `us1` → base: `feature/#ticket-base-feature`
   - `us2` → base: `feature/#ticket-us1-feature`

   ```bash
   gh pr create --base [pr-base-branch] --title "<type>(<scope>): <한국어 제목>" --body "$(cat <<'EOF'
   ## 요약
   [이 사이클에서 구현한 내용 요약 — 한국어]

   ## 사이클 정보
   - **사이클**: [base|us1|us2|...]
   - **Phase**: [Phase 번호와 제목]
   - **기반 브랜치**: [PR base branch]

   ## 주요 변경 사항
   [완료된 태스크와 핵심 변경 사항 목록 — 한국어]

   ## 개발자 검토 요청
   AI 코드 리뷰는 컨벤션, 타입 안전성, 테스트 커버리지를 검증했습니다.
   아래는 **맥락과 판단이 필요한 영역**으로, 개발자의 승인이 필요합니다.

   ### 책임과 경계
   - [ ] [모듈/컴포넌트의 책임 범위가 적절한지 검토 항목]

   ### 장기 변경 비용
   - [ ] [현재 구조가 향후 요구사항 변경에 유연한지 검토 항목]

   ### 추상화 수준
   - [ ] [과도하거나 부족한 추상화가 없는지 검토 항목]

   ### 비즈니스 맥락
   - [ ] [도메인 관점에서 UX 흐름이 자연스러운지 검토 항목]

   ## 이전 사이클 수정 사항
   [이전 사이클에서 발견된 이슈를 현재 사이클에서 Fix Forward한 경우 기록]
   - 해당 없으면 "없음" 으로 표기

   ## TODO (다음 사이클에서 검토)
   [현재 사이클에 영향 없지만 추후 검토가 필요한 사항 메모]
   - 해당 없으면 "없음" 으로 표기

   ## 테스트 계획
   - [ ] 단위 테스트 통과
   - [ ] 통합 테스트 통과
   - [ ] 수동 테스트 완료

   ## 코드 리뷰
   - [x] 사이클 코드 리뷰 완료
   - [ ] PR 리뷰 완료

   Generated with [Claude Code](https://claude.ai/code) using SpecKit workflow
   EOF
   )"
   ```

e. **Run PR review AFTER PR creation**:
   Execute `/pr-review-toolkit:review-pr` skill with the created PR number
   - If unavailable, use `/everything-claude-code:code-review` as fallback
   - Display PR review results to user (same format as Step 7c)

f. **Fix Critical/High issues** from PR review:
   - Commit fixes → push → update PR checkbox "PR 리뷰 완료"
   - If no issues found, update checkbox automatically

g. **Report cycle completion**:
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
