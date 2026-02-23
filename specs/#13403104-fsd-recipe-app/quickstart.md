# Quickstart: Recipe Book App

**Branch**: `spec/#13403104-fsd-recipe-app` | **Date**: 2026-02-23

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# From monorepo root
cd apps/recipe-app
pnpm install
npx msw init public/ --save
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | TypeScript check + Vite production build |
| `pnpm preview` | Preview production build |
| `pnpm type-check` | TypeScript type checking |
| `pnpm lint` | ESLint check |
| `pnpm format` | Prettier format |
| `pnpm format:check` | Prettier format check |
| `pnpm test` | Run Vitest (unit/integration) |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:e2e` | Run Playwright E2E tests |

Note: Use `pnpm` with the `dev` script to start Vite development server.

## Path Alias

`#/` maps to `src/`:

```typescript
// tsconfig.json
{ "compilerOptions": { "paths": { "#/*": ["src/*"] } } }
```

## Key Configuration Files

### vite.config.ts
- React plugin (`@vitejs/plugin-react`)
- TailwindCSS v4 plugin (`@tailwindcss/vite`)
- Path alias (`#` to `src`)
- Vitest config (jsdom, globals, setup file)

### components.json (shadcn/ui)
- Style: new-york
- RSC: false
- Aliases: `#/Shared/Ui/Shadcn`, `#/Shared/Model`

## Development Notes

- MSW intercepts all `/api/*` requests in browser environment
- In-memory DB resets on page refresh (no persistence)
- Category data is predefined (no CRUD for categories)
- Ingredient units are predefined constants in `Shared/Config/`
