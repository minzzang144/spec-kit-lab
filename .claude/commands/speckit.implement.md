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

1. **Check current branch and create/switch to feature branch**:

   a. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` to get current branch info.

   b. **If on `spec/#ticket-*` branch** (specification phase):
      - You need to create or switch to a feature branch before implementation.
      - **ASK user for implementation mode** using AskUserQuestion:
        - Question: "어떤 모드로 구현을 진행할까요?"
        - Header: "구현 모드"
        - Options:
          1. Label: "단일 모드 (Single Mode)", Description: "하나의 feature 브랜치에서 모든 작업. 작은 기능, 1-2 User Story, 한 사람 작업에 적합"
          2. Label: "병렬 모드 (Parallel Mode)", Description: "User Story별로 브랜치 분리. 큰 기능, 3+ User Story, 팀 협업 또는 단계별 PR 리뷰에 적합"

      - Based on user choice, create feature branch:
        - **단일 모드**: Run `.specify/scripts/bash/create-feature-branch.sh --json --mode single`
        - **병렬 모드**: Run `.specify/scripts/bash/create-feature-branch.sh --json --mode parallel`

      - The script will create the branch(es) and switch to the feature branch (single mode) or stay on spec (parallel mode).

      - **For parallel mode**: After foundation tasks (Phase 1-2), ask which User Story to work on:
        - Use AskUserQuestion with available User Story options from `tasks.md`
        - Then checkout that specific branch: `git checkout feature/#ticket-usN-feature-name`

   c. **If already on `feature/#ticket-*` branch** (implementation phase):
      - Already on a feature branch, continue with implementation.
      - Parse FEATURE_DIR from the feature branch (maps to same specs directory as spec branch).

   d. **IMPORTANT**: Spec files (spec.md, plan.md, tasks.md, etc.) remain in `specs/#ticket-feature-name/` directory.
      Both spec and feature branches read from the same specs directory.

2. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

   **Note**: This script now supports both:
   - `spec/#ticket-*` branches (specification phase)
   - `feature/#ticket-*` branches (implementation phase)

   Both map to the same `specs/#ticket-*/` directory for reading design documents.

3. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

4. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

5. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

6. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

7. Execute implementation following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

   **🔍 Code Review Checkpoint (Per User Story)**:
   After completing each User Story phase (e.g., Phase 3: US1, Phase 4: US2, Phase 5: US3):

   a. **Announce completion**: "User Story [N] 구현이 완료되었습니다. 코드 리뷰를 진행합니다."

   b. **Run code review**: Execute `/everything-claude-code:code-review` skill
      - If the skill is not available (command fails), inform the user:
        ```
        ⚠️ code-review 스킬을 사용할 수 없습니다.
        다음 명령어로 everything-claude-code 플러그인을 설치해주세요:

        claude mcp add everything-claude-code -- npx -y @anthropic-ai/claude-code-mcp@latest

        설치 후 다시 시도하거나, 수동으로 코드를 리뷰해주세요.
        ```
      - Wait for user to confirm installation and retry, or skip review

   c. **Address findings**: If review identifies issues:
      - Critical/High issues: Fix before proceeding to next User Story
      - Medium/Low issues: Document for later or fix if time permits

   d. **Commit review fixes**: Any fixes from code review should be committed separately:
      - Commit message format: `fix(<scope>): address code review feedback for US[N]`

8. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

9. Progress tracking and error handling:
   - Report progress after each completed task
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed
   - **IMPORTANT: tasks.md 체크박스는 구현 코드와 같은 커밋에 포함**해야 한다. 각 태스크 완료 시 다음 순서를 따른다:
     1. 태스크 구현 완료
     2. tasks.md에서 해당 태스크를 `[x]`로 체크
     3. 구현 파일 **+ tasks.md**를 함께 `git add`
     4. 하나의 커밋으로 커밋

10. Completion validation:
    - Verify all required tasks are completed
    - Check that implemented features match the original specification
    - Validate that tests pass and coverage meets requirements
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work

11. **🔍 PR Review (Pre-PR Quality Gate)**:

    After all implementation is complete and validated:

    a. **Announce PR review**: "모든 구현이 완료되었습니다. PR 생성 전 종합 리뷰를 진행합니다."

    b. **Run comprehensive PR review**: Execute `/pr-review-toolkit:review-pr` skill
       - If the skill is not available (command fails), inform the user:
         ```
         ⚠️ pr-review-toolkit 스킬을 사용할 수 없습니다.
         다음 명령어로 pr-review-toolkit 플러그인을 설치해주세요:

         claude mcp add pr-review-toolkit -- npx -y @anthropic-ai/pr-review-toolkit-mcp@latest

         설치 후 다시 시도하거나, 기본 코드 리뷰로 대체할 수 있습니다.
         ```
       - If plugin unavailable, offer alternative: Run `/everything-claude-code:code-review` on full changeset

    c. **Review findings**: The PR review provides multi-agent analysis covering:
       - Code quality and standards compliance
       - Security vulnerabilities
       - Performance issues
       - Test coverage gaps

    d. **Address critical issues**: Fix any Critical/High severity issues before PR creation

12. **📤 PR Creation**:

    a. **Determine base branch**:
       - **IMPORTANT**: Base branch is NOT always `develop`!
       - Parse the original spec branch from which feature branch was created
       - Run: `git log --oneline --decorate | head -20` to identify branch relationships
       - Or check: The spec branch pattern `spec/#ticket-*` should be the base for feature branches
       - **Default hierarchy**:
         - `feature/#ticket-*` → base: `spec/#ticket-*` (same ticket)
         - `spec/#ticket-*` → base: `develop` or `main` (depends on project)

    b. **Ask user for base branch confirmation** using AskUserQuestion:
       - Question: "PR의 base 브랜치를 확인해주세요."
       - Header: "Base 브랜치"
       - Options:
         1. Label: "[detected-base-branch]", Description: "자동 감지된 브랜치 (권장)"
         2. Label: "develop", Description: "develop 브랜치로 병합"
         3. Label: "main", Description: "main 브랜치로 병합"
         4. (Option to enter custom branch via "Other")

    c. **Push and create PR**:
       - Push current branch: `git push -u origin [current-branch]`
       - Create PR with detailed description:
         ```bash
         gh pr create --base [base-branch] --title "[PR title]" --body "$(cat <<'EOF'
         ## Summary
         [Brief description of changes from tasks.md]

         ## Changes
         [List of completed User Stories and key changes]

         ## Test Plan
         - [ ] Unit tests pass
         - [ ] Integration tests pass
         - [ ] E2E tests pass (if applicable)
         - [ ] Manual testing completed

         ## Code Review
         - [x] Per-User-Story code review completed
         - [x] Pre-PR comprehensive review completed

         🤖 Generated with [Claude Code](https://claude.ai/code) using SpecKit workflow
         EOF
         )"
         ```

    d. **Post review summary to PR** (optional):
       - If comprehensive review was performed, post summary as PR comment:
         ```bash
         gh pr comment [PR_NUMBER] --body "[Review summary from step 11]"
         ```

    e. **Report completion**:
       - Display PR URL
       - Summarize: tasks completed, review status, any remaining items

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
