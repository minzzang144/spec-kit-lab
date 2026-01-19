# 실시간 채팅 (모노레포)

모노레포(pnpm + Turborepo) 기반 실시간 채팅 앱. FE(`apps/chat-fe-with-cursor`)와 BE(`apps/chat-be-with-cursor`)로 구성됩니다.

## 요구 사항

- Node.js 18+
- pnpm 8+

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## 설치 및 실행

```bash
pnpm install
pnpm run build   # FE, BE 빌드
pnpm run dev     # FE, BE 개발 서버
pnpm run lint
pnpm run format
pnpm run test
```

**E2E (Playwright) 처음 실행 전** 브라우저 설치:

```bash
pnpm --filter chat-fe-with-cursor exec playwright install
```

## FE 전용 실행

BE 없이 FE만 실행하면 로비·방 목록·방 입장·메시지 송수신은 **백엔드(채팅 서버)가 떠 있어야** 동작합니다.

```bash
pnpm --filter chat-fe-with-cursor run dev
```

- **VITE_API_URL** (기본: `http://localhost:3000`): REST `GET /rooms`, `POST /rooms`
- **VITE_WS_URL** (기본: `http://localhost:3000`): Socket.IO 연결

## 상세

- **Quickstart·스펙·계약**: `specs/001-realtime-chat/quickstart.md`, `spec.md`, `contracts/`
