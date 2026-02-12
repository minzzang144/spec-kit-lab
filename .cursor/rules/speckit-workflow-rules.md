# SpecKit Workflow Rules

**CRITICAL: Strict Phase-Based Development Workflow Rules**

This document defines the absolute boundaries and rules for each phase of the SpecKit workflow system. These rules MUST be followed without exception to maintain workflow integrity and prevent implementation violations.

---

# 🔥 CRITICAL EXECUTION RULES

## ⚡ ONE TASK = ONE COMMIT PROTOCOL

**ENFORCEMENT LEVEL: BLOCKING** - Violations HALT execution immediately

### The Golden Rule
```
🚫 NEVER batch multiple tasks into single commit
✅ ALWAYS commit after EACH task completion
🛑 STOP and commit before proceeding to next task
```

### Mandatory Execution Sequence
```
FOR EACH TASK:
1. ✅ Execute ONE task implementation
2. ✅ Verify functionality (build/test if applicable)
3. ✅ Update TodoWrite: mark task as "completed"
4. ✅ Mark task as [x] in tasks.md (specs/*/tasks.md)
5. ✅ Git add all changed files (구현 파일 + tasks.md 포함)
6. ✅ Git commit with proper message format
7. ✅ Verify commit was successful
8. ✅ ONLY THEN start next task
```

### Commit Message Format (REQUIRED)
```
<type>(<scope>): <description>

- Specific implementation details
- Files modified and why
- Build/test status if applicable

Relates to T### [US#]

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>
```

## 🆘 CONTEXT LOSS RECOVERY PROTOCOL

**When resuming after context loss** - READ THIS FIRST:
1. ✅ Re-read these CRITICAL EXECUTION RULES
2. ✅ Check current TodoWrite status
3. ✅ Identify any uncommitted work
4. ✅ Commit any completed but uncommitted tasks separately
5. ✅ Resume with strict "One Task = One Commit" protocol

**NO EXCUSES**: Context loss does NOT exempt from commit protocol.

---

# 📋 WORKFLOW PHASE OVERVIEW

The SpecKit system enforces a strict sequential workflow with clear phase boundaries:

```
specify → clarify → plan → tasks → implement → analyze
   ↓         ↓        ↓       ↓         ↓        ↓
 문서화    명확화    설계    분해      구현     검증
```

## Core Principles

### 1. Sequential Phase Execution
- **NEVER skip phases** - Each phase must be completed before proceeding
- **NEVER backtrack** - Once a phase is complete, use `speckit.analyze` for validation
- **NEVER mix responsibilities** - Each phase has distinct, non-overlapping purposes

### 2. Phase Isolation
- Each phase has specific **allowed tools** and **forbidden actions**
- Violations must trigger immediate **STOP** and user clarification
- Implementation artifacts can **ONLY** be created during `implement` phase

### 3. User Control Gates
- Each phase requires **explicit user approval** before proceeding
- No autonomous phase transitions allowed
- User must explicitly run the next `speckit.*` command

## Detailed Phase Rules

### 🔍 `speckit.specify` - Specification Phase

**Purpose**: Create comprehensive, technology-agnostic feature specifications

**ALLOWED Actions**:
- ✅ Read existing files for context (`Read`, `Glob`, `Grep`)
- ✅ Create/update `spec.md` only
- ✅ Generate user stories and acceptance criteria
- ✅ Define business requirements and constraints

**FORBIDDEN Actions**:
- ❌ Create any implementation files
- ❌ Make technology choices
- ❌ Write code or configuration files
- ❌ Use `Bash` for implementation commands
- ❌ Create `package.json`, `tsconfig.json`, etc.

**Output**: `spec.md` - Technology-agnostic specification document

---

### 🎯 `speckit.clarify` - Clarification Phase

**Purpose**: Identify and resolve specification ambiguities

**ALLOWED Actions**:
- ✅ Read specification files
- ✅ Ask targeted clarification questions
- ✅ Update `spec.md` with clarifications
- ✅ Generate clarification reports

**FORBIDDEN Actions**:
- ❌ Make implementation decisions
- ❌ Create technical plans
- ❌ Choose technologies or frameworks
- ❌ Create any implementation artifacts

**Output**: Updated `spec.md` with resolved ambiguities

---

### 📋 `speckit.plan` - Planning Phase

**Purpose**: Create technical implementation plans and research

**ALLOWED Actions**:
- ✅ Read specification and existing codebase (`Read`, `Glob`, `Grep`)
- ✅ Research technologies and patterns
- ✅ Create `plan.md`, `research.md`, `data-model.md`
- ✅ Design system architecture
- ✅ Plan component structures and interactions
- ✅ Define technical approach and decisions

**FORBIDDEN Actions**:
- ❌ **NEVER create actual implementation files**
- ❌ **NEVER write production code**
- ❌ **NEVER use `Write` or `Edit` on implementation files**
- ❌ **NEVER create `package.json`, config files, or source code**
- ❌ **NEVER run implementation commands via `Bash`**
- ❌ Install dependencies or set up development environment

