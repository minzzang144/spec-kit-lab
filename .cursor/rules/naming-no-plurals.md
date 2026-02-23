# Naming Convention: No Plurals

> **STATUS: ACTIVE**
> 모든 프로젝트에 적용되는 네이밍 규칙입니다.

---

## 원칙

복수형 접미사(`-s`, `-es`, `-ies`)를 사용하지 않고, **의미를 드러내는 서술적 접미사**를 사용한다.

```
❌ Chats, Notes, Categories, Messages
✅ ChatList, NoteGroup, CategorySelect, MessageFeed
```

## 서술적 접미사 예시

| 접미사 | 의미 | 예시 |
|--------|------|------|
| `List` | 순서가 있는 목록 | `NoteList`, `ChatRoomList` |
| `Group` | 논리적 그룹 | `CategoryGroup`, `TagGroup` |
| `Map` | key-value 매핑 | `UserMap`, `CategoryMap` |
| `Set` | 중복 없는 집합 | `TagSet`, `PermissionSet` |
| `Feed` | 스트림/피드 | `MessageFeed`, `ActivityFeed` |
| `Queue` | 순서 있는 대기열 | `TaskQueue`, `EventQueue` |

접미사는 위 목록에 한정되지 않으며, 맥락에 맞는 서술적 이름을 자유롭게 사용한다.

## 적용 범위

| 대상 | 규칙 | 예시 |
|------|------|------|
| 디렉토리/파일명 | 복수형 금지 | `NoteList/`, `CategoryGroup.tsx` |
| 컴포넌트/클래스명 | 복수형 금지 | `NoteList`, `CategorySelector` |
| 함수명 | 복수형 금지 | `getNoteList()`, `fetchCategoryGroup()` |
| 타입/인터페이스명 | 복수형 금지 | `NoteFilter`, `CategoryOption` |
| 지역 변수 | 복수형 금지 **(TBD)** | `const noteList = ...` |

### 지역 변수 TBD

지역 변수의 복수형 금지는 현재 **시행 중이나 검토 대상**이다:

```typescript
// 현재 적용 중
const noteList = data.filter(note => note.categoryId === id);
noteList.map(note => ...)

// 추후 검토 시 허용 가능성
const notes = data.filter(note => note.categoryId === id);
notes.map(note => ...)
```

최종 결정 전까지는 복수형 금지를 유지한다.

## 타입 작성 시 주의

배열 타입에 별도 wrapper를 만들지 않는다. `Note[]`로 충분한 경우 그대로 사용:

```typescript
// ✅ 좋음 — Note[]로 충분
function getNoteList(): Promise<Note[]>

// ❌ 불필요 — 단순 alias
type NoteListResponse = Note[];

// ✅ 좋음 — 메타데이터가 있을 때만 래퍼 타입 생성
type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
};
```

## 예외

- 외부 라이브러리/API 응답 필드명은 변경하지 않는다
- 구조 분해 시 리네이밍으로 대응:
  ```typescript
  const { notes: noteList } = await response.json();
  ```
