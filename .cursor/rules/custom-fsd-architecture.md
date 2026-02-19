# Custom FSD (Feature-Sliced Design) Architecture

> **STATUS: EXPERIMENTAL**
> 이 규칙은 **새로운 앱**에만 적용되는 실험적 Custom FSD 아키텍처입니다.
> 기존 앱(todo-app, chat-fe-with-claude 등)에는 적용하지 않습니다.
> **모든 코드 작성 시 강제** - speckit.implement 뿐 아니라 일반 개발에서도 준수해야 합니다.

---

## Table of Contents

1. [Layer Hierarchy](#1-layer-hierarchy)
2. [Slices](#2-slices)
3. [Sub-domains](#3-sub-domains)
4. [Segments](#4-segments)
5. [Segment Grouping](#5-segment-grouping)
6. [Public API (index.ts)](#6-public-api-indexts)
7. [Import Rules](#7-import-rules)
8. [TanStack Query Integration](#8-tanstack-query-integration)
9. [Zustand State Management](#9-zustand-state-management)
10. [MSW Integration](#10-msw-integration)
11. [File Naming](#11-file-naming)
12. [UI Component Structure](#12-ui-component-structure)
13. [Path Alias](#13-path-alias)
14. [Full Directory Tree](#14-full-directory-tree)
15. [Enforcement Mechanisms](#15-enforcement-mechanisms)
16. [Test Code Management](#16-test-code-management)
17. [Quick Reference](#17-quick-reference)
18. [Migration Strategy](#18-migration-strategy)
19. [Relationship to Other Rules](#19-relationship-to-other-rules)

---

## 1. Layer Hierarchy

6개 레이어로 구성되며, **상위 레이어는 하위 레이어만 import** 할 수 있다 (표준 FSD 원칙).

```
┌─────────────────────────────────┐
│            App                  │  ← 최상위: 초기화, 프로바이더, 라우팅
├─────────────────────────────────┤
│           Pages                 │  ← 페이지 단위 구성
├─────────────────────────────────┤
│          Widgets                │  ← 독립적 UI 블록 조합
├─────────────────────────────────┤
│         Features                │  ← 사용자 액션 (mutation, 필터, 검색, 상태 변경)
├─────────────────────────────────┤
│         Entities                │  ← 비즈니스 엔티티 (순수 표시, 읽기 전용)
├─────────────────────────────────┤
│          Shared                 │  ← 공유 유틸, UI 킷, 설정
└─────────────────────────────────┘
```

### 의존성 매트릭스

| Import →       | App | Pages | Widgets | Features | Entities | Shared |
|----------------|-----|-------|---------|----------|----------|--------|
| **App**        | -   | O     | O       | O        | O        | O      |
| **Pages**      | X   | -     | O       | O        | O        | O      |
| **Widgets**    | X   | X     | -       | O        | O        | O      |
| **Features**   | X   | X     | X       | -        | O        | O      |
| **Entities**   | X   | X     | X       | X        | -        | O      |
| **Shared**     | X   | X     | X       | X        | X        | -      |

- `O` = import 가능
- `X` = import 불가 (위반 시 STOP)

### Non-domain vs Domain 레이어

| 분류        | 레이어                         | 특징                                  |
|------------|-------------------------------|---------------------------------------|
| Non-domain | App, Shared                   | 슬라이스가 세그먼트 역할 (도메인 무관) |
| Domain     | Pages, Widgets, Features, Entities | 슬라이스 안에 세그먼트 포함 (도메인별) |

---

## 2. Slices

슬라이스는 도메인을 표현하는 **PascalCase 디렉토리**이다.

### Non-domain 레이어 (App, Shared)

슬라이스가 세그먼트 역할을 직접 수행한다:

```
App/
├── Config/          ← 슬라이스 = 세그먼트
├── Provider/
├── Router/
└── Style/

Shared/
├── Api/
├── Config/
├── Model/
├── Type/
└── Ui/
```

### Domain 레이어 (Pages, Widgets, Features, Entities)

슬라이스 안에 세그먼트가 포함된다:

```
Entities/
├── Chat/            ← 슬라이스 (도메인)
│   ├── Api/         ← 세그먼트
│   ├── Model/       ← 세그먼트
│   ├── Type/        ← 세그먼트
│   ├── Ui/          ← 세그먼트
│   └── index.ts     ← Public API
├── User/
│   ├── Api/
│   ├── Model/
│   ├── Type/
│   ├── Ui/
│   └── index.ts
```

---

## 3. Sub-domains

상위 도메인이 커지면 **하위 도메인(서브도메인)**으로 분리한다.

### 명명 규칙

하위 도메인은 반드시 **상위 이름을 prefix**로 포함한다:

```
Chat (상위)  →  ChatWrite (하위), ChatView (하위)
User (상위)  →  UserProfile (하위), UserSettings (하위)
```

### Import 규칙

| 방향                         | 허용 여부 | 예시                         |
|-----------------------------|----------|------------------------------|
| 하위 → 상위                  | O        | ChatWrite → Chat             |
| 상위 → 하위                  | X        | Chat → ChatWrite             |
| 형제 간                      | X        | ChatWrite → ChatView         |

형제 간 import 불가는 표준 FSD의 **동일 레이어 내 슬라이스 간 import 금지** 규칙과 동일하다.

### 분리 기준: 관심사 기반 분리

도메인은 **관심사(Concern)**를 기준으로 분리한다. 페이지가 기준이 아니라, **관심사에서 페이지가 파생**된다.

| 상황                                     | 결정                              |
|-----------------------------------------|-----------------------------------|
| 관심사 분기 + 공통 로직 존재              | 서브도메인 분리                    |
| 단일 관심사                              | 분리 불필요                        |
| 관심사 여러 개 + 공유 로직 없음           | 별개 독립 도메인이 적절             |

**예시**: Note(상위, 공통 타입/API) → NoteWrite(작성+편집 관심사), NoteList(목록 관심사), NoteDetail(상세 관심사), NoteDelete(삭제 관심사)

```
Entities/
├── Note/              ← 상위 도메인 (공통)
│   ├── Api/
│   ├── Type/
│   └── index.ts
├── NoteList/          ← 하위 도메인 (목록 전용, 필요한 레이어에만)
│   ├── Model/
│   └── index.ts
├── NoteDetail/        ← 하위 도메인 (상세 전용)
│   ├── Ui/
│   └── index.ts
```

### 아키텍처 규칙

#### 규칙 1: 레이어 간 도메인 네이밍 일관성

관심사명은 Entities → Features → Widgets → Pages 흐름에서 **일관되게 추적 가능**해야 한다:

```
✅ Entities/Note → Features/NoteWrite → Widgets/NoteWrite → Pages/NoteWrite
❌ Entities/Note → Features/NoteWrite → Widgets/NoteEditor → Pages/NoteWritePage
   (NoteEditor는 UI 기능명이므로 관심사 추적이 끊김)
```

슬라이스명은 관심사명을 사용하고, 내부 컴포넌트 파일에서만 구체적 역할명을 사용한다.

#### 규칙 2: 단일 도메인 원칙 (Pages 예외)

| 레이어 | 도메인 제약 | 설명 |
|--------|-----------|------|
| Entities | 단일 도메인 | 하나의 비즈니스 엔티티만 표현 |
| Features | 단일 도메인 | 하나의 사용자 액션만 표현 |
| Widgets | 단일 도메인 | 하나의 관심사에 대한 독립 UI 블록 |
| Pages | **복합 도메인 허용** | 여러 Widget을 조합하여 페이지 구성 |

#### 규칙 3: 슬라이스 선택적 존재

관심사가 **모든 레이어에 존재하지 않아도 된다**. 필요한 레이어에만 슬라이스를 생성한다:

```
NoteWrite 관심사:
  Entities/Note     ← 상위 도메인 (공통 타입/API)
  Features/NoteWrite ← 쓰기 mutation
  Widgets/NoteWrite  ← 노트 작성 폼 UI
  Pages/NoteWrite    ← 작성 페이지

NoteDelete 관심사:
  Features/NoteDelete ← 삭제 mutation만 (Widget, Page 불필요)
```

---

## 4. Segments

Domain 레이어 슬라이스 내 세그먼트 종류:

| 세그먼트      | 역할                                                          |
|--------------|--------------------------------------------------------------|
| `__Mock__`   | MSW 핸들러, 시드 데이터, in-memory DB (Section 10 참조)        |
| `Api`        | HTTP 호출 함수, Key factory, TanStack Query/Mutation 옵션 팩토리 |
| `Config`     | 상수 모음                                                     |
| `Model`      | hook, util, lib, 비즈니스 로직(상태관리, 소켓 등), Zustand store/logic |
| `Type`       | TypeScript 타입/인터페이스                                     |
| `Ui`         | React 컴포넌트 (레이어별 Ui 규칙 참조)                         |

**확장**: 팀 논의를 통해 세그먼트를 추가할 수 있다. 모든 슬라이스에 모든 세그먼트가 필수는 아니며, 필요한 세그먼트만 생성한다.

### Ui 세그먼트 레이어별 규칙

| 레이어 | Ui 컴포넌트 역할 | 허용 | 금지 |
|--------|----------------|------|------|
| **Entities** | 단일 도메인 데이터의 **순수 표시** | 도메인 데이터 → 렌더링만 | onClick/onSubmit 등 인터랙션 props, 다른 도메인 정보, 라우팅(Link, useNavigate) |
| **Features** | 사용자 액션의 **자기완결적 컴포넌트** | 버튼형 단일 액션 (SendButton, DeleteButton) | children 래퍼, 범용 조합 컴포넌트 |
| **Widgets** | Entity Ui + Feature를 **조합/래핑** | 여러 Entity/Feature 조합, 래퍼, 네비게이션, children | - |
| **Pages** | Widget을 **페이지 단위로 배치** | 여러 Widget 조합, 레이아웃 | 비즈니스 로직 직접 구현 |

**Entity Ui 순수성 원칙**:
- Entity Ui는 **단일 도메인의 단일 정보만** 표시한다
- 예: `CategoryBadge`(카테고리 이름 뱃지), `NoteContentPreview`(노트 본문 미리보기), `NoteDate`(날짜 포맷팅)
- 여러 도메인 정보를 조합하는 "카드" 형태는 Entity가 아닌 **Widget**의 책임

**Feature Ui vs Widget Ui 판단 기준**:

```
Q: 컴포넌트가 자기완결적이고 단일 액션을 수행?
  → YES → Feature Ui (예: SendButton, DeleteButton)

Q: 컴포넌트가 children을 받아 래핑/조합?
  → YES → Widget Ui (예: NoteList, CategoryFilter dropdown)

Q: 컴포넌트가 여러 Entity/Feature를 조합?
  → YES → Widget Ui
```

**App 전용 세그먼트**: App 레이어는 위 6종 외에 `Style`(글로벌 CSS), `Provider`(Context Provider), `Router`(라우팅), `Mock`(MSW 설정) 등 앱 초기화 전용 슬라이스를 사용할 수 있다.

---

## 5. Segment Grouping

세그먼트 내 **1단계 그룹핑만** 허용한다.

### Max Depth 규칙

```
최대 depth: Layer/Slice/Segment/Group/File.ts
```

| 경로                                          | 허용 여부 |
|----------------------------------------------|----------|
| `Entities/Chat/Model/Hook/useChat.ts`        | O        |
| `Entities/Chat/Model/Store/useChatStore.ts`  | O        |
| `Entities/Chat/Model/Hook/Sub/file.ts`       | X (2단계 그룹핑) |

### 주요 그룹 예시

| 세그먼트    | 그룹 예시                                          |
|-----------|---------------------------------------------------|
| Model     | `Hook/`, `Store/`, `Logic/`, `Util/`, `Lib/`, `Socket/` |
| Api       | 파일 레벨 (그룹핑 불필요: `Get.ts`, `Key.ts`, `Query.ts` 등) |
| Ui        | 컴포넌트 폴더들 (각 컴포넌트가 그룹)                    |
| __Mock__  | 파일 레벨 (그룹핑 불필요: `Seed.ts`, `Db.ts`, `Handler.ts`) |

---

## 6. Public API (index.ts)

### Barrel 생성 규칙

모든 **슬라이스, 세그먼트, 그룹**에 `index.ts` barrel 파일을 생성한다.

| 레벨 | 필수 여부 | 예시 |
|------|----------|------|
| Layer (레이어) | ❌ **금지** | ~~`Entities/index.ts`~~ — 모든 슬라이스를 번들링하여 tree-shaking 불가 |
| Slice (슬라이스) | ✅ **필수** | `Entities/Chat/index.ts` |
| Segment (세그먼트) | ✅ **생성** | `Entities/Chat/Api/index.ts` |
| Group (그룹) | ✅ **생성** | `Entities/Chat/Model/Hook/index.ts` |
| `__Mock__` | ✅ **생성** | `Entities/Chat/__Mock__/index.ts` — 단, 슬라이스 barrel에서는 re-export 금지 |
| UI 컴포넌트 폴더 | ✅ **필수** | `Ui/ChatMessageItem/index.ts` (기존 규칙 유지) |

### Export 규칙

**named export만 사용**, `export *` 금지:

```typescript
// ✅ Good — named export
export { getChatMessage } from './Get';
export { chatQueryKey } from './Key';
export { chatQueryOption } from './Query';

// ❌ Bad — wildcard export (tree-shaking 불가)
export * from './Get';
export * from './Key';
```

`export type` 사용 권장:

```typescript
export type { ChatMessage, ChatRoom } from './Chat';
```

### Barrel 체이닝

슬라이스 barrel은 세그먼트 barrel로부터 re-export한다:

```typescript
// Entities/Chat/Api/index.ts (세그먼트 barrel)
export { getChatMessage } from './Get';
export { chatQueryKey } from './Key';
export { chatQueryOption } from './Query';
```

```typescript
// Entities/Chat/Model/Hook/index.ts (그룹 barrel)
export { useChatMessage } from './useChatMessage';
```

```typescript
// Entities/Chat/Model/index.ts (세그먼트 barrel)
export { useChatMessage } from './Hook';
export { useChatStore } from './Store';
```

```typescript
// Entities/Chat/index.ts (슬라이스 barrel)
export type { ChatMessage, ChatRoom } from './Type';
export { getChatMessage, chatQueryKey, chatQueryOption } from './Api';
export { useChatMessage, useChatStore } from './Model';
```

### `__Mock__` barrel

`__Mock__`은 자체 barrel을 가지지만, **슬라이스 barrel에서는 re-export하지 않는다** (production 코드와 테스트 인프라 분리):

```typescript
// Entities/Chat/__Mock__/index.ts (✅ __Mock__ 자체 barrel)
export { INITIAL_CHAT_SEED } from './Seed';
export { getChatMessageList, addChatMessage, resetChatDb } from './Db';
export { chatEntityHandler } from './Handler';
```

```typescript
// Entities/Chat/index.ts (❌ 슬라이스 barrel에서 __Mock__ re-export 금지)
export type { ChatMessage } from './Type';
export { chatQueryOption } from './Api';
// export { chatEntityHandler } from './__Mock__';  ← 금지
```

```typescript
// App/Mock/browser.ts — __Mock__ barrel 경유로 import
import { chatEntityHandler } from '#/Entities/Chat/__Mock__';
```

---

## 7. Import Rules

### 같은 슬라이스: 상대 경로 (barrel 경유)

같은 슬라이스 내에서 다른 세그먼트/그룹을 참조할 때는 **barrel(index.ts)을 경유**하는 상대 경로를 사용한다:

```typescript
// Entities/Chat/Model/Hook/useChat.ts
import type { ChatMessage } from '../../Type';       // ✅ 세그먼트 barrel 경유
import { chatQueryOption } from '../../Api';          // ✅ 세그먼트 barrel 경유
```

같은 세그먼트/그룹 내부에서는 **직접 import**:

```typescript
// Entities/Chat/Api/Query.ts
import { getChatMessage } from './Get';               // ✅ 같은 세그먼트 내 직접 import
import { chatQueryKey } from './Key';                  // ✅ 같은 세그먼트 내 직접 import
```

같은 세그먼트 내 다른 그룹은 **그룹 barrel 경유**:

```typescript
// Entities/Chat/Model/Logic/useChatLogic.ts
import { useChatStore } from '../Store';              // ✅ 그룹 barrel 경유
```

### 다른 슬라이스: 절대 경로 (2-depth 고정)

```typescript
// Features/ChatWrite/Model/Hook/useSendMessage.ts
import { chatQueryKeys } from '#/Entities/Chat';
import type { ChatMessage } from '#/Entities/Chat';
import { httpClient } from '#/Shared/Api';
```

절대 경로 형식: **`#/Layer/Slice`** (항상 2-depth)

### Non-domain 레이어 내부: 상대 경로

Non-domain 레이어(App, Shared)는 슬라이스가 세그먼트 역할을 하므로, **레이어 내부 슬라이스 간 import는 상대 경로 + barrel 경유**를 사용한다:

```typescript
// Shared/Ui/Shadcn/button.tsx → Shared/Model 참조
import { cn } from '../../Model';                   // ✅ barrel 경유
```

단, **shadcn CLI 생성 코드는 예외**로 `components.json` aliases에 정의된 절대 경로(index.ts 경유)를 허용한다:

```typescript
// shadcn CLI가 자동 생성하는 코드 (예외 허용)
import { cn } from '#/Shared/Model';
```

| 상황 | 경로 방식 | 예시 |
|------|----------|------|
| Non-domain 내부 (직접 작성) | 상대 경로 + barrel 경유 | `import { cn } from '../../Model'` |
| Non-domain 내부 (shadcn 생성) | 절대 경로 예외 (index.ts 경유) | `import { cn } from '#/Shared/Model'` |
| 외부 → Non-domain | 절대 경로 + index.ts | `import { Button } from '#/Shared/Ui'` |

### 순환 참조 해결

1. **공통 코드를 하위 레이어로 추출**: 순환 원인이 되는 공통 코드를 Entities나 Shared로 이동
2. **의존성 역전**: 인터페이스를 하위 레이어에 정의하고, 구현을 상위 레이어에서 주입

### 예외: `__Mock__` 테스트 파일

테스트 파일에서 `__Mock__` 세그먼트 barrel 경유 import 허용:

```typescript
// ChatMessage.test.ts
import { mockMessageList } from '../__Mock__';
```

### 예외: Entity 간 `import type` (cross-entity 타입 참조)

NoSQL(MongoDB 등)에서는 API 응답이 다른 도메인의 데이터를 embedded로 포함하는 경우가 흔하다. 이때 Entity 간 타입 참조가 불가피하므로, 다음 **세 가지 조건을 모두 충족**하는 경우에 한해 같은 레이어(Entities) 내 cross-slice import를 허용한다:

| 조건 | 설명 |
|------|------|
| `import type`만 사용 | 런타임 의존성 0 (컴파일 후 완전 제거) |
| `index.ts`(public API) 경유 | 내부 구조 노출 방지 |
| Type 세그먼트 타입만 대상 | Api, Model 등의 런타임 코드 참조 금지 |

**사용 예시 — API 응답에 다른 도메인이 embedded된 경우**:

```typescript
// Entities/Category/Api/Get.ts
import { httpClient } from '#/Shared/Api';
import type { Category } from '../Type';                   // ✅ 세그먼트 barrel 경유
import type { Note } from '#/Entities/Note';               // ✅ import type + 슬라이스 barrel 경유

// NoSQL API 응답: Category 문서에 Note가 embedded
type CategoryWithNoteListResponse = Category & {
  noteList: Note[];
};

export async function getCategoryWithNoteList(
  id: string
): Promise<CategoryWithNoteListResponse> {
  const { data } = await httpClient.get(`/categories/${id}/with-notes`);
  return data;
}
```

**허용되지 않는 사용**:

```typescript
// ❌ import type이 아닌 일반 import
import { getNoteList } from '#/Entities/Note';

// ❌ Type 세그먼트가 아닌 Model/Api 참조
import type { useNote } from '#/Entities/Note';

// ❌ index.ts를 경유하지 않는 직접 참조
import type { Note } from '#/Entities/Note/Type/Note';
```

**적용 판단 기준**:

| 상황 | 결정 |
|------|------|
| API 응답에 다른 도메인 데이터가 embedded | `import type` 예외 적용 |
| 도메인 타입 정의(Type 세그먼트)에서 다른 도메인 참조 | `import type` 예외 적용 |
| Entity의 Model/Api에서 다른 Entity의 런타임 코드 필요 | 상위 레이어(Widget/Feature)에서 조합 |

---

## 8. TanStack Query Integration

### Entities/Api: 읽기 전용

```
Entities/{Domain}/Api/
├── Get.ts        ← GET HTTP 함수
├── Key.ts        ← query key factory
└── Query.ts      ← queryOptions factory (Key.ts에서 key import)
```

**Key.ts 분리 이유**: query key는 Entity 내부(Query.ts)뿐 아니라 Feature(Mutation hook에서 invalidation)에서도 사용된다. Key를 별도 파일로 분리하면 각 파일의 책임이 명확해지고, Feature에서 key만 import할 때 의도가 드러난다.

```typescript
// Entities/Chat/Api/Get.ts
import { httpClient } from '#/Shared/Api';
import type { ChatMessage } from '../Type';               // ✅ 세그먼트 barrel 경유

export async function getChatMessage(roomId: string): Promise<ChatMessage[]> {
  const { data } = await httpClient.get(`/chat/rooms/${roomId}/messages`);
  return data;
}
```

```typescript
// Entities/Chat/Api/Key.ts
export const chatQueryKey = {
  all: ['chat'] as const,
  message: (roomId: string) => [...chatQueryKey.all, 'message', roomId] as const,
};
```

```typescript
// Entities/Chat/Api/Query.ts
import { queryOptions } from '@tanstack/react-query';
import { getChatMessage } from './Get';
import { chatQueryKey } from './Key';

export const chatQueryOption = {
  message: (roomId: string) =>
    queryOptions({
      queryKey: chatQueryKey.message(roomId),
      queryFn: () => getChatMessage(roomId),
    }),
};
```

### Features/Api: 쓰기 전용

```
Features/{Domain}/Api/
├── Post.ts       ← POST HTTP 함수 (필요한 것만 생성)
├── Put.ts        ← PUT HTTP 함수
├── Patch.ts      ← PATCH HTTP 함수
├── Delete.ts     ← DELETE HTTP 함수
├── Key.ts        ← mutation key factory
└── Mutation.ts   ← mutationOptions factory (Key.ts에서 key import)
```

```typescript
// Features/ChatWrite/Api/Post.ts
import { httpClient } from '#/Shared/Api';
import type { SendMessageRequest } from '../Type';         // ✅ 세그먼트 barrel 경유

export async function postChatMessage(payload: SendMessageRequest) {
  const { data } = await httpClient.post('/chat/messages', payload);
  return data;
}
```

```typescript
// Features/ChatWrite/Api/Key.ts
export const chatWriteMutationKey = {
  send: ['chat', 'send'] as const,
};
```

```typescript
// Features/ChatWrite/Api/Mutation.ts
import { postChatMessage } from './Post';
import { chatWriteMutationKey } from './Key';

export const chatWriteMutationOption = {
  send: () => ({
    mutationKey: chatWriteMutationKey.send,
    mutationFn: postChatMessage,
  }),
};
```

### Hook 래퍼 패턴

```typescript
// Entities/Chat/Model/Hook/useChatMessage.ts
import { useQuery } from '@tanstack/react-query';
import { chatQueryOption } from '../../Api';              // ✅ 세그먼트 barrel 경유

export function useChatMessage(roomId: string) {
  return useQuery(chatQueryOption.message(roomId));
}
```

```typescript
// Features/ChatWrite/Model/Hook/useSendMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatQueryKey } from '#/Entities/Chat';
import { chatWriteMutationOption } from '../../Api';      // ✅ 세그먼트 barrel 경유

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...chatWriteMutationOption.send(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKey.message(roomId),
      });
    },
  });
}
```

Feature의 mutation hook에서 Entity의 query key를 import하여 **invalidate** 가능.

---

## 9. Zustand State Management

### 상태 정의: Entities/{Domain}/Model/Store/

Zustand **slices pattern**을 사용하여 도메인별 슬라이스 파일을 분리한다:

```
Entities/Chat/Model/Store/
├── MessageSlice.ts
├── ConnectionSlice.ts
└── useChatStore.ts      ← 슬라이스들을 합쳐 생성
```

```typescript
// Entities/Chat/Model/Store/MessageSlice.ts
import type { StateCreator } from 'zustand';

export type MessageSlice = {
  messages: ChatMessage[];
  currentRoomId: string | null;
};

export const createMessageSlice: StateCreator<
  ChatStoreState,
  [],
  [],
  MessageSlice
> = () => ({
  messages: [],
  currentRoomId: null,
});
```

```typescript
// Entities/Chat/Model/Store/useChatStore.ts
import { create } from 'zustand';
import { createMessageSlice } from './MessageSlice';
import { createConnectionSlice } from './ConnectionSlice';

type ChatStoreState = MessageSlice & ConnectionSlice;

export const useChatStore = create<ChatStoreState>()((...a) => ({
  ...createMessageSlice(...a),
  ...createConnectionSlice(...a),
}));
```

### 상태 업데이트 로직: Features/{Domain}/Model/Logic/

```
Features/ChatWrite/Model/Logic/
├── useMessageLogic.ts
└── useChatWriteLogic.ts   ← 전체 합침
```

```typescript
// Features/ChatWrite/Model/Logic/useMessageLogic.ts
import { useChatStore } from '#/Entities/Chat';

export function useMessageLogic() {
  const setMessages = useChatStore((s) => s.setMessages);

  function addMessage(message: ChatMessage) {
    useChatStore.setState((state) => ({
      messages: [...state.messages, message],
    }));
  }

  return { addMessage };
}
```

### 사용 패턴

소비자는 **`useDomainStore` (읽기)** + **`useDomainLogic` (쓰기)**로만 접근한다:

```typescript
// Widget에서 사용
import { useChatStore } from '#/Entities/Chat';
import { useChatWriteLogic } from '#/Features/ChatWrite';

function ChatWidget() {
  const messages = useChatStore((s) => s.messages);
  const { addMessage } = useChatWriteLogic();
  // ...
}
```

### 사용 기준

| 상황                                     | Zustand 사용 여부 |
|-----------------------------------------|-----------------|
| 2개 이상 Widget에서 상태 공유 필요         | O               |
| 페이지 단위 상태 관리가 효과적             | O               |
| 단일 컴포넌트 내부 상태                    | X (useState)    |
| 서버 상태 (API 데이터)                     | X (TanStack Query) |

---

## 10. MSW Integration

MSW(Mock Service Worker) 핸들러를 FSD 레이어 규칙에 맞게 도메인별로 분산 관리한다.

### `__Mock__` 3-file 패턴

각 도메인의 `__Mock__` 세그먼트는 다음 세 파일로 구성한다:

| 파일 | 역할 | 예시 |
|------|------|------|
| `Seed.ts` | 초기 시드 데이터 (정적 상수) | `noteSeedData`, `categorySeedData` |
| `Db.ts` | in-memory CRUD 함수 (상태 관리) | `getNoteList()`, `createNote()`, `deleteNote()` |
| `Handler.ts` | MSW `http.*` 핸들러 (Db 함수 호출) | `http.get('/notes', ...)` |

```
Entities/Chat/__Mock__/
├── Seed.ts          ← 초기 데이터
├── Db.ts            ← in-memory DB (CRUD)
├── Handler.ts       ← MSW GET 핸들러
└── index.ts         ← barrel (슬라이스 barrel에서는 re-export 금지)
```

세 파일이 모두 필요하지 않으면 필요한 파일만 생성한다. 예를 들어, 시드 데이터 없이 빈 DB로 시작하면 `Seed.ts`는 생략 가능하다.

### 레이어별 핸들러 분담

**Entity `__Mock__`**: GET 핸들러(읽기)만 담당한다.

```typescript
// Entities/Chat/__Mock__/Handler.ts
import { http, HttpResponse } from 'msw';
import { chatDb } from './Db';

export const chatEntityHandler = [
  http.get('/api/chat/rooms/:roomId/messages', ({ params }) => {
    const messageList = chatDb.getMessageList(params.roomId as string);
    return HttpResponse.json(messageList);
  }),
];
```

**Feature `__Mock__`**: 쓰기 핸들러(POST/PUT/PATCH/DELETE)만 담당한다.

```typescript
// Features/ChatWrite/__Mock__/Handler.ts
import { http, HttpResponse } from 'msw';
import { chatDb } from '#/Entities/Chat/__Mock__';

export const chatWriteFeatureHandler = [
  http.post('/api/chat/messages', async ({ request }) => {
    const body = await request.json();
    const created = chatDb.createMessage(body);
    return HttpResponse.json(created, { status: 201 });
  }),
];
```

### `__Mock__` cross-entity import 예외

Mock 핸들러는 백엔드를 시뮬레이션하므로, **다른 Entity의 `__Mock__/Db.ts`를 직접 import**하는 것을 허용한다.

```typescript
// Entities/Category/__Mock__/Handler.ts
import { noteDb } from '#/Entities/Note/__Mock__';  // ✅ __Mock__ cross-entity 예외 (barrel 경유)

export const categoryEntityHandler = [
  http.get('/api/categories/:id/note-count', ({ params }) => {
    const count = noteDb.countByCategoryId(params.id as string);
    return HttpResponse.json({ count });
  }),
];
```

**예외 조건**:

| 조건 | 설명 |
|------|------|
| `__Mock__` 세그먼트 내부 파일만 | Handler.ts, Db.ts 등 mock 전용 파일 |
| `__Mock__` barrel 경유 | `#/Entities/Note/__Mock__` (barrel 경유) |
| production 코드에는 적용 불가 | Api, Model, Type 등은 기존 레이어 규칙 유지 |

**근거**: `__Mock__`은 백엔드 시뮬레이션이므로 프론트엔드 레이어 규칙의 적용 대상이 아니다. 실제 백엔드에서는 모든 테이블/컬렉션에 자유롭게 접근하므로, mock도 동일한 수준의 접근이 필요하다.

### App/Mock: 조합 전용

`App/Mock/` 슬라이스는 Entity와 Feature의 핸들러를 **모아서 setupWorker에 전달하는 역할만** 수행한다.

```typescript
// App/Mock/browser.ts
import { setupWorker } from 'msw/browser';

// Entity handlers (GET)
import { chatEntityHandler } from '#/Entities/Chat/__Mock__';
import { userEntityHandler } from '#/Entities/User/__Mock__';

// Feature handlers (POST/PUT/DELETE)
import { chatWriteFeatureHandler } from '#/Features/ChatWrite/__Mock__';

export const worker = setupWorker(
  // Entity (읽기)
  ...chatEntityHandler,
  ...userEntityHandler,
  // Feature (쓰기)
  ...chatWriteFeatureHandler,
);
```

**규칙**:
- `App/Mock/browser.ts`에서 handler 직접 정의 금지 — 조합만 담당
- Entity와 Feature handler를 구분하여 import (가독성)
- `__Mock__` barrel 경유 import (`#/Entities/Chat/__Mock__`), 슬라이스 barrel에서는 re-export 금지

### handler 네이밍 규칙

| 레이어 | 네이밍 패턴 | 예시 |
|--------|-----------|------|
| Entity | `{domain}EntityHandler` | `chatEntityHandler`, `noteEntityHandler` |
| Feature | `{domain}FeatureHandler` | `chatWriteFeatureHandler`, `noteWriteFeatureHandler` |

---

## 11. File Naming

| 대상                     | 규칙             | 예시                                    |
|-------------------------|------------------|-----------------------------------------|
| 디렉토리                 | PascalCase       | `Model/`, `Api/`, `Hook/`               |
| 디렉토리 (예외)          | `__Mock__`       | `__Mock__/`                             |
| 일반 파일                | PascalCase       | `UserProfile.tsx`, `ChatApi.ts`, `Get.ts`, `Query.ts` |
| Hook 파일               | camelCase        | `useChat.ts`, `useUserList.ts`          |
| Zustand Store 파일       | camelCase        | `useChatStore.ts`                       |
| Zustand Logic 파일       | camelCase        | `useChatLogic.ts`                       |
| Zustand Slice 파일       | PascalCase       | `MessageSlice.ts`, `ConnectionSlice.ts` |
| Barrel 파일              | `index.ts`       | `index.ts`                              |
| shadcn 생성 파일 (예외)   | 소문자 허용       | `button.tsx`, `dialog.tsx` (`Shadcn/` 그룹 내부에서만) |

---

## 12. UI Component Structure

```
ComponentName/
├── ComponentName.tsx              ← 메인 컴포넌트 (필수)
├── ComponentName.loading.tsx      ← 로딩 상태 (선택)
├── ComponentName.module.scss      ← 스타일 (선택)
├── ComponentName.constant.ts      ← 컴포넌트 전용 상수 (선택)
├── ComponentName.util.ts          ← 컴포넌트 전용 유틸 (선택)
├── ComponentName.test.tsx         ← 테스트 (선택)
└── index.ts                       ← barrel export (필수)
```

### 규칙

- 컴포넌트 전용 상수/유틸 → `.constant.ts`, `.util.ts` 파일로 분리
- 슬라이스 전체에서 재사용 가능하면 → `Model` 세그먼트로 이동

### 서브 컴포넌트: Sibling vs 별도 폴더

서브 컴포넌트의 배치는 **자체 로직 유무**로 결정한다:

| 기준 | 배치 | 예시 |
|------|------|------|
| 자체 hook/외부 import **없음** (순수 UI 조각) | **Sibling** — 메인 컴포넌트 폴더 안에 파일로 배치 | `.loading.tsx`, `.constant.ts`, 시각적 파트 |
| 자체 hook/외부 import **있음** (독립 로직) | **별도 폴더** — Ui 세그먼트 안에 독립 컴포넌트 폴더로 분리 | 네비게이션, 데이터 조합, 라우팅 포함 컴포넌트 |

**Sibling 패턴** — 메인 컴포넌트의 부속물 (로직 없음):

```
ChatMessageItem/
├── ChatMessageItem.tsx
├── ChatMessageBubble.tsx          ← sibling (순수 렌더링 조각)
├── ChatMessageTimestamp.tsx       ← sibling (순수 렌더링 조각)
├── ChatMessageItem.test.tsx
└── index.ts
```

**별도 폴더 패턴** — 독립 컴포넌트 (자체 로직 있음):

```
Widgets/NoteList/Ui/
├── NoteList/
│   ├── NoteList.tsx               ← 데이터 fetch + 상태 분기
│   ├── NoteList.loading.tsx       ← sibling (순수 스켈레톤, 로직 없음)
│   ├── NoteList.test.tsx
│   └── index.ts
├── NoteListItem/                  ← 별도 폴더 (useNavigate + Entity Ui 조합)
│   ├── NoteListItem.tsx
│   └── index.ts
├── NoteListEmpty/                 ← 별도 폴더 (Link + ROUTES 사용)
│   ├── NoteListEmpty.tsx
│   └── index.ts
└── index.ts
```

**판단 기준 요약**:

```
Q: 서브 컴포넌트가 자체 hook(useState, useNavigate 등)을 사용?
  → YES → 별도 폴더

Q: 서브 컴포넌트가 외부 슬라이스를 import? (Entity, Feature 등)
  → YES → 별도 폴더

Q: 서브 컴포넌트가 순수하게 props → JSX만?
  → YES → sibling 파일
```

### shadcn/ui 통합 패턴

shadcn/ui CLI가 생성하는 컴포넌트는 `Shadcn/` 그룹 내에서 관리한다:

```
Shared/
├── Model/
│   └── Shadcn/              ← shadcn 전용 유틸 그룹
│       └── Utils.ts         ← cn() 등 shadcn 유틸리티
└── Ui/
    ├── Shadcn/              ← shadcn CLI 자동 생성 컴포넌트 그룹
    │   ├── button.tsx       ← CLI 생성 파일 (소문자 예외)
    │   ├── input.tsx
    │   └── dialog.tsx
    ├── ErrorBoundary/       ← 커스텀 컴포넌트 (PascalCase)
    │   ├── ErrorBoundary.tsx
    │   └── index.ts
    └── index.ts
```

**규칙**:
- `Shadcn/` 그룹 내 파일은 shadcn CLI가 생성하므로 **소문자 파일명 허용** (유일한 예외)
- 커스텀 컴포넌트는 `Shadcn/` 그룹 밖에서 PascalCase 폴더 구조를 유지
- `components.json`의 `ui` alias를 `#/Shared/Ui/Shadcn`, `utils` alias를 `#/Shared/Model`(index.ts 경유)로 설정
- shadcn CLI 생성 코드 내 import는 `#/Shared/Model`(절대 경로, index.ts 경유) 예외 허용 (Section 7 참조)

---

## 13. Path Alias

### 설정

`#/` prefix를 사용한다 (`#/*` → `src/*`):

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '#': resolve(__dirname, 'src'),
    },
  },
});
```

```javascript
// next.config.js (Next.js 사용 시)
// tsconfig.json의 paths 설정만으로 자동 인식됨
```

### 기존 앱과의 공존

기존 앱이 `@/` alias를 사용하는 경우, 새 앱에서는 `#/`를 사용하여 **충돌 없이 공존**한다. 기존 앱의 alias를 변경하지 않는다.

---

## 14. Full Directory Tree

채팅 앱 기반 완전한 디렉토리 예시:

```
src/
├── App/
│   ├── Config/
│   │   └── env.ts
│   ├── Mock/
│   │   └── browser.ts           ← setupWorker (핸들러 조합만)
│   ├── Provider/
│   │   ├── QueryProvider.tsx
│   │   └── index.ts
│   ├── Router/
│   │   ├── AppRouter.tsx
│   │   └── index.ts
│   └── Style/
│       └── global.css
│
├── Pages/
│   ├── ChatWrite/                ← 슬라이스 = 관심사명 (Page 접미사 없음)
│   │   ├── Ui/
│   │   │   ├── ChatWritePage/    ← 컴포넌트 파일명은 Page 접미사 유지
│   │   │   │   ├── ChatWritePage.tsx
│   │   │   │   └── index.ts     ← 컴포넌트 barrel
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   └── index.ts             ← 슬라이스 barrel
│   ├── ChatView/
│   │   ├── Ui/
│   │   │   ├── ChatViewPage/
│   │   │   │   ├── ChatViewPage.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── Home/
│       ├── Ui/
│       │   ├── HomePage/
│       │   │   ├── HomePage.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       └── index.ts
│
├── Widgets/
│   ├── ChatMessageList/
│   │   ├── Ui/
│   │   │   ├── ChatMessageList/
│   │   │   │   ├── ChatMessageList.tsx
│   │   │   │   ├── ChatMessageList.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   └── index.ts             ← 슬라이스 barrel
│   ├── ChatInput/
│   │   ├── Model/
│   │   │   ├── Hook/
│   │   │   │   ├── useChatInput.ts
│   │   │   │   └── index.ts     ← 그룹 barrel
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Ui/
│   │   │   ├── ChatInput/
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── Header/
│       ├── Ui/
│       │   ├── Header/
│       │   │   ├── Header.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       └── index.ts
│
├── Features/
│   ├── ChatWrite/
│   │   ├── __Mock__/
│   │   │   ├── Db.ts
│   │   │   ├── Handler.ts
│   │   │   └── index.ts         ← __Mock__ barrel (슬라이스 barrel에서 re-export 금지)
│   │   ├── Api/
│   │   │   ├── Post.ts
│   │   │   ├── Key.ts
│   │   │   ├── Mutation.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Model/
│   │   │   ├── Hook/
│   │   │   │   ├── useSendMessage.ts
│   │   │   │   └── index.ts     ← 그룹 barrel
│   │   │   ├── Logic/
│   │   │   │   ├── useMessageLogic.ts
│   │   │   │   ├── useChatWriteLogic.ts
│   │   │   │   └── index.ts     ← 그룹 barrel
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Type/
│   │   │   ├── ChatWrite.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Ui/
│   │   │   ├── SendButton/
│   │   │   │   ├── SendButton.tsx
│   │   │   │   ├── SendButton.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   └── index.ts             ← 슬라이스 barrel
│   └── UserAuth/
│       ├── Api/
│       │   ├── Post.ts
│       │   ├── Key.ts
│       │   ├── Mutation.ts
│       │   └── index.ts
│       ├── Model/
│       │   ├── Hook/
│       │   │   ├── useLogin.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── Type/
│       │   ├── UserAuth.ts
│       │   └── index.ts
│       └── index.ts
│
├── Entities/
│   ├── Chat/
│   │   ├── __Mock__/
│   │   │   ├── Seed.ts
│   │   │   ├── Db.ts
│   │   │   ├── Handler.ts
│   │   │   └── index.ts         ← __Mock__ barrel
│   │   ├── Api/
│   │   │   ├── Get.ts
│   │   │   ├── Key.ts
│   │   │   ├── Query.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Config/
│   │   │   ├── ChatConfig.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Model/
│   │   │   ├── Hook/
│   │   │   │   ├── useChatMessage.ts
│   │   │   │   └── index.ts     ← 그룹 barrel
│   │   │   ├── Store/
│   │   │   │   ├── MessageSlice.ts
│   │   │   │   ├── ConnectionSlice.ts
│   │   │   │   ├── useChatStore.ts
│   │   │   │   └── index.ts     ← 그룹 barrel
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Type/
│   │   │   ├── Chat.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   ├── Ui/
│   │   │   ├── ChatMessageItem/
│   │   │   │   ├── ChatMessageItem.tsx
│   │   │   │   ├── ChatMessageBubble.tsx
│   │   │   │   ├── ChatMessageItem.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ChatRoomCard/
│   │   │   │   ├── ChatRoomCard.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts         ← 세그먼트 barrel
│   │   └── index.ts             ← 슬라이스 barrel
│   └── User/
│       ├── Api/
│       │   ├── Get.ts
│       │   ├── Key.ts
│       │   ├── Query.ts
│       │   └── index.ts
│       ├── Model/
│       │   ├── Hook/
│       │   │   ├── useUser.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── Type/
│       │   ├── User.ts
│       │   └── index.ts
│       ├── Ui/
│       │   ├── UserAvatar/
│       │   │   ├── UserAvatar.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       └── index.ts
│
└── Shared/
    ├── Api/
    │   ├── httpClient.ts
    │   └── index.ts
    ├── Config/
    │   ├── Routes.ts
    │   └── index.ts
    ├── Model/
    │   ├── Lib/
    │   │   ├── DateFormat.ts
    │   │   └── index.ts         ← 그룹 barrel
    │   ├── Shadcn/
    │   │   ├── Utils.ts
    │   │   └── index.ts         ← 그룹 barrel
    │   └── index.ts
    ├── Type/
    │   ├── Common.ts
    │   └── index.ts
    └── Ui/
        ├── Shadcn/               ← shadcn 그룹은 barrel 없음 (CLI 생성 파일)
        │   ├── button.tsx
        │   ├── input.tsx
        │   └── dialog.tsx
        ├── ErrorBoundary/
        │   ├── ErrorBoundary.tsx
        │   └── index.ts
        └── index.ts
```

---

## 15. Enforcement Mechanisms

**모든 코드 작성 시** 아래 검증을 수행한다.

### Check 1: 파일 경로 유효성

```
BEFORE creating/modifying a file:
  IF file_path does NOT match pattern Layer/Slice/Segment/[Group/]File:
    STOP
    EXPLAIN: "파일 경로가 Custom FSD 구조를 따르지 않습니다"
    SUGGEST correct path

  IF directory_name is NOT PascalCase (except __Mock__, index.ts):
    STOP
    EXPLAIN: "디렉토리 이름은 PascalCase여야 합니다"

  IF depth > Layer/Slice/Segment/Group/File (5 levels):
    STOP
    EXPLAIN: "세그먼트 내 1단계 그룹핑만 허용됩니다"
```

### Check 2: Import 방향

```
BEFORE adding an import:
  source_layer = extract_layer(current_file)
  target_layer = extract_layer(import_path)

  IF layer_rank(source_layer) > layer_rank(target_layer):
    STOP
    EXPLAIN: "하위 레이어에서 상위 레이어를 import할 수 없습니다"

  IF same_layer AND different_slice:
    IF subdomain_child_to_parent(source_slice, target_slice):
      ALLOW
    ELSE IF source_layer == 'Entities' AND is_import_type AND targets_index_ts:
      ALLOW (cross-entity import type 예외)
    ELSE IF source_file IN '__Mock__/' AND target_file IN '__Mock__/':
      ALLOW (__Mock__ cross-entity 예외)
    ELSE:
      STOP
      EXPLAIN: "같은 레이어의 다른 슬라이스를 import할 수 없습니다"
```

### Check 3: Import 경로 스타일

```
BEFORE adding an import:
  IF cross_slice_import AND NOT starts_with('#/'):
    STOP
    EXPLAIN: "다른 슬라이스 import는 #/Layer/Slice 절대 경로를 사용하세요"

  IF same_slice_import AND starts_with('#/'):
    STOP
    EXPLAIN: "같은 슬라이스 내 import는 상대 경로를 사용하세요"

  IF cross_slice_import AND NOT targeting_index_ts AND NOT targeting_mock_index_ts:
    STOP
    EXPLAIN: "다른 슬라이스는 index.ts(public API)만 import 가능합니다 (__Mock__은 __Mock__/index.ts 경유)"

  IF same_slice_import AND different_segment AND NOT targeting_barrel:
    WARN: "다른 세그먼트는 barrel(index.ts) 경유를 권장합니다 (예: '../../Api' not '../../Api/Get')"

  IF same_segment_import AND different_group AND NOT targeting_barrel:
    WARN: "다른 그룹은 barrel(index.ts) 경유를 권장합니다 (예: '../Store' not '../Store/useChatStore')"
```

### Check 4: Public API (Barrel)

```
AFTER creating a slice:
  IF slice_root does NOT have index.ts:
    WARN: "index.ts(public API)를 생성해야 합니다"

AFTER creating a segment:
  IF segment_root does NOT have index.ts:
    WARN: "세그먼트 barrel(index.ts)를 생성해야 합니다"

AFTER creating a group:
  IF group_root does NOT have index.ts:
    WARN: "그룹 barrel(index.ts)를 생성해야 합니다"

AFTER creating a layer-level index.ts (e.g., Entities/index.ts):
  STOP
  EXPLAIN: "레이어 레벨 barrel은 금지입니다 (tree-shaking 불가)"

IF slice_index_ts re-exports from __Mock__:
  STOP
  EXPLAIN: "슬라이스 barrel에서 __Mock__을 re-export하지 않습니다"

IF index.ts uses 'export *':
  STOP
  EXPLAIN: "export *는 금지입니다. named export를 사용하세요"
```

---

## 16. Test Code Management

### 파일 옆 배치 (Sibling) 방식

소스 파일 옆에 `.test.ts` / `.test.tsx` 파일을 배치한다:

```
Model/Hook/
├── useChat.ts
└── useChat.test.ts          ← 소스 파일 옆

Ui/ChatMessageItem/
├── ChatMessageItem.tsx
├── ChatMessageItem.test.tsx  ← 소스 파일 옆
└── index.ts
```

### 규칙

| 규칙                                    | 설명                                         |
|----------------------------------------|----------------------------------------------|
| depth 추가 없음                         | max depth 규칙(5-level)과 충돌하지 않음        |
| `__Mock__` 세그먼트와 역할 분리          | `__Mock__` = 시드 데이터/in-memory DB/MSW 핸들러 전용 (Section 10 참조) |
| 테스트 파일은 index.ts에서 export 안 함  | public API에 테스트 노출 금지                  |
| `__Mock__` 직접 import 허용             | 테스트 파일에서만 예외적으로 허용               |

---

## 17. Quick Reference

### "이 코드는 어디에?" 결정 트리

```
Q: 앱 초기화 / 프로바이더 / 라우팅?
  → App/

Q: 특정 URL 경로에 매핑되는 페이지?
  → Pages/{ConcernName}/ (관심사명, Page 접미사 없음)
  → 단일 도메인: Pages/NoteWrite/, Pages/NoteList/
  → 복합 도메인: Pages/Dashboard/ (예외)

Q: 독립적 UI 블록 (여러 Feature/Entity 조합)?
  → Widgets/{WidgetName}/

Q: 사용자 액션 (생성/수정/삭제)?
  → Features/{ActionDomain}/

Q: 비즈니스 데이터 (읽기 중심)?
  → Entities/{DataDomain}/

Q: 앱 전반에서 재사용?
  → Shared/
```

### "어떤 세그먼트?" 결정 트리

```
Q: HTTP 요청 또는 TanStack Query 옵션?
  → Api/

Q: React 컴포넌트?
  → Ui/

Q: 타입/인터페이스 정의?
  → Type/

Q: 상수값?
  → Config/

Q: 훅, 유틸, Zustand, 비즈니스 로직?
  → Model/

Q: 테스트 전용 목 데이터 / MSW?
  → __Mock__/
```

### Import 치트시트

| 상황               | 형식                          | 예시                                |
|-------------------|-----------------------------|-------------------------------------|
| 같은 세그먼트/그룹 내부 | 직접 import                 | `import { x } from './Get'`         |
| 같은 슬라이스, 다른 그룹 | 상대 경로 + 그룹 barrel    | `import { x } from '../Store'`      |
| 같은 슬라이스, 다른 세그먼트 | 상대 경로 + 세그먼트 barrel | `import { x } from '../../Api'`     |
| 다른 슬라이스       | `#/Layer/Slice`              | `import { x } from '#/Entities/Chat'` |
| Entity 간 타입 참조 | `import type` + `#/Entities/Slice` | `import type { Note } from '#/Entities/Note'` |
| 외부 라이브러리     | 패키지 이름                    | `import { x } from 'zustand'`       |

### Naming 치트시트

| 대상          | 규칙          | 예시                           |
|--------------|--------------|-------------------------------|
| 디렉토리      | PascalCase   | `ChatWrite/`, `Model/`        |
| 컴포넌트 파일  | PascalCase   | `ChatInput.tsx`               |
| Hook 파일     | camelCase    | `useChat.ts`                  |
| Store 파일    | camelCase    | `useChatStore.ts`             |
| Slice 파일    | PascalCase   | `MessageSlice.ts`             |
| HTTP 파일     | PascalCase   | `Get.ts`, `Post.ts`           |
| Key 파일      | PascalCase   | `Key.ts`                      |
| Query/Mutation | PascalCase  | `Query.ts`, `Mutation.ts`     |
| Mock 파일      | PascalCase   | `Seed.ts`, `Db.ts`, `Handler.ts` |

### Zustand 사용 판단 치트시트

```
Q: 2개 이상 Widget에서 같은 상태를 공유?
  → YES → Zustand (Entities/{Domain}/Model/Store/)

Q: 페이지 전체에 걸친 UI 상태?
  → YES → Zustand

Q: API에서 가져온 서버 데이터?
  → NO → TanStack Query 사용

Q: 단일 컴포넌트 내부 상태?
  → NO → useState/useReducer 사용
```

---

## 18. Migration Strategy

기존 레포에 적용할 때의 전략.

### 기본 원칙: 기존 코드 유지, 새 코드만 규칙 준수

- 기능 개발 시 기존 코드를 FSD에 맞게 **리팩토링하지 않음**
- **새로 작성하는 코드만** Custom FSD 규칙을 따름
- 기존 import 경로, 파일 구조 등은 **그대로 유지**

### 예외

**리팩토링 없이 진행 불가능한 경우**만 최소 범위로 수정:

- 순환 참조가 발생하여 빌드 불가
- 기존 export가 없어 새 코드에서 사용 불가

### 기능 개발 완료 후

FSD 미준수 영역을 **"추후 리팩토링 작업"**으로 목록화:

1. 어떤 파일/모듈이 규칙을 따르지 않는지 정리
2. 우선순위를 매겨 점진적으로 마이그레이션
3. 별도 리팩토링 태스크로 관리

**목적**: 기능 개발이 리팩토링에 묻히는 것을 방지

---

## 19. Relationship to Other Rules

### constitution.md와의 관계

- constitution.md의 `II. Architecture Principles > Frontend Structure (FSD)` 섹션을 **구체화하고 확장**
- constitution.md는 전체 기술 스택과 원칙을, 이 문서는 FSD 디렉토리 구조의 세부 규칙을 정의
- 충돌 시: constitution.md의 기술 스택 선택(TanStack Query, Zustand 등)이 우선, FSD 구조 세부 사항은 이 문서가 우선

### 다른 rule 파일과의 관계

| Rule 파일                    | 관계                                                |
|-----------------------------|-----------------------------------------------------|
| `clean-code-unified.md`     | 코드 품질 원칙 → FSD 구조 내 각 파일에 적용           |
| `toss-frontend-rule.md`     | 프론트엔드 설계 원칙 → 컴포넌트/훅 설계 시 함께 적용  |
| `typescript-specifics.md`   | TypeScript 패턴 → 타입 정의, import 구조에 적용       |
| `javascript-specifics.md`   | JS 패턴 → 모듈 패턴, async 패턴에 적용               |
| `speckit-workflow-rules.md` | 워크플로우 규칙 → implement 단계에서 이 FSD 규칙 강제 |
| `naming-no-plurals.md`     | 네이밍 규칙 → 슬라이스/세그먼트/파일/함수 이름에 적용  |

### 적용 범위

```
IF 새로운 앱 코드 작성:
  APPLY custom-fsd-architecture.md  (구조)
  APPLY naming-no-plurals.md        (네이밍)
  APPLY clean-code-unified.md       (코드 품질)
  APPLY toss-frontend-rule.md       (설계 원칙)
  APPLY typescript-specifics.md     (TS 패턴)

IF speckit.implement 단계:
  APPLY speckit-workflow-rules.md   (워크플로우)
  APPLY custom-fsd-architecture.md  (구조)
  APPLY 기타 관련 rules
```