**Critical Rule**: This phase is **PLANNING ONLY**. Any attempt to create actual implementation files is a VIOLATION.

**Output**: `plan.md`, `research.md`, `data-model.md` - Planning documents only

---

### 📝 `speckit.tasks` - Task Generation Phase

**Purpose**: Break down implementation plan into actionable development tasks

**ALLOWED Actions**:
- ✅ Read plan and specification documents
- ✅ Create `tasks.md` with prioritized task list
- ✅ Define task dependencies and order
- ✅ Estimate task complexity
- ✅ Create implementation checklists

**FORBIDDEN Actions**:
- ❌ **NEVER implement the actual tasks**
- ❌ **NEVER create implementation files**
- ❌ **NEVER start coding or development**
- ❌ Execute any of the defined tasks

**Critical Rule**: This phase **ONLY PLANS** the implementation work. The tasks are NOT executed here.

**🎯 Task Design Requirements for Atomic Commits**:
- **MANDATORY**: Each task MUST be independently committable
- **MANDATORY**: Each task MUST leave the system in a buildable state
- **MANDATORY**: Tasks affecting the same file MUST be sequential (not parallel)
- **MANDATORY**: Complex features MUST be broken into atomic, logical commits

**Parallel Task Grouping Strategy**:
- Group parallel tasks that can run simultaneously without conflicts
- Mark all parallel tasks with `[P]` prefix
- Ensure parallel tasks operate on different files/areas
- Example proper grouping:
  ```
  Sequential Group (same file):
  - T001 Create package.json structure
  - T002 Add dependencies to package.json
  - T003 Add scripts to package.json

  Parallel Group (different files):
  - T004 [P] Create .eslintrc.js
  - T005 [P] Create .prettierrc.js
  - T006 [P] Create tsconfig.json
  ```

**Output**: `tasks.md` - Prioritized task breakdown designed for atomic commits

---

### ⚙️ `speckit.implement` - Implementation Phase

**Purpose**: Execute the planned tasks and create implementation artifacts

**ALLOWED Actions**:
- ✅ **NOW you can create files, write code, and implement**
- ✅ Use `Write`, `Edit`, `Bash` for actual implementation
- ✅ Create source code files
- ✅ Create configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Install dependencies and set up development environment
- ✅ Run tests and build processes
- ✅ Follow the tasks defined in previous phase

**Critical Rule**: This is the **ONLY** phase where implementation artifacts can be created.

**🚨 MANDATORY EXECUTION PROTOCOL** - Referenced from CRITICAL EXECUTION RULES above:

1. **Pre-Implementation Checklist**:
   - [ ] Have I read the "ONE TASK = ONE COMMIT PROTOCOL" at the top of this file?
   - [ ] Do I understand that each task requires immediate commit?
   - [ ] Have I planned commit strategy for each task?

2. **Per-Task Execution Sequence** (ENFORCED):
   ```
   FOR EACH TASK:
   1. ✅ Execute ONE task implementation
   2. ✅ Verify functionality (build/test if applicable)
   3. ✅ Update TodoWrite: mark task as "completed"
   4. ✅ Git add all changed files
   5. ✅ Git commit with proper message format
   6. ✅ Verify commit was successful
   7. ✅ ONLY THEN start next task
   ```

3. **Violation Response**:
   - If attempting to batch tasks: **HALT immediately**
   - If skipping commits: **STOP and commit current task**
   - If unsure about commit boundary: **ASK user for clarification**

**Output**: Complete implemented feature with all necessary files and configurations, with each task properly committed

---

### 🔍 `speckit.analyze` - Analysis Phase

**Purpose**: Validate consistency across specification, plan, tasks, and implementation

**ALLOWED Actions**:
- ✅ Read all workflow artifacts
- ✅ Perform cross-artifact consistency checks
- ✅ Validate implementation against specification
- ✅ Generate analysis reports
- ✅ Identify discrepancies and gaps

**FORBIDDEN Actions**:
- ❌ Make changes to implementation
- ❌ Create new features or modify existing code
- ❌ Fix implementation issues (use `speckit.implement` for fixes)

**Output**: Analysis report with consistency validation

---

### 📋 `speckit.checklist` - Checklist Generation

**Purpose**: Generate domain-specific quality checklists

**ALLOWED Actions**:
- ✅ Create quality assurance checklists
- ✅ Generate testing checklists
- ✅ Create deployment checklists
- ✅ Define acceptance criteria checklists

**FORBIDDEN Actions**:
- ❌ Execute checklist items
- ❌ Perform actual testing or deployment

---

### 🔄 `speckit.taskstoissues` - Issue Conversion

**Purpose**: Convert tasks to GitHub issues

**ALLOWED Actions**:
- ✅ Read tasks.md
- ✅ Create GitHub issues from tasks
- ✅ Set up project boards and labels
- ✅ Assign tasks to team members

**FORBIDDEN Actions**:
- ❌ Implement the tasks
- ❌ Start development work

---

### ⚖️ `speckit.constitution` - Constitution Management

**Purpose**: Manage project constitution and principles

