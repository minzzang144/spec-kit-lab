# Quickstart: 001-realtime-chat

**Branch**: `001-realtime-chat`  
**Date**: 2025-01-27

모노레포(pnpm + Turborepo) 기준 로컬 실행·빌드·테스트 요약.

---

## 1. 사전 요구

- **Node.js** 18+
- **pnpm** 8+

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 2. 설치

```bash
cd /path/to/spec-kit-lab
pnpm install
```

---

## 3. 스크립트 (루트 package.json)

| 스크립트 | 설명 |
|----------|------|
| `pnpm run build` | `apps/chat-fe`, `apps/chat-be` 각각(또는 동시) 빌드. packages 의존 없음. |
| `pnpm run dev` | FE(5173), BE(3000) 개발 서버 동시 실행. (또는 `turbo run dev --filter=chat-fe` 등 개별.) |
| `pnpm run lint` | 전체 lint. |
| `pnpm run format` | Prettier 포맷. |
| `pnpm run test` | FE(Vitest), BE(Jest) 테스트. |
| `pnpm run test:e2e` | FE Playwright E2E (BE 필요). |

---

## 4. 환경 변수

### BE (`apps/chat-be`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3000` | HTTP + WebSocket 서버 포트. |
| `FE_ORIGIN` | `http://localhost:5173` | CORS origin. Vite 기본. |

### FE (`apps/chat-fe`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_URL` | `http://localhost:3000` | REST `GET /rooms`, `POST /rooms` 베이스 URL. |
| `VITE_WS_URL` | `http://localhost:3000` | Socket.IO 연결 URL. |

---

## 5. 포트

| 앱 | 기본 포트 |
|----|-----------|
| chat-fe (Vite) | 5173 |
| chat-be (NestJS) | 3000 |

---

## 6. 실행 순서 (로컬)

1. 터미널 1: `pnpm run dev` (또는 `turbo run dev`) — FE, BE 동시.
2. 또는 개별:
   - `pnpm --filter chat-be run start:dev`
   - `pnpm --filter chat-fe run dev`
3. 브라우저: `http://localhost:5173`

---

## 7. 배포·프로덕션 (참고)

- **FE**: `pnpm --filter chat-fe run build` → `dist/`를 정적 호스팅.
- **BE**: `pnpm --filter chat-be run build` → `dist/` 실행: `node dist/main` (또는 `nest start --prod`).
- 실험용이므로 In-memory 유지. 다중 인스턴스·영속화는 범위 외.

---

## 8. 문서·계약

- 스펙: `specs/001-realtime-chat/spec.md`
- 설계: `plan.md`, `research.md`, `data-model.md`
- API: `contracts/openapi.yaml`, `contracts/socket-events.md`
