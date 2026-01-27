# SpecKit Monorepo Demo

A complete monorepo setup using pnpm + Turbo, demonstrating efficient multi-project management with shared configurations.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd spec-kit-lab
pnpm install

# Build all projects
pnpm turbo build

# Run development servers (in parallel)
pnpm turbo dev

# Lint all projects
pnpm turbo lint

# Type check all projects
pnpm turbo type-check
```

## 📁 Project Structure

```
├── apps/                     # Applications
│   ├── sample-web/          # Next.js web app
│   └── sample-api/          # Node.js API server
├── packages/                # Shared packages
│   ├── typescript-config/   # Shared TypeScript configs
│   └── eslint-config/       # Shared ESLint rules
├── docs/                    # Documentation
├── .github/                 # CI/CD workflows
├── turbo.json              # Turbo pipeline config
├── pnpm-workspace.yaml     # pnpm workspace config
└── package.json            # Root workspace
```

## 🔧 Technologies

- **Package Manager**: pnpm v9.14.4+ (efficient, strict dependencies)
- **Build System**: Turbo v2.3.0+ (caching, parallel execution)
- **Language**: TypeScript v5.0+ (strict mode)
- **Linting**: ESLint v8.0+ (shared configurations)
- **Formatting**: Prettier v3.0+ (consistent code style)

## 📦 Workspace Packages

### Applications

#### `@repo/sample-web` (Next.js 14)

- **Location**: `apps/sample-web/`
- **Tech Stack**: Next.js 14 + React 18 + TypeScript
- **Scripts**: `dev`, `build`, `start`, `lint`, `type-check`
- **Port**: `3000` (development)

#### `@repo/sample-api` (Node.js)

- **Location**: `apps/sample-api/`
- **Tech Stack**: Express + TypeScript + tsup
- **Scripts**: `dev`, `build`, `start`, `lint`, `type-check`
- **Port**: `3001` (development)

### Shared Packages

#### `@repo/typescript-config`

Shared TypeScript configurations:

- `base.json` - Base TypeScript config
- `react.json` - React-specific config
- `nextjs.json` - Next.js-specific config

#### `@repo/eslint-config`

Shared ESLint configurations:

- `index.js` - Base ESLint config for TypeScript
- `react.js` - React-specific ESLint rules

## 🎯 Key Features Demonstrated

### ✅ User Story 1: Multi-Project Management

- [x] **Independent builds**: Each app builds separately
- [x] **Shared configurations**: TypeScript & ESLint configs reused
- [x] **Workspace linking**: Packages reference each other via `workspace:*`
- [x] **Parallel execution**: Turbo runs tasks across projects efficiently

## 🛠 Development Workflows

### Adding a New App

```bash
# Create new app directory
mkdir apps/my-new-app
cd apps/my-new-app

# Initialize package.json
pnpm init

# Add shared config dependencies
pnpm add -D @repo/typescript-config @repo/eslint-config

# Create config files extending shared configs
# - tsconfig.json extends @repo/typescript-config
# - .eslintrc.js extends @repo/eslint-config
```

### Adding a New Package

```bash
# Create new package directory
mkdir packages/my-shared-package
cd packages/my-shared-package

# Initialize package.json with workspace name
pnpm init --name @repo/my-shared-package

# Install dependencies
pnpm install

# Reference from other packages
pnpm add @repo/my-shared-package --workspace-root
```

## 🚀 Build & Development

### Individual Project Commands

```bash
# Build specific project
pnpm turbo build --filter=@repo/sample-web

# Run specific project in dev mode
cd apps/sample-web && pnpm dev

# Lint specific project
cd apps/sample-api && pnpm lint
```

### Workspace-wide Commands

```bash
# Install all dependencies
pnpm install

# Build everything
pnpm turbo build

# Run all dev servers (parallel)
pnpm turbo dev

# Lint everything
pnpm turbo lint

# Type check everything
pnpm turbo type-check

# Clean all build artifacts
pnpm turbo clean
```

## ⚡ Performance Features

- **Turbo Caching**: Build outputs are cached for faster subsequent builds
- **Parallel Execution**: Multiple projects build/test simultaneously
- **Dependency Graph**: Turbo respects dependencies (`^build`)
- **Selective Builds**: Only affected projects rebuild when files change
- **pnpm Efficiency**: Shared dependency storage reduces disk usage

## 📊 Workspace Overview

```bash
# List all workspace packages
pnpm ls -r --depth=0

# Show dependency tree
pnpm ls -r

# Check workspace info
pnpm list --filter @repo/sample-web
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**: Check that shared configs are properly linked
2. **Dependency Issues**: Run `pnpm install` in workspace root
3. **Cache Issues**: Clear Turbo cache with `pnpm turbo clean`
4. **Type Errors**: Ensure all `tsconfig.json` files extend shared configs

### Reset Workspace

```bash
# Full reset
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf pnpm-lock.yaml
pnpm install
```

## 📝 Next Steps

This demo shows **User Story 1** (multi-project management). Additional user stories can be implemented:

- **User Story 2**: Dependency Management (hoisting, deduplication)
- **User Story 3**: Code Sharing (shared utilities, components)
- **User Story 4**: Build Optimization (selective builds, remote caching)

## 🤝 Contributing

1. Follow existing code style (Prettier + ESLint)
2. Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
3. Test changes across workspace (`pnpm turbo build lint`)
4. Update documentation as needed

---

**🎉 Monorepo Setup Complete!** This workspace demonstrates efficient multi-project management with shared configurations, parallel builds, and development-friendly tooling.
