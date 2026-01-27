# 🚀 실시간 채팅 앱 - Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7+-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4+-38B2AC.svg)](https://tailwindcss.com/)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-192kB-brightgreen.svg)](https://bundlephobia.com/)

**최대 5명이 참여할 수 있는 실시간 채팅 애플리케이션의 프론트엔드**

Socket.IO를 활용한 실시간 통신으로 사용자들이 채팅방을 생성하고 참여하여 메시지를 주고받을 수 있습니다.

---

## ✨ 주요 기능

### 🎯 **User Stories**
- **US1**: 사용자 로비 입장 및 닉네임 설정 (랜덤 닉네임 지원)
- **US2**: 실시간 채팅 기능 (Socket.IO 기반)
- **US3**: 채팅방 목록 조회 및 관리 (참여자 수 표시)
- **US4**: 새로운 채팅방 생성
- **US5**: 기존 채팅방 참여 (최대 5명 제한)
- **US6**: 채팅방 자동 삭제 시스템 (30초 연결 해제 감지)

### 🔧 **기술적 특징**
- **실시간 통신**: Socket.IO 클라이언트로 실시간 메시지 송수신
- **연결 상태 모니터링**: 30초 타임아웃 감지 및 자동 재연결
- **종합적 에러 처리**:
  - ErrorBoundary와 Toast 시스템으로 전역 에러 관리
  - 네트워크 상태 모니터링 및 연결성 체크
  - 자동 재시도 메커니즘과 사용자 친화적 오류 복구
- **로딩 상태**: 모든 비동기 작업에 대한 세분화된 로딩 UI 제공
- **성능 최적화**:
  - 코드 분할로 초기 번들 크기 47% 감소 (359kB → 192kB)
  - 벤더 라이브러리별 청크 분리로 캐싱 최적화
  - 실시간 성능 모니터링 및 메모리 사용량 추적
- **반응형 디자인**: 모바일/데스크톱 모든 화면 크기 지원

---

## 🏗️ 아키텍처

### **FSD (Feature-Sliced Design) 아키텍처**

```
src/
├── app/                    # 앱 설정 및 프로바이더
│   ├── providers/         # React Query, Socket, Toast, ErrorBoundary
│   └── router/           # 라우팅 설정
├── pages/                 # 페이지 컴포넌트
│   ├── nickname-setup/   # 닉네임 설정 페이지
│   ├── lobby/            # 로비 (방 목록)
│   ├── chat-room/        # 채팅방
│   └── error/            # 에러 페이지
├── widgets/               # 독립적 UI 블록
│   ├── header/           # 앱 헤더
│   ├── room-list/        # 방 목록 위젯
│   ├── message-list/     # 메시지 목록
│   └── chat-input/       # 채팅 입력
├── features/              # 사용자 상호작용 기능
│   ├── users/            # 사용자 관련 (닉네임, 세션)
│   ├── rooms/            # 방 관련 (생성, 목록)
│   └── chat/             # 채팅 관련 (메시지, 참여, 나가기)
├── entities/              # 비즈니스 엔티티
│   ├── user/             # 사용자 엔티티
│   ├── chat-room/        # 채팅방 엔티티
│   └── message/          # 메시지 엔티티
├── shared/                # 공용 코드
│   ├── ui/               # 공용 UI 컴포넌트
│   ├── hooks/            # 공용 훅 (에러처리, 네트워크, 로딩상태)
│   ├── lib/              # 유틸리티
│   ├── utils/            # 성능 모니터링, 유틸 함수
│   └── constants/        # 상수
└── generated/             # 백엔드에서 자동 생성된 타입
    ├── api/              # REST API 클라이언트
    └── socket-types.ts   # Socket.IO 이벤트 타입
```

---

## 🚀 빠른 시작

### **사전 요구사항**
- Node.js 18+
- pnpm (권장) 또는 npm
- Backend 서버 (chat-be-with-claude) 실행 중

### **설치 및 실행**

```bash
# 의존성 설치
pnpm install

# 타입 생성 (Backend에서 자동 생성)
pnpm generate-types

# 개발 서버 시작
pnpm dev
```

### **스크립트**

```bash
# 개발
pnpm dev                    # 개발 서버 (http://localhost:5173)
pnpm generate-types         # Backend에서 타입 자동 생성

# 빌드 및 배포
pnpm build                  # 프로덕션 빌드
pnpm preview                # 빌드 미리보기

# 코드 품질
pnpm type-check             # TypeScript 타입 검사
pnpm lint                   # ESLint 검사
pnpm test                   # 단위 테스트 실행
pnpm test:ui                # 테스트 UI 실행
```

---

## ⚡ 성능 최적화

### **번들 최적화**
- **메인 번들 크기**: 359kB → **192kB** (47% 감소)
- **코드 분할**: 라이브러리별 청크 분리
  ```
  react-vendor.js     (88.6kB) - React 코어
  query-vendor.js     (43.9kB) - TanStack Query
  socket-vendor.js    (41.2kB) - Socket.IO
  icon-vendor.js      (5.5kB)  - Lucide Icons
  ui-vendor.js        (0.04kB) - Form & State
  ```

### **로딩 성능**
- **초기 로딩**: 최적화된 청크 로딩으로 빠른 페이지 렌더링
- **캐싱 전략**: 벤더 라이브러리별 분리로 업데이트시 효율적 캐싱
- **트리 쉐이킹**: 사용하지 않는 코드 자동 제거

### **런타임 모니터링**
- **메모리 추적**: 실시간 메모리 사용량 모니터링
- **성능 메트릭**: First Paint, FCP, DOM 로딩 시간 측정
- **개발 도구**: 개발 환경에서 자동 성능 체크 (`window.performanceMonitor`)

---

## 🔌 Backend 연동

### **Backend-First 타입 생성**
프론트엔드는 백엔드에서 자동 생성되는 타입을 사용합니다:

```typescript
// 자동 생성된 Socket.IO 타입
import type {
  MessageData,
  RoomData,
  UserData
} from '@/generated/socket-types'

// 자동 생성된 REST API 클라이언트
import { roomsApi } from '@/generated/api'
```

### **Socket.IO 이벤트**

**클라이언트 → 서버**:
```typescript
socket.emit('join-room', { roomId: 'room-123' })
socket.emit('leave-room', { roomId: 'room-123' })
socket.emit('send-message', { roomId: 'room-123', content: '안녕하세요!' })
```

**서버 → 클라이언트**:
```typescript
socket.on('room-joined', (data) => { /* 방 참여 성공 */ })
socket.on('room-left', (data) => { /* 방 나가기 완료 */ })
socket.on('new-message', (data) => { /* 새 메시지 수신 */ })
socket.on('user-activity', (data) => { /* 사용자 활동 알림 */ })
socket.on('forced-leave', (data) => { /* 강제 퇴장 (방 삭제 등) */ })
```

---

## 🛠️ 기술 스택

### **핵심 기술**
- **React 19** - 최신 UI 라이브러리 (Concurrent Features)
- **TypeScript 5.9** - 정적 타입 검사 (Strict Mode)
- **Vite 7** - 빠른 빌드 도구 및 개발 서버
- **Socket.IO Client 4.8** - 실시간 통신

### **상태 관리**
- **TanStack Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **React Hook Form** - 폼 상태 관리

### **스타일링 및 UI**
- **TailwindCSS** - 유틸리티-퍼스트 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **커스텀 UI 컴포넌트** - ErrorBoundary, Toast, LoadingSpinner 등

### **테스팅**
- **Vitest** - 단위 테스트 프레임워크
- **React Testing Library** - React 컴포넌트 테스트

---

## 📱 화면 구성

### **1. 닉네임 설정** (`/`)
- 사용자 닉네임 입력 (선택사항)
- 랜덤 닉네임 자동 생성
- 세션 저장 및 로비 이동

### **2. 로비** (`/lobby`)
- 활성 채팅방 목록 표시
- 각 방의 참여자 수 (예: 3/5)
- 새 방 생성 버튼
- 방 클릭으로 참여