**ALLOWED Actions**:
- ✅ Create/update constitution files
- ✅ Define project principles
- ✅ Set coding standards and guidelines
- ✅ Establish workflow rules

**FORBIDDEN Actions**:
- ❌ Make implementation changes to enforce constitution
- ❌ Refactor existing code

## Tool Usage Restrictions

### Read-Only Tools (Analysis Phase Commands)
**Commands**: `specify`, `clarify`, `plan`, `analyze`, `checklist`, `taskstoissues`, `constitution`

**Allowed Tools**:
- ✅ `Read` - Read existing files
- ✅ `Glob` - Find files by patterns
- ✅ `Grep` - Search file contents
- ✅ 사용자에게 질문하여 요구사항 명확화

**Forbidden Tools**:
- ❌ `Write` - Create new files
- ❌ `Edit` - Modify existing files
- ❌ `Bash` - Execute implementation commands

### Implementation Tools (Implementation Phase Only)
**Commands**: `implement` ONLY

**Allowed Tools**:
- ✅ `Write` - Create implementation files
- ✅ `Edit` - Modify implementation files
- ✅ `Bash` - Execute implementation commands
- ✅ `Read`, `Glob`, `Grep` - For analysis
- ✅ All other tools necessary for implementation

## Violation Detection and Prevention

### Pre-Action Checks

Before using any tool, perform these checks:

1. **Tool Appropriateness Check**:
   ```
   IF current_phase IN ['specify', 'clarify', 'plan', 'analyze', 'checklist', 'taskstoissues', 'constitution']
   AND tool_to_use IN ['Write', 'Edit', 'Bash']:
     STOP IMMEDIATELY
     ASK USER FOR CLARIFICATION
   ```

2. **File Creation Check**:
   ```
   IF about_to_create_implementation_file
   AND current_phase != 'implement':
     STOP IMMEDIATELY
     EXPLAIN VIOLATION
     ASK USER FOR EXPLICIT APPROVAL
   ```

3. **Command Execution Check**:
   ```
   IF about_to_run_bash_command
   AND current_phase != 'implement'
   AND command_is_implementation_related:
     STOP IMMEDIATELY
     EXPLAIN PHASE RESTRICTION
   ```

### Self-Monitoring Protocol

At the end of each action, perform this self-check:

```
DID I:
- Stay within my current phase boundaries?
- Use only allowed tools for this phase?
- Avoid creating implementation artifacts outside implement phase?
- Ask for user clarification when unsure?

IF ANY ANSWER IS NO: Report violation and ask for guidance
```

## Violation Examples and Corrections

### ❌ WRONG: Planning Phase Implementation
```
# During speckit.plan
Write: package.json with dependencies
Edit: Create component files
Bash: npm install
```

### ✅ CORRECT: Planning Phase Documentation
```
# During speckit.plan
Write: plan.md describing package.json structure
Write: research.md comparing dependency options
Write: data-model.md defining component interfaces
```

### ❌ WRONG: Task Phase Execution
```
# During speckit.tasks
Write: Implement UserService class
Edit: Add authentication logic
```

### ✅ CORRECT: Task Phase Planning
```
# During speckit.tasks
Write: tasks.md with task "Create UserService class with authentication"
```

## Recovery Procedures

### When Violation is Detected

1. **IMMEDIATE STOP**: Halt current action
2. **ACKNOWLEDGE**: "I've detected a workflow violation"
3. **EXPLAIN**: Describe what was about to happen and why it's prohibited
4. **CLARIFY**: Ask user if they want to:
   - Continue with current phase restrictions
   - Move to appropriate phase for the action
   - Modify the approach to comply with current phase

### User Override Protocol

If user explicitly requests phase violation:
1. **WARN**: Explain potential consequences
2. **CONFIRM**: Get explicit written confirmation
3. **DOCUMENT**: Note the override in output
4. **PROCEED**: Only with explicit user approval

## Emergency Procedures

### Critical System Protection

If system integrity is threatened:
1. **IMMEDIATE HALT**: Stop all operations
2. **ESCALATE**: Inform user of critical issue
3. **SAFEGUARD**: Prevent any destructive actions
4. **AWAIT GUIDANCE**: Do not proceed without explicit instructions

## Compliance Verification

### Daily Self-Assessment

Before starting any SpecKit command:
- Review current phase requirements
- Confirm tool usage restrictions
- Verify user approval for phase progression
- Check for any pending violations

### Weekly Audit

Review recent SpecKit usage for:
- Phase boundary violations
- Unauthorized tool usage
- Implementation artifacts created outside implement phase
- User override documentation

## Rule Updates and Maintenance

### Version Control
- All rule changes must be versioned
- Changes require user approval
- Rules apply to both `.claude/rules/` and `.cursor/rules/`

### Synchronization
- Rules must be identical in both directories
- Any updates must be applied to both locations
- Regular sync verification required

---

**Remember: These rules exist to maintain workflow integrity, prevent implementation violations, and ensure user control over the development process. When in doubt, STOP and ask for clarification rather than risk a violation.**