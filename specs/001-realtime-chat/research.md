# 기술 연구: 실시간 채팅 앱

**Feature Branch**: `001-realtime-chat`
**Created**: 2026-01-21
**Research Phase**: 완료

## 실시간 통신 기술 선택

### Decision: Socket.IO 사용

**Rationale**:
- NestJS와의 완벽한 통합 지원 (`@nestjs/platform-socket.io`)
- 자동 재연결, 이벤트 기반 통신, 네임스페이스 지원
- 채팅방(room) 개념을 socket.io의 room 기능으로 직접 매핑 가능
- 브라우저 호환성과 폴백 지원 (WebSocket → polling)
- 실시간 참여자 관리와 메시지 브로드캐스팅이 간단

**Alternatives considered**:
- **WebSocket 표준**: 더 가볍지만 재연결, 이벤트 관리를 직접 구현해야 함
- **Server-Sent Events**: 단방향 통신으로 채팅 앱에 부적합

**Implementation Details**:
- Backend: `@nestjs/platform-socket.io`, `@nestjs/websockets`
- Frontend: `socket.io-client`
- Gateway 패턴으로 채팅 이벤트 처리

## 데이터 저장 방식

### Decision: 인메모리 저장 (실험용)

**Rationale**:
- 사용자 요구사항: "실험용이라서 redis까지 사용하지 않아도 괜찮아"
- Spec 명시사항: "세션 동안만 유지되며, 영구적으로 저장되지 않음"
- 개발 속도와 단순성 우선
- 서버 재시작 시 데이터 초기화되는 것이 실험용에는 적합

**Alternatives considered**:
- **Redis**: 실제 서비스에서는 권장되지만 실험용에는 과도한 설정
- **PostgreSQL**: 영구 저장이 필요하지 않음
- **하이브리드**: 복잡성 대비 실험용 가치 부족

**Implementation Details**:
- 채팅방: `Map<string, ChatRoom>` 형태로 메모리 저장
- 메시지: 각 채팅방 내부에 메시지 배열 보관
- 사용자: Socket 연결과 함께 관리되는 임시 사용자 객체

## 사용자 인증 및 세션 관리

### Decision: 세션 스토리지 + 랜덤 닉네임

**Rationale**:
- 사용자 요구사항: "실험용이라서 사용자 인증까지 안해도 될 것 같아"
- 세션 스토리지로 브라우저별 사용자 상태 관리
- 랜덤 닉네임으로 복잡한 회원가입/로그인 과정 제거
- Socket.IO 세션과 연동하여 실시간 연결 상태 추적

**Alternatives considered**:
- **JWT + 인증**: 실험용에는 과도한 복잡성
- **쿠키만 사용**: 보안과 실시간 연결 관리에 제한
- **로컬 스토리지**: 탭 간 격리가 없어 혼란 가능성

**Implementation Details**:
- Frontend: `sessionStorage`에 사용자 정보 저장
- 랜덤 닉네임: 형용사+명사 조합 생성 알고리즘
- Socket 연결 시 세션 정보로 사용자 식별

## 타입 공유 전략

### Decision: Backend-First 타입 생성

**Rationale**:
- 사용자 피드백: "shared는 chat에만 종속되어있는 느낌"
- Backend가 Single Source of Truth 역할 수행
- API 스키마와 실제 구현 간 동기화 자동 보장
- OpenAPI 표준 활용으로 도구 생태계 활용 가능

**Implementation Strategy**:

1. **HTTP API 타입 생성**:
   ```bash
   # NestJS에서 OpenAPI 스키마 자동 생성
   http://localhost:3001/api-docs-json

   # Frontend에서 자동 타입 생성
   openapi-generator-cli generate -i http://localhost:3001/api-docs-json -g typescript-fetch -o src/generated/api
   ```

2. **Socket.IO 타입 생성**:
   ```typescript
   // Backend: /api/socket-schema 엔드포인트
   @Controller('api/socket-schema')
   export class SchemaController {
     @Get()
     getSocketSchema() {
       return {
         clientToServer: {
           'join-room': { payload: JoinRoomPayload },
           'send-message': { payload: SendMessagePayload }
         },
         serverToClient: {
           'message-received': { payload: MessageReceivedPayload },
           'user-joined': { payload: UserJoinedPayload }
         }
       };
     }
   }
   ```

3. **개발 워크플로우**:
   ```json
   // Frontend package.json
   {
     "scripts": {
       "generate-types": "npm run generate-api && npm run generate-socket",
       "generate-api": "openapi-generator-cli generate -i http://localhost:3001/api-docs-json -g typescript-fetch -o src/generated/api",
       "generate-socket": "node scripts/generate-socket-types.js",
       "dev": "npm run generate-types && vite"
     }
   }
   ```

**Alternatives considered**:
- **각 앱에 타입 복사**: 동기화 관리 부담
- **Symbolic link**: OS 의존적이고 결국 중앙 집중형
- **npm 패키지 발행**: 실험용에는 과도한 복잡성

## 프로젝트 구조

### Decision: spec-kit-lab 워크스페이스 활용

**Rationale**:
- 사용자 명시: "spec-kit-lab이 루트 워크스페이스"
- 기존 설정 활용으로 빠른 시작 가능
- Backend-First 타입 생성으로 shared 폴더 불필요
- 독립적인 두 애플리케이션으로 병렬 개발 가능

**Project Structure**:
```
spec-kit-lab/                # 기존 루트 워크스페이스
├── chat-fe-with-claude/     # React + Vite frontend
│   └── src/generated/      # 🔄 자동 생성된 타입들
├── chat-be-with-claude/     # NestJS backend
│   └── swagger.json        # 🔄 자동 생성된 OpenAPI 스펙
└── specs/001-realtime-chat/ # 프로젝트 명세 (참고용)
```

**Alternatives considered**:
- **별도 모노레포 생성**: 기존 워크스페이스 설정 중복
- **공유 패키지 유지**: 중앙 집중형 관리 부담

## 개발 환경 통신

### Decision: Vite 프록시 설정

**Rationale**:
- 사용자 선택한 권장 방식
- CORS 문제 완전 해결
- 실제 배포 환경과 유사한 단일 도메인 경험
- Socket.IO와 HTTP API 모두 같은 프록시로 처리 가능

**Configuration**:
- Vite dev server (localhost:5173) → NestJS (localhost:3001)
- `/api/*` 경로는 HTTP API로 프록시
- `/socket.io/*` 경로는 Socket.IO로 프록시

**Alternatives considered**:
- **CORS 허용**: 개발/배포 환경 차이로 예상치 못한 문제 발생 가능
- **동일 포트**: NestJS에서 정적 파일 서빙 시 개발 편의성 감소

## Socket.IO 이벤트 설계

### Decision: 이벤트 기반 채팅 아키텍처

**Core Events**:
- `join-lobby`: 로비 입장
- `create-room`: 새 방 생성
- `join-room`: 방 참여
- `leave-room`: 방 나가기
- `send-message`: 메시지 전송
- `room-updated`: 방 정보 변경 알림
- `user-joined`: 사용자 입장 알림
- `user-left`: 사용자 퇴장 알림
- `disconnect`: 연결 해제 처리

**Room Management**:
- Socket.IO의 내장 room 기능 활용
- 방별 사용자 목록과 메시지 관리
- 30초 연결 해제 감지 후 자동 정리

## 성능 최적화 전략

### Decision: 단순한 실시간 최적화

**Message Broadcasting**:
- 방별 이벤트 브로드캐스팅으로 불필요한 트래픽 차단
- 메시지 크기 제한 (500자) 으로 네트워크 부하 제어

**Memory Management**:
- 빈 방 자동 삭제로 메모리 누수 방지
- 연결 해제된 사용자 정리로 좀비 세션 방지

**Frontend Optimization**:
- Socket 이벤트 리스너 정리로 메모리 누수 방지
- 채팅 메시지 가상화는 실험용에서 제외

## 테스팅 전략

### Decision: 기본 테스트 커버리지

**Frontend Testing**:
- Socket.IO 연결과 이벤트 발송/수신 테스트
- 채팅 UI 컴포넌트 단위 테스트
- E2E 테스트는 핵심 플로우만 (방 생성→입장→메시지 전송)

**Backend Testing**:
- Gateway 이벤트 핸들러 단위 테스트
- 방 생성/삭제 로직 통합 테스트
- Socket.IO 연결 시나리오 E2E 테스트

**실험용 제한사항**:
- 부하 테스트나 확장성 테스트는 제외
- 복잡한 에지 케이스 테스트는 최소화

## 배포 고려사항

### Decision: 개발 중심 배포

**Development Priority**:
- 로컬 개발 환경에서 완전한 기능 구현
- Docker 컨테이너화는 선택사항
- 프로덕션 배포는 실험 단계에서 고려 사항 아님

**Scaling Considerations** (향후):
- Socket.IO Redis Adapter로 다중 서버 지원 가능
- 데이터베이스 도입 시 메시지 영속성 구현
- Load Balancer의 sticky session 설정 필요

## 결론

이 기술 스택은 **실험용 실시간 채팅 앱**이라는 목적에 최적화되어 있습니다:

- **단순성**: 복잡한 인증, 데이터베이스, 배포 설정 제거
- **실시간성**: Socket.IO로 즉각적인 양방향 통신 구현
- **개발 효율성**: 모노레포와 프록시 설정으로 개발 경험 최적화
- **확장 가능성**: 필요 시 인증, DB, Redis 등을 점진적으로 추가 가능

모든 기술 선택이 사용자 요구사항("실험용", "병렬 개발", "NestJS 사용")과 스펙 요구사항(실시간 채팅, 자동 방 삭제, 세션 기반 데이터)에 부합하도록 설계되었습니다.