### **3. 채팅방** (`/room/:roomId`)
- 실시간 메시지 목록
- 메시지 입력 및 전송
- 참여자 사이드바
- 방 나가기 버튼 (헤더, 사이드바)

---

## 🔧 개발 가이드

### **컴포넌트 개발**
```typescript
// FSD 아키텍처를 따른 컴포넌트 구조
src/features/chat/send-message/
├── ui/              # UI 컴포넌트
├── model/           # 비즈니스 로직
├── hooks/           # 커스텀 훅
└── index.ts         # Public API
```

### **종합적 에러 처리**
```typescript
import { useErrorHandler, useNetworkStatus } from '@/shared/hooks'
import { useToast } from '@/app/providers'

function MyComponent() {
  const { error, success } = useToast()
  const handleError = useErrorHandler()
  const { isOnline, isSlowConnection } = useNetworkStatus()

  const handleApiCall = async () => {
    try {
      await api.call()
      success('작업이 완료되었습니다')
    } catch (err) {
      handleError(err, 'API 호출 중', () => handleApiCall())
    }
  }

  // 네트워크 상태에 따른 UI 조건부 렌더링
  if (!isOnline) {
    return <NetworkErrorMessage />
  }
}
```

### **고급 로딩 상태 관리**
```typescript
import { LoadingButton, LoadingSpinner } from '@/shared/ui'
import { useLoadingState } from '@/shared/hooks'

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoadingState()

  const handleSubmit = async () => {
    startLoading('submitting') // 네임스페이스별 로딩
    try {
      await api.submit()
    } finally {
      stopLoading('submitting')
    }
  }

  return (
    <>
      <LoadingButton
        loading={isLoading('submitting')}
        onClick={handleSubmit}
        loadingText="처리 중..."
        disabled={isLoading('any')} // 전역 로딩 체크
      >
        전송하기
      </LoadingButton>

      {isLoading() && <LoadingSpinner text="로딩 중..." />}
    </>
  )
}
```

### **성능 모니터링**
```typescript
import { performanceMonitor } from '@/shared/utils'

// 개발 환경에서 성능 메트릭 확인
function DevComponent() {
  useEffect(() => {
    // 3초 후 자동 로깅
    setTimeout(() => {
      performanceMonitor.logMetrics()

      // 메모리 사용량이 70% 초과시 경고
      performanceMonitor.checkMemoryThreshold(70)
    }, 3000)
  }, [])
}

// 브라우저 콘솔에서 직접 확인 (개발 환경)
// window.performanceMonitor.getMetrics()
// window.performanceMonitor.logMetrics()
```

---

## 🧪 테스트

### **테스트 실행**
```bash
pnpm test              # 단위 테스트
pnpm test:ui           # 테스트 UI로 실행
```

### **테스트 작성 예시**
```typescript
import { render, screen } from '@testing-library/react'
import { SendMessageFeature } from './SendMessageFeature'

test('메시지 전송 기능 테스트', () => {
  render(<SendMessageFeature roomId="test-room" />)

  const input = screen.getByPlaceholderText('메시지를 입력하세요...')
  const button = screen.getByRole('button', { name: /전송/i })

  expect(input).toBeInTheDocument()
  expect(button).toBeInTheDocument()
})
```

---

## 🚨 트러블슈팅

### **일반적인 문제**

1. **타입 생성 오류**
   ```bash
   # Backend 서버가 실행 중인지 확인
   pnpm generate-types
   ```

2. **Socket 연결 실패**
   ```bash
   # Backend 서버 주소 확인 (vite.config.ts)
   # CORS 설정 확인
   ```

3. **빌드 오류**
   ```bash
   # 타입 검사 후 빌드
   pnpm type-check
   pnpm build
   ```

---

## 📞 지원

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 활용해주세요.

---

## 📄 라이센스

이 프로젝트는 실험용 프로젝트입니다.

---

**🔗 관련 링크**
- [Backend Repository](../chat-be-with-claude/) - NestJS Backend
- [Specification](../../specs/001-realtime-chat/spec.md) - 기능 명세서
- [Technical Plan](../../specs/001-realtime-chat/plan.md) - 기술 설계 문서