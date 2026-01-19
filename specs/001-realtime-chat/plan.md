# Implementation Plan: 간단한 실시간 채팅 앱

**Branch**: `001-realtime-chat` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-realtime-chat/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

닉네임(입력/랜덤)→채팅방 생성·입장→메시지 실시간 송수신·나가기·빈 방 즉시 삭제를 제공하는 실험용 채팅 앱. **모노레포(pnpm + Turborepo)** 에서 **FE(Vite+React, Socket.IO, TanStack Query, shadcn/ui)** 와 **BE(NestJS, Socket.IO Gateway)** 를 분리하고, 실시간 통신은 Socket.IO, 방·메시지는 **In-memory** 로만** 유지한다.

## Technical Context

<!--
  Parsed by update-agent-context.sh: Language/Version, Primary Dependencies, Storage, Project Type
  Must be single-line each for extraction.
-->

**Language/Version**: TypeScript 5.x (FE, BE)
**Primary Dependencies**: NestJS (BE), Vite+React, Socket.IO, TanStack Query, React Hook Form, Tailwind, shadcn/ui (FE)
**Storage**: In-memory (실험용; DB/Redis 범위 외)
**Testing**: Vitest, Playwright (FE), Jest (BE, NestJS 기본)
**Target Platform**: Web (browser), Node.js (BE)
**Project Type**: web (monorepo)
**Performance Goals**: SC-001~004 (닉네임→목록 30초, 생성→첫 메시지 1분, 메시지 수신 3초, 방 삭제 반영 1분)
**Constraints**: 실험용, rate limit·인증·DB 없음, 메시지 최대 길이·빈 메시지 거부
**Scale/Scope**: 소규모 실험, 단일 BE 인스턴스

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Post-Phase 1 (2025-01-27)**: data-model, contracts, quickstart 완료. 설계·계약이 Constitution 원칙(가독성, 예측 가능성, 응집·결합, FSD)과 배치되지 않음. FE는 `app`→`pages`→`widgets`→`features`→`entities`→`shared` 계층, BE는 Nest 모듈(chat, rooms)·Store 분리. 구현 시 위 체크리스트 적용.

**Readability (I)**:

- [ ] Magic numbers replaced with named constants
- [ ] Complex logic abstracted into dedicated components/HOCs
- [ ] Conditional rendering paths separated into distinct components
- [ ] Complex ternaries simplified to if/else or IIFEs
- [ ] Complex conditions assigned to named variables

**Predictability (II)**:

- [ ] Consistent return types for similar functions/hooks
- [ ] No hidden side effects; functions follow Single Responsibility Principle
- [ ] Unique, descriptive names for custom wrappers/functions

**Cohesion (III)**:

- [ ] Code organized by feature/domain (not just by code type)
- [ ] Constants defined near related logic with clear naming
- [ ] Form cohesion strategy chosen (field-level vs form-level)

**Coupling (IV)**:

- [ ] No premature abstraction of potentially diverging logic
- [ ] State management broken into focused hooks/contexts
- [ ] Component Composition used instead of Props Drilling

**Frontend Standards** (if applicable):

- [ ] Feature-Sliced Design (FSD) architecture used
- [ ] Layer hierarchy respected: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- [ ] Lower layers do not import from higher layers
- [ ] Each slice has Public API via `index.ts` (no direct internal file imports)
- [ ] Slices organized by business domain within each layer
- [ ] Segments properly organized within slices (`ui/`, `model/`, `api/`, etc.)
- [ ] Complex interactions abstracted into dedicated components
- [ ] Focused hooks for specific concerns (not overly broad)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-chat/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

모노레포: **pnpm + Turborepo**. FE/BE 각각 `apps/` 하위 앱만 두고, **packages/ 공용 패키지는 사용하지 않는다.** 상수·이벤트명·타입은 각 앱에 두고, **contracts·data-model을 기준으로 통일**한다.

```text
pnpm-workspace.yaml          # packages: ["apps/*"] 만
turbo.json
package.json                 # root: lint, format, build, dev
.eslintrc.cjs  (or eslint.config.*)
.prettierrc
tsconfig.base.json           # (선택) 앱별 tsconfig가 extend

apps/
├── chat-fe-with-cursor/     # Vite + React + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── playwright.config.ts
│   └── src/
│       ├── app/
│       ├── pages/
│       ├── widgets/
│       ├── features/
│       ├── entities/
│       └── shared/          # ui (shadcn), lib, api, socket, config
│           └── config/      # MESSAGE_MAX_LENGTH, 소켓 이벤트명 등 (contracts와 동일 유지)
│
└── chat-be-with-cursor/     # NestJS
    ├── package.json
    ├── nest-cli.json
    └── src/
        ├── app.module.ts
        ├── main.ts
        ├── chat/
        │   ├── chat.gateway.ts
        │   ├── chat.service.ts
        │   ├── chat.module.ts
        │   └── chat.store.ts
        ├── rooms/
        ├── common/
        │   └── constants/   # MESSAGE_MAX_LENGTH, 이벤트명 등 (contracts와 동일 유지)
        └── ...
```

**Structure Decision**: **packages/ 없이 `apps/chat-fe-with-cursor`, `apps/chat-be-with-cursor`만** 둔다. 공용 코드 패키지를 쓰지 않고, 각 앱이 자체 설정·상수를 가진다.

---

### 통일(Unification) 방식

**공통을 packages가 아니라 “루트 설정 + 문서 기준”으로 맞춘다.**

| 구분 | 통일 방법 |
|------|-----------|
| **포맷·린트** | 루트 `.prettierrc`, `eslint.config.js`(또는 `.eslintrc.cjs`). 각 앱은 루트를 상속하고, 필요한 경우에만 앱별 override. |
| **TypeScript** | (선택) 루트 `tsconfig.base.json`을 앱 `tsconfig.json`이 `extends`. |
| **상수·이벤트명** | `data-model.md` §4, `contracts/socket-events.md`, `contracts/openapi.yaml`을 **단일 기준**으로 둠. FE는 `shared/config`(또는 `lib/constants`), BE는 `common/constants`에 **동일한 값**을 각각 정의. 변경 시 두 앱 모두 수정. |
| **타입·DTO** | OpenAPI·Socket 계약을 기준으로 FE/BE 각각 정의. 공용 패키지 없이 **문서 일치**로 통일. |
| **Turborepo** | `build`는 `dependsOn: ["^build"]` 제거 또는 앱만 포함. `lint`/`format`는 루트 설정을 쓰는 앱 대상으로 실행. |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| (none)    | —          | —                                    |
