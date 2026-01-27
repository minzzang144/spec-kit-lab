# 퀵스타트 가이드: 실시간 채팅 앱

**Feature Branch**: `001-realtime-chat`
**Created**: 2026-01-21

이 문서는 개발자가 실시간 채팅 앱을 신속하게 설정하고 실행할 수 있도록 안내합니다.

## 📋 전제 조건

### 필수 도구
- **Node.js**: v18.0.0 이상
- **pnpm**: v8.0.0 이상 (권장 패키지 매니저)
- **Git**: 최신 버전

### 개발 환경
- **OS**: macOS, Linux, Windows (WSL2 권장)
- **에디터**: VS Code (권장) 또는 WebStorm
- **브라우저**: Chrome, Firefox, Safari (WebSocket 지원)

## 🚀 빠른 시작 (Backend-First 방식)

### 💡 핵심 컨셉: Backend-First 타입 생성

이 프로젝트는 **Backend가 타입의 소스 오브 트루스**가 되는 방식을 채택했습니다:
1. ✅ Backend에서 NestJS + Swagger로 API 타입 자동 생성
2. ✅ Backend에서 Socket.IO 이벤트 타입도 JSON으로 제공
3. ✅ Frontend에서 자동 타입 생성 도구로 TypeScript 타입 생성
4. ✅ 개발 시 Backend → Frontend 순서로 진행

### 1단계: 현재 워크스페이스에서 시작

```bash
# spec-kit-lab 디렉터리에서 시작 (이미 있다고 가정)
cd spec-kit-lab

# package.json에 워크스페이스가 이미 설정되어 있다고 가정
# 확인: chat-fe-with-claude, chat-be-with-claude가 workspaces에 포함되어 있는지

# 워크스페이스 확인
cat package.json | grep -A 10 workspaces
```

### 2단계: Backend 먼저 생성 (타입 소스)

```bash
# NestJS 프로젝트 생성
pnpm create nest-app chat-be-with-claude
cd chat-be-with-claude

# Socket.IO 및 필수 의존성 설치
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm add @nestjs/swagger swagger-ui-express  # 🔄 OpenAPI 자동 생성
pnpm add @nestjs/config class-validator class-transformer
pnpm add uuid
pnpm add -D @types/uuid

# 기본 Swagger 설정 (main.ts에 추가)
cat >> src/main.ts << 'EOF'

// Swagger 설정 추가
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('실시간 채팅 API')
    .setDescription('Backend-First 타입 생성 실험')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // JSON 스키마도 제공 (타입 생성용)
  app.use('/api-docs-json', (req, res) => {
    res.json(document);
  });

  await app.listen(3001);
}
bootstrap();
EOF

cd ..
```

### 3단계: Frontend 애플리케이션 생성 (타입 소비자)

```bash
# React + Vite 프로젝트 생성
pnpm create vite chat-fe-with-claude --template react-ts
cd chat-fe-with-claude

# 필수 의존성 설치
pnpm add socket.io-client
pnpm add @tanstack/react-query zustand
pnpm add react-hook-form @hookform/resolvers zod
pnpm add tailwindcss @types/tailwindcss autoprefixer
pnpm add lucide-react

# 🔄 타입 생성 도구 설치
pnpm add -D @openapitools/openapi-generator-cli

# TailwindCSS 초기화
pnpm dlx tailwindcss init -p

# 타입 생성 스크립트 추가
mkdir scripts
cat > scripts/generate-socket-types.js << 'EOF'
// Socket.IO 타입 자동 생성 스크립트
const fs = require('fs');
const path = require('path');

async function generateSocketTypes() {
  try {
    // Backend에서 Socket.IO 스키마 fetch
    const response = await fetch('http://localhost:3001/api/socket-schema');
    const schema = await response.json();

    // TypeScript 타입으로 변환
    let typeDefs = '// 🔄 자동 생성된 Socket.IO 타입\n\n';

    // ClientToServer 이벤트 타입 생성
    typeDefs += 'export interface ClientToServerEvents {\n';
    for (const [event, config] of Object.entries(schema.clientToServer)) {
      typeDefs += `  '${event}': (data: ${config.payload.name}) => void;\n`;
    }
    typeDefs += '}\n\n';

    // ServerToClient 이벤트 타입 생성
    typeDefs += 'export interface ServerToClientEvents {\n';
    for (const [event, config] of Object.entries(schema.serverToClient)) {
      typeDefs += `  '${event}': (data: ${config.payload.name}) => void;\n`;
    }
    typeDefs += '}\n';

    // 생성된 타입 저장
    const outputDir = path.join(__dirname, '../src/generated');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'socket-types.ts'), typeDefs);

    console.log('✅ Socket.IO 타입 생성 완료');
  } catch (error) {
    console.error('❌ Socket.IO 타입 생성 실패:', error.message);
  }
}

generateSocketTypes();
EOF

cd ..
```

### 4단계: Frontend 타입 생성 스크립트 설정

```bash
# Frontend package.json에 타입 생성 스크립트 추가
cd chat-fe-with-claude

# package.json scripts 섹션에 추가
cat package.json | jq '.scripts += {
  "generate-types": "npm run generate-api && npm run generate-socket",
  "generate-api": "openapi-generator-cli generate -i http://localhost:3001/api-docs-json -g typescript-fetch -o src/generated/api",
  "generate-socket": "node scripts/generate-socket-types.js",
  "dev": "npm run generate-types && vite",
  "dev:no-gen": "vite"
}' > temp.json && mv temp.json package.json

cd ..
```

### 5단계: Backend-First 개발 서버 실행

```bash
# 1. 먼저 Backend 실행 (타입 소스)
cd chat-be-with-claude
pnpm run start:dev

# 2. 별도 터미널에서 Frontend 실행 (타입 생성 + 시작)
cd chat-fe-with-claude
pnpm dev  # 자동으로 타입 생성 후 Vite 실행
```

**개발 서버 접근 URL**:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs (Swagger UI)
- **OpenAPI JSON**: http://localhost:3001/api-docs-json (타입 생성용)
- **Socket Schema**: http://localhost:3001/api/socket-schema (Socket.IO 타입용)

## 🏗️ 아키텍처 개요

### 프로젝트 구조
```
chat-realtime-monorepo/
├── chat-fe-with-claude/     # React Frontend
│   ├── src/
│   │   ├── app/            # 앱 초기화, 라우팅
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── widgets/        # 복합 UI 블록
│   │   ├── features/       # 사용자 기능
│   │   ├── entities/       # 비즈니스 엔티티
│   │   └── shared/         # 공통 유틸리티
│   └── vite.config.ts      # Vite 설정 (프록시 포함)
├── chat-be-with-claude/     # NestJS Backend
│   ├── src/
│   │   ├── modules/        # 기능별 모듈
│   │   │   ├── chat/      # 채팅 관련 로직
│   │   │   ├── users/     # 사용자 관리
│   │   │   └── rooms/     # 방 관리
│   │   ├── common/        # 공통 유틸리티
│   │   └── main.ts        # 애플리케이션 엔트리포인트
│   └── nest-cli.json      # NestJS 설정
├── shared/                  # 타입 정의 공유
│   └── src/
│       ├── socket-events.ts # Socket.IO 이벤트 타입
│       └── http-api.ts      # HTTP API 타입
└── package.json            # 워크스페이스 설정
```

### 기술 스택
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: NestJS + TypeScript + Socket.IO
- **상태 관리**: TanStack Query (서버 상태) + Zustand (클라이언트 상태)
- **실시간 통신**: Socket.IO (WebSocket 기반)
- **폼 관리**: React Hook Form + Zod
- **스타일링**: TailwindCSS + Lucide Icons

## 🔧 구성 설정

### Frontend Vite 프록시 설정

`chat-fe-with-claude/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
      },
    },
  },
})
```

### Backend CORS 설정

`chat-be-with-claude/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (개발 환경용)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // API 경로 접두사
  app.setGlobalPrefix('api');

  await app.listen(3001);
}
bootstrap();
```

## 📱 주요 기능 구현 순서

### Phase 1: 기본 구조 (1-2일)
1. ✅ 프로젝트 설정 완료
2. 🔄 기본 UI 컴포넌트 생성 (로비, 채팅방)
3. 🔄 Socket.IO 연결 설정
4. 🔄 인메모리 데이터 저장소 구현

### Phase 2: 핵심 기능 (2-3일)
1. 사용자 닉네임 설정 & 랜덤 생성
2. 채팅방 생성 & 목록 조회
3. 실시간 메시지 송수신
4. 방 참여자 관리

### Phase 3: 고도화 (1-2일)
1. 연결 끊김 감지 & 자동 정리
2. 빈 방 자동 삭제
3. 에러 처리 & 사용자 피드백
4. 기본 테스트 작성

## 🧪 테스트 실행

```bash
# 전체 테스트 실행
pnpm test

# Frontend 테스트
cd chat-fe-with-claude
pnpm test

# Backend 테스트
cd chat-be-with-claude
pnpm test
pnpm test:e2e
```

## 📦 빌드 & 배포

```bash
# 전체 빌드
pnpm build

# 타입 검사
pnpm type-check

# 린트 검사
pnpm lint
```

## 🔍 개발 도구

### VS Code 권장 확장
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Thunder Client (API 테스트용)

### 유용한 스크립트
```bash
# 전체 의존성 업데이트
pnpm update --recursive

# 특정 패키지 설치 (shared)
pnpm add -w some-package

# 워크스페이스 클린업
pnpm store prune
```

## 🚨 트러블슈팅

### 자주 발생하는 문제들

**1. Socket.IO 연결 실패**
```bash
# Backend 서버가 실행 중인지 확인
curl http://localhost:3001/api/health

# 브라우저 개발자 도구에서 네트워크 탭 확인
# CORS 에러가 있다면 Backend CORS 설정 점검
```

**2. 타입 에러**
```bash
# 공유 패키지 재빌드
cd shared && pnpm build

# 타입 캐시 클리어
pnpm dlx tsc --build --clean
```

**3. 개발 서버 포트 충돌**
```bash
# 포트 사용 확인
lsof -ti:3001
lsof -ti:5173

# 다른 포트로 실행
PORT=3002 pnpm dev
```

## 📚 추가 리소스

- [Socket.IO 공식 문서](https://socket.io/docs/)
- [NestJS WebSocket 가이드](https://docs.nestjs.com/websockets/gateways)
- [React Query 문서](https://tanstack.com/query/latest)
- [TailwindCSS 문서](https://tailwindcss.com/docs)

## 🤝 기여 방법

1. 기능별로 브랜치 생성: `feature/user-nickname-system`
2. 작은 단위로 커밋: `feat(users): implement random nickname generation`
3. Pull Request 생성 전 테스트 실행
4. 코드 리뷰 후 main 브랜치에 머지

---

**다음 단계**: 이제 `/speckit.tasks` 명령어를 실행하여 구체적인 구현 작업들을 작업 단위로 나누어 보세요.