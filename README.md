# 실시간 채팅 (모노레포)

모노레포(pnpm + Turborepo) 기반 실시간 채팅 앱. FE(`apps/chat-fe-with-cursor`)와 BE(`apps/chat-be-with-cursor`)로 구성되어 있으며, **현재 FE만 구현**된 상태입니다.

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
pnpm run build   # FE 빌드
pnpm run dev     # FE 개발 서버 (http://localhost:5173)
pnpm run lint
pnpm run format
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
