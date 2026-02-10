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
10. [File Naming](#10-file-naming)
11. [UI Component Structure](#11-ui-component-structure)
12. [Path Alias](#12-path-alias)
13. [Full Directory Tree](#13-full-directory-tree)
14. [Enforcement Mechanisms](#14-enforcement-mechanisms)
15. [Test Code Management](#15-test-code-management)
16. [Quick Reference](#16-quick-reference)
17. [Migration Strategy](#17-migration-strategy)
18. [Relationship to Other Rules](#18-relationship-to-other-rules)

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
│         Features                │  ← 사용자 시나리오 (쓰기 액션)
├─────────────────────────────────┤
│         Entities                │  ← 비즈니스 엔티티 (읽기 중심)
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

### 분리 기준: 페이지 기반 관심사 분리

| 상황                                     | 결정                              |
|-----------------------------------------|-----------------------------------|
| 페이지 2개 이상 + 공통 로직 존재          | 서브도메인 분리                    |
| 페이지 1개뿐                             | 분리 불필요                        |
| 페이지 여러 개 + 공유 로직 없음           | 별개 독립 도메인이 적절             |

**예시**: Chat(상위, 공통 타입/API) → ChatWrite(작성 페이지), ChatView(조회 페이지)

```
Entities/
├── Chat/              ← 상위 도메인 (공통)
│   ├── Api/
│   ├── Type/
│   └── index.ts
├── ChatWrite/         ← 하위 도메인 (작성 전용)
│   ├── Model/
│   ├── Ui/
│   └── index.ts
├── ChatView/          ← 하위 도메인 (조회 전용)
│   ├── Model/
│   ├── Ui/
│   └── index.ts
```

---

## 4. Segments

Domain 레이어 슬라이스 내 세그먼트 종류:

| 세그먼트      | 역할                                                          |
|--------------|--------------------------------------------------------------|
| `__Mock__`   | MSW 핸들러, 테스트 목 데이터                                   |
| `Api`        | HTTP 호출 함수 + TanStack Query/Mutation 옵션 팩토리           |
| `Config`     | 상수 모음                                                     |
| `Model`      | hook, util, lib, 비즈니스 로직(상태관리, 소켓 등), Zustand store/logic |
| `Type`       | TypeScript 타입/인터페이스                                     |
| `Ui`         | React 컴포넌트                                                |

**확장**: 팀 논의를 통해 세그먼트를 추가할 수 있다. 모든 슬라이스에 모든 세그먼트가 필수는 아니며, 필요한 세그먼트만 생성한다.

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

| 세그먼트 | 그룹 예시                                          |
|---------|---------------------------------------------------|
| Model   | `Hook/`, `Store/`, `Logic/`, `Util/`, `Lib/`, `Socket/` |
| Api     | 파일 레벨 (그룹핑 불필요: `Get.ts`, `Query.ts` 등)     |
| Ui      | 컴포넌트 폴더들 (각 컴포넌트가 그룹)                    |

---

## 6. Public API (index.ts)

### 규칙

1. 모든 슬라이스 루트에 `index.ts` **필수**
2. Cross-slice import는 **반드시** `index.ts`를 통과
3. `__Mock__`은 public API에서 **export 하지 않음**
4. `export type` 사용 권장

### 예시

```typescript
// Entities/Chat/index.ts
export type { ChatMessage, ChatRoom } from './Type/Chat';
export { chatQueryOptions, chatQueryKeys } from './Api/Query';
export { getChatMessages } from './Api/Get';
export { useChat } from './Model/Hook/useChat';
export { useChatStore } from './Model/Store/useChatStore';
```

```typescript
// __Mock__은 export하지 않음
// export { chatHandlers } from './__Mock__/handlers'; ← 금지
```

---

## 7. Import Rules

### 같은 슬라이스: 상대 경로

```typescript
// Entities/Chat/Model/Hook/useChat.ts
import type { ChatMessage } from '../../Type/Chat';
import { chatQueryOptions } from '../../Api/Query';
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

Non-domain 레이어(App, Shared)는 슬라이스가 세그먼트 역할을 하므로, **레이어 내부 슬라이스 간 import는 상대 경로**를 사용한다:

```typescript
// Shared/Ui/Shadcn/button.tsx → Shared/Model 참조
import { cn } from '../../Model/Shadcn/Utils';
```

단, **shadcn CLI 생성 코드는 예외**로 `components.json` aliases에 정의된 절대 경로(index.ts 경유)를 허용한다:

```typescript
// shadcn CLI가 자동 생성하는 코드 (예외 허용)
import { cn } from '#/Shared/Model';
```

| 상황 | 경로 방식 | 예시 |
|------|----------|------|
| Non-domain 내부 (직접 작성) | 상대 경로 | `import { cn } from '../../Model/Shadcn/Utils'` |
| Non-domain 내부 (shadcn 생성) | 절대 경로 예외 (index.ts 경유) | `import { cn } from '#/Shared/Model'` |
| 외부 → Non-domain | 절대 경로 + index.ts | `import { Button } from '#/Shared/Ui'` |

### 순환 참조 해결

1. **공통 코드를 하위 레이어로 추출**: 순환 원인이 되는 공통 코드를 Entities나 Shared로 이동
2. **의존성 역전**: 인터페이스를 하위 레이어에 정의하고, 구현을 상위 레이어에서 주입

### 예외: `__Mock__` 테스트 파일

테스트 파일에서 `__Mock__` 세그먼트 직접 import 허용:

```typescript
// ChatMessage.test.ts
import { mockMessages } from '../__Mock__/chatMockData';
```

---

## 8. TanStack Query Integration

### Entities/Api: 읽기 전용

```
Entities/{Domain}/Api/
├── Get.ts        ← GET HTTP 함수
└── Query.ts      ← queryOptions factory + query keys
```

```typescript
// Entities/Chat/Api/Get.ts
import { httpClient } from '#/Shared/Api';
import type { ChatMessage } from '../Type/Chat';

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data } = await httpClient.get(`/chat/rooms/${roomId}/messages`);
  return data;
}
```

```typescript
// Entities/Chat/Api/Query.ts
import { queryOptions } from '@tanstack/react-query';
import { getChatMessages } from './Get';

export const chatQueryKeys = {
  all: ['chat'] as const,
  messages: (roomId: string) => [...chatQueryKeys.all, 'messages', roomId] as const,
};

export const chatQueryOptions = {
  messages: (roomId: string) =>
    queryOptions({
      queryKey: chatQueryKeys.messages(roomId),
      queryFn: () => getChatMessages(roomId),
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
└── Mutation.ts   ← mutationOptions factory + mutation keys
```

```typescript
// Features/ChatWrite/Api/Post.ts
import { httpClient } from '#/Shared/Api';
import type { SendMessageRequest } from '../Type/ChatWrite';

export async function postChatMessage(payload: SendMessageRequest) {
  const { data } = await httpClient.post('/chat/messages', payload);
  return data;
}
```

```typescript
// Features/ChatWrite/Api/Mutation.ts
import { postChatMessage } from './Post';

export const chatWriteMutationKeys = {
  send: ['chat', 'send'] as const,
};

export const chatWriteMutationOptions = {
  send: () => ({
    mutationKey: chatWriteMutationKeys.send,
    mutationFn: postChatMessage,
  }),
};
```

### Hook 래퍼 패턴

```typescript
// Entities/Chat/Model/Hook/useChatMessages.ts
import { useQuery } from '@tanstack/react-query';
import { chatQueryOptions } from '../../Api/Query';

export function useChatMessages(roomId: string) {
  return useQuery(chatQueryOptions.messages(roomId));
}
```

```typescript
// Features/ChatWrite/Model/Hook/useSendMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatQueryKeys } from '#/Entities/Chat';
import { chatWriteMutationOptions } from '../../Api/Mutation';

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...chatWriteMutationOptions.send(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(roomId),
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

## 10. File Naming

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

## 11. UI Component Structure

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
- **서브 컴포넌트 (TBD)**: 임시 규칙 - 같은 폴더에 sibling 파일로 배치

```
ChatMessageItem/
├── ChatMessageItem.tsx
├── ChatMessageBubble.tsx          ← 서브 컴포넌트 (sibling)
├── ChatMessageTimestamp.tsx       ← 서브 컴포넌트 (sibling)
├── ChatMessageItem.test.tsx
└── index.ts
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

## 12. Path Alias

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

## 13. Full Directory Tree

채팅 앱 기반 완전한 디렉토리 예시:

```
src/
├── App/
│   ├── Config/
│   │   └── env.ts
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
│   ├── ChatWritePage/
│   │   ├── Ui/
│   │   │   └── ChatWritePage/
│   │   │       ├── ChatWritePage.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   ├── ChatViewPage/
│   │   ├── Ui/
│   │   │   └── ChatViewPage/
│   │   │       ├── ChatViewPage.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   └── HomePage/
│       ├── Ui/
│       │   └── HomePage/
│       │       ├── HomePage.tsx
│       │       └── index.ts
│       └── index.ts
│
├── Widgets/
│   ├── ChatMessageList/
│   │   ├── Ui/
│   │   │   └── ChatMessageList/
│   │   │       ├── ChatMessageList.tsx
│   │   │       ├── ChatMessageList.test.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   ├── ChatInput/
│   │   ├── Model/
│   │   │   └── Hook/
│   │   │       └── useChatInput.ts
│   │   ├── Ui/
│   │   │   └── ChatInput/
│   │   │       ├── ChatInput.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   └── Header/
│       ├── Ui/
│       │   └── Header/
│       │       ├── Header.tsx
│       │       └── index.ts
│       └── index.ts
│
├── Features/
│   ├── ChatWrite/
│   │   ├── __Mock__/
│   │   │   └── chatWriteHandlers.ts
│   │   ├── Api/
│   │   │   ├── Post.ts
│   │   │   └── Mutation.ts
│   │   ├── Model/
│   │   │   ├── Hook/
│   │   │   │   └── useSendMessage.ts
│   │   │   └── Logic/
│   │   │       ├── useMessageLogic.ts
│   │   │       └── useChatWriteLogic.ts
│   │   ├── Type/
│   │   │   └── ChatWrite.ts
│   │   ├── Ui/
│   │   │   └── SendButton/
│   │   │       ├── SendButton.tsx
│   │   │       ├── SendButton.test.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   └── UserAuth/
│       ├── Api/
│       │   ├── Post.ts
│       │   └── Mutation.ts
│       ├── Model/
│       │   └── Hook/
│       │       └── useLogin.ts
│       ├── Type/
│       │   └── UserAuth.ts
│       └── index.ts
│
├── Entities/
│   ├── Chat/
│   │   ├── __Mock__/
│   │   │   └── chatMockData.ts
│   │   ├── Api/
│   │   │   ├── Get.ts
│   │   │   └── Query.ts
│   │   ├── Config/
│   │   │   └── ChatConfig.ts
│   │   ├── Model/
│   │   │   ├── Hook/
│   │   │   │   └── useChatMessages.ts
│   │   │   └── Store/
│   │   │       ├── MessageSlice.ts
│   │   │       ├── ConnectionSlice.ts
│   │   │       └── useChatStore.ts
│   │   ├── Type/
│   │   │   └── Chat.ts
│   │   ├── Ui/
│   │   │   ├── ChatMessageItem/
│   │   │   │   ├── ChatMessageItem.tsx
│   │   │   │   ├── ChatMessageBubble.tsx
│   │   │   │   ├── ChatMessageItem.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── ChatRoomCard/
│   │   │       ├── ChatRoomCard.tsx
│   │   │       └── index.ts
│   │   └── index.ts
│   └── User/
│       ├── Api/
│       │   ├── Get.ts
│       │   └── Query.ts
│       ├── Model/
│       │   └── Hook/
│       │       └── useUser.ts
│       ├── Type/
│       │   └── User.ts
│       ├── Ui/
│       │   └── UserAvatar/
│       │       ├── UserAvatar.tsx
│       │       └── index.ts
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
    │   ├── Shadcn/
    │   │   └── Utils.ts
    │   ├── DateFormat.ts
    │   └── index.ts
    ├── Type/
    │   ├── Common.ts
    │   └── index.ts
    └── Ui/
        ├── Shadcn/
        │   ├── button.tsx
        │   ├── input.tsx
        │   └── dialog.tsx
        ├── ErrorBoundary/
        │   ├── ErrorBoundary.tsx
        │   └── index.ts
        └── index.ts
```

---

## 14. Enforcement Mechanisms

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
    IF NOT subdomain_child_to_parent(source_slice, target_slice):
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

  IF cross_slice_import AND NOT targeting_index_ts:
    STOP
    EXPLAIN: "다른 슬라이스는 index.ts(public API)만 import 가능합니다"
```

### Check 4: Public API

```
AFTER creating a slice:
  IF slice_root does NOT have index.ts:
    WARN: "index.ts(public API)를 생성해야 합니다"

  IF index.ts exports __Mock__ segment:
    STOP
    EXPLAIN: "__Mock__은 public API에서 export하지 않습니다"
```

---

## 15. Test Code Management

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
| `__Mock__` 세그먼트와 역할 분리          | `__Mock__` = 공유 목 데이터/MSW 핸들러 전용   |
| 테스트 파일은 index.ts에서 export 안 함  | public API에 테스트 노출 금지                  |
| `__Mock__` 직접 import 허용             | 테스트 파일에서만 예외적으로 허용               |

---

## 16. Quick Reference

### "이 코드는 어디에?" 결정 트리

```
Q: 앱 초기화 / 프로바이더 / 라우팅?
  → App/

Q: 특정 URL 경로에 매핑되는 페이지?
  → Pages/{PageName}/

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
| 같은 슬라이스       | 상대 경로                     | `import { x } from '../../Type/Y'`  |
| 다른 슬라이스       | `#/Layer/Slice`              | `import { x } from '#/Entities/Chat'` |
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
| Query/Mutation | PascalCase  | `Query.ts`, `Mutation.ts`     |

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

## 17. Migration Strategy

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

## 18. Relationship to Other Rules

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
