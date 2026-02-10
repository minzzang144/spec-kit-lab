---
description: Analyze the current session to extract learnings, identify automation opportunities, and suggest improvements
---

# Session Review

세션을 분석하여 학습 내용을 추출하고, 자동화 기회를 식별하며, 프로젝트 개선점을 제안합니다.

## Arguments

- **Empty/Default**: 기본 4개 에이전트 실행 (session-updater, pattern-automator, learn, followup)
- **`--speckit`**: SpecKit 커맨드 개선 에이전트 추가 실행

## Execution Flow

### Phase 1: Parallel Analysis

다음 에이전트들을 **병렬**로 실행합니다:

#### 기본 에이전트 (항상 실행)

1. **session-updater** (`.cursor/agents/session-updater.md`)
   - 프로젝트 규칙, rules 개선점 제안
   - 프로젝트 문서화 갭 식별

2. **pattern-automator** (`.cursor/agents/pattern-automator.md`)
   - Skill/Rule/Agent/Command 자동화 기회 탐지
   - 반복 패턴 식별

3. **learn** (`.cursor/agents/learn.md`)
   - 학습/실수/발견/베스트 프랙티스 추출
   - 재사용 가능한 인사이트 정리

4. **followup** (`.cursor/agents/followup.md`)
   - 미완성 작업, 기술 부채, 다음 우선순위 식별
   - TODO/FIXME 스캔

#### 조건부 에이전트

5. **spec-kit-updater** (`.cursor/agents/spec-kit-updater.md`)
   - **조건**: `--speckit` 인자가 있는 경우
   - speckit.* 커맨드 개선점 제안
   - 템플릿 및 스크립트 개선

### Phase 2: Duplicate Verification

Phase 1 결과를 수집하여 **duplicate-checker** 에이전트 실행:

- `.cursor/agents/duplicate-checker.md`
- 기존 자산과의 중복 검증
- 각 제안을 duplicate/conflict/extension/novel로 분류

### Phase 3: User Decision

사용자에게 액션 선택 요청:

**질문**: "세션 리뷰 결과를 어떻게 처리할까요?"

**옵션**:
1. **"모든 제안 적용 후 커밋"** - novel/extension 모두 적용
2. **"항목별 선택하기"** - 각 제안별로 적용 여부 결정
3. **"리포트만 저장"** - `.specify/memory/session-reviews.local/`에 저장
4. **"학습만 커밋"** - learn 에이전트 결과만 저장 및 커밋

### Phase 4: Apply Actions

사용자 선택에 따라:

#### "모든 제안 적용" 선택 시
1. novel/extension으로 분류된 모든 제안 적용
2. 새 파일 생성 또는 기존 파일 수정
3. 학습 내용을 `.specify/memory/session-learnings.local/` 에 저장
4. 변경사항 커밋

#### "항목별 선택" 선택 시
1. 각 제안에 대해 적용 여부 확인
2. 선택된 항목만 적용
3. 변경사항 커밋

#### "리포트만 저장" 선택 시
1. 전체 분석 결과를 `.specify/memory/session-reviews.local/YYYY-MM-DD-review.md` 로 저장
2. 커밋 없이 종료

#### "학습만 커밋" 선택 시
1. learn 에이전트 결과를 `.specify/memory/session-learnings.local/YYYY-MM-DD-[category].md` 로 저장
2. 학습 파일만 커밋

## Output Locations

| 유형 | 저장 위치 | 파일명 패턴 |
|------|----------|------------|
| 학습 내용 | `.specify/memory/session-learnings.local/` | `YYYY-MM-DD-category.md` |
| 리뷰 리포트 | `.specify/memory/session-reviews.local/` | `YYYY-MM-DD-review.md` |
| 새 자동화 | `.cursor/commands/` 또는 `.cursor/rules/` 등 | 타입별 적절한 위치 |

## Commit Message Format

```
docs(session): add session learnings from YYYY-MM-DD

- Added N learnings (mistakes: X, discoveries: Y, best-practices: Z)
- Created N new automations
- Updated N existing files
```

## Notes

- 모든 결과는 `.local/` 디렉토리에 저장되어 git에서 추적되지 않습니다
- 적용할 변경사항만 git에 커밋됩니다
