---
description: Analyze the current session to extract learnings, identify automation opportunities, and suggest improvements
---

## User Input

```text
$ARGUMENTS
```

## Overview

Session Review는 현재 세션을 분석하여 학습 내용을 추출하고, 자동화 기회를 식별하며, speckit/rule 개선점을 제안합니다.

## Execution Flow

### Phase 1: Parallel Analysis

다음 에이전트들을 **병렬**로 실행합니다:

1. **pattern-automator** (`.cursor/agents/pattern-automator.md`)
   - Skill/Rule/Agent/Command 자동화 기회 탐지
   - 반복 패턴 식별

2. **learn** (`.cursor/agents/learn.md`)
   - 학습/실수/발견/베스트 프랙티스 추출
   - 재사용 가능한 인사이트 정리

3. **followup** (`.cursor/agents/followup.md`)
   - 미완성 작업, 기술 부채, 다음 우선순위 식별
   - TODO/FIXME 스캔

4. **spec-kit-updater** (`.cursor/agents/spec-kit-updater.md`)
   - speckit.* 커맨드 개선점 제안
   - 템플릿 및 스크립트 개선

### Phase 2: Duplicate Verification

Phase 1 결과를 수집하여 **duplicate-checker** 에이전트 실행:

- `.cursor/agents/duplicate-checker.md`
- 기존 자산과의 중복 검증
- 각 제안을 duplicate/conflict/extension/novel로 분류

### Phase 2b: Storage Level Decision

AskUserQuestion으로 저장 레벨을 선택 요청:

**질문**: "결과물을 어디에 저장할까요?"

**옵션**:
1. **"프로젝트 레벨"** — `.cursor/memory/session-learnings/`, `.cursor/memory/session-reviews/` (git 추적, 팀 공유)
2. **"로컬 레벨"** — `.cursor/memory/session-learnings.local/`, `.cursor/memory/session-reviews.local/` (gitignore, 개인 보관)

### Phase 3: User Decision

AskUserQuestion으로 사용자에게 액션 선택 요청:

**질문**: "세션 리뷰 결과를 어떻게 처리할까요?"

**옵션**:
1. **"모든 제안 적용 후 커밋"** - novel/extension 모두 적용
2. **"항목별 선택하기"** - 각 제안별로 적용 여부 결정
3. **"리포트만 저장"** - `.cursor/memory/session-reviews[.local]/`에 저장
4. **"학습만 커밋"** - learn 에이전트 결과만 저장 및 커밋

### Phase 4: Apply Actions

사용자 선택에 따라:

#### "모든 제안 적용" 선택 시
1. novel/extension으로 분류된 모든 제안 적용
2. 새 파일 생성 또는 기존 파일 수정
3. 학습 내용을 `.cursor/memory/session-learnings.local/` 에 저장
4. 변경사항 커밋

#### "항목별 선택" 선택 시
1. 각 제안에 대해 적용 여부 확인
2. 선택된 항목만 적용
3. 변경사항 커밋

#### "리포트만 저장" 선택 시
1. 전체 분석 결과를 `.cursor/memory/session-reviews.local/YYYY-MM-DD-review.md` 로 저장
2. 커밋 없이 종료

#### "학습만 커밋" 선택 시
1. learn 에이전트 결과를 `.cursor/memory/session-learnings.local/YYYY-MM-DD-[category].md` 로 저장
2. 학습 파일만 커밋

## Output Locations

| 유형 | 저장 위치 | 파일명 패턴 |
|------|----------|------------|
| 학습 내용 | `.cursor/memory/session-learnings.local/` | `YYYY-MM-DD-category.md` |
| 리뷰 리포트 | `.cursor/memory/session-reviews.local/` 또는 `.cursor/memory/session-reviews/` | `YYYY-MM-DD-review.md` |
| 새 자동화 | `.cursor/commands/` 또는 `.cursor/rules/` 등 | 타입별 적절한 위치 |

## Commit Message Format

```
docs(session): add session learnings from YYYY-MM-DD

- Added N learnings (mistakes: X, discoveries: Y, best-practices: Z)
- Created N new automations
- Updated N existing files

Co-Authored-By: Claude Opus 4 <noreply@anthropic.com>
```

## Agent Invocation

```yaml
# Phase 1 - Parallel execution
Task (subagent_type: general-purpose):
  - prompt: "Read .cursor/agents/pattern-automator.md and analyze this session..."
  - prompt: "Read .cursor/agents/learn.md and analyze this session..."
  - prompt: "Read .cursor/agents/followup.md and analyze this session..."
  - prompt: "Read .cursor/agents/spec-kit-updater.md and analyze this session..."

# Phase 2 - Sequential (needs Phase 1 results)
Task (subagent_type: general-purpose):
  - prompt: "Read .cursor/agents/duplicate-checker.md and verify these suggestions..."
```

## Notes

- 이 커맨드는 세션 마무리 시 수동으로 실행합니다
- 모든 결과는 `.local/` 디렉토리에 저장되어 git에서 추적되지 않습니다
- 적용할 변경사항만 git에 커밋됩니다
- 메모리/히스토리 정리는 별도 커맨드 `/user:save-memory`로 실행합니다 (유저 레벨)
