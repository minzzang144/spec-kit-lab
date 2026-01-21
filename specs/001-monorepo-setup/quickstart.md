# Quickstart Guide: pnpm Turbo 모노레포 구축

**브랜치**: `001-monorepo-setup` | **날짜**: 2025-01-21
**예상 소요 시간**: 15-30분

이 가이드는 pnpm + Turbo 기반 모노레포를 처음부터 설정하는 단계별 가이드입니다.

## 사전 요구사항

### 시스템 요구사항
- **Node.js**: 18.17.0 이상
- **pnpm**: 9.0.0 이상
- **Git**: 2.20 이상 (선택사항, 버전 관리용)

### 설치 확인
```bash
node --version    # v18.17.0+
pnpm --version    # 9.14.4+
git --version     # 2.20.0+ (선택사항)
```

### pnpm 설치 (미설치 시)
```bash
# npm을 통한 설치
npm install -g pnpm

# 또는 Homebrew (macOS)
brew install pnpm

# 또는 직접 설치
curl -fsSL https://get.pnpm.io/install.sh | sh
```

## Phase 1: 워크스페이스 초기화 (5분)

### 1.1 프로젝트 디렉토리 생성
```bash
mkdir my-monorepo
cd my-monorepo
```

### 1.2 pnpm 워크스페이스 설정

**루트 package.json 생성**:
```bash
# 대화형 초기화
pnpm init

# 또는 직접 생성
cat > package.json << 'EOF'
{
  "name": "@yourorg/monorepo",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.14.4",
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "clean": "turbo clean"
  }
}
EOF
```

**워크스페이스 패턴 정의**:
```bash
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

**pnpm 설정**:
```bash
cat > .npmrc << 'EOF'
auto-install-peers=true
prefer-workspace-packages=true
link-workspace-packages=true
shared-workspace-lockfile=true
strict-peer-dependencies=false
resolution-mode=highest
side-effects-cache=true
audit-level=moderate
EOF
```

### 1.3 디렉토리 구조 생성
```bash
mkdir -p apps packages
mkdir -p .github/workflows docs
```

## Phase 2: Turbo 설정 (5분)

### 2.1 Turbo 설치
```bash
pnpm add -w turbo -D
```

### 2.2 Turbo 설정 파일 생성
```bash
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env.production.local", ".env.local"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".eslintrc.js", "eslint.config.js"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "jest.config.js", "vitest.config.ts"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  },
  "globalDependencies": [
    "package.json",
    "pnpm-lock.yaml"
  ]
}
EOF
```

### 2.3 첫 번째 의존성 설치
```bash
pnpm install
```

## Phase 3: 공유 설정 패키지 생성 (10분)

### 3.1 TypeScript 설정 패키지
```bash
mkdir -p packages/typescript-config
cd packages/typescript-config
```

**package.json**:
```bash
cat > package.json << 'EOF'
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": ["base.json", "nextjs.json", "react.json"]
}
EOF
```

**base.json** (기본 TypeScript 설정):
```bash
cat > base.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "composite": false,
    "incremental": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", "coverage"]
}
EOF
```

### 3.2 ESLint 설정 패키지
```bash
cd ../../
mkdir -p packages/eslint-config
cd packages/eslint-config
```

**package.json**:
```bash
cat > package.json << 'EOF'
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-turbo": "^2.3.0"
  }
}
EOF
```

**index.js** (기본 ESLint 설정):
```bash
cat > index.js << 'EOF'
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["turbo"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    ".*.js",
    "node_modules/",
    "dist/",
    ".next/",
    "build/",
  ],
  rules: {
    "turbo/no-undeclared-env-vars": "warn",
  },
};
EOF
```

### 3.3 루트 설정 파일들
```bash
cd ../../

# 루트 ESLint 설정
cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  extends: ["@repo/eslint-config"],
};
EOF

# Prettier 설정
cat > .prettierrc.js << 'EOF'
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  arrowParens: "avoid",
  endOfLine: "lf",
};
EOF

# 루트 TypeScript 설정
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    { "path": "./packages/typescript-config" },
    { "path": "./packages/eslint-config" }
  ],
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "incremental": true
  }
}
EOF
```

## Phase 4: 의존성 설치 및 검증 (5분)

### 4.1 개발 도구 설치
```bash
# 루트에 공통 도구 설치
pnpm add -w -D eslint prettier typescript

# 워크스페이스 패키지 설치
pnpm install
```

### 4.2 동작 확인
```bash
# Turbo 명령어 테스트
pnpm turbo build    # 빌드할 패키지가 없지만 설정 검증
pnpm turbo lint     # ESLint 실행 테스트

# 워크스페이스 구조 확인
pnpm ls --depth=0   # 루트 레벨 패키지들 확인
```

## Phase 5: 첫 번째 앱 생성 (선택사항, 5분)

### 5.1 Next.js 앱 생성 예제
```bash
cd apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"
cd web

# 워크스페이스 패키지 의존성 추가
pnpm add @repo/typescript-config @repo/eslint-config
```

### 5.2 앱별 설정 조정
**apps/web/tsconfig.json**:
```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", ".next/types/**/*.ts"],
  "references": [
    { "path": "../../packages/typescript-config" }
  ]
}
```

**apps/web/.eslintrc.js**:
```javascript
module.exports = {
  extends: ["@repo/eslint-config"],
  parserOptions: {
    project: true,
  },
};
```

## 검증 체크리스트

### ✅ 기본 구조
- [ ] `pnpm-workspace.yaml` 파일 존재
- [ ] `turbo.json` 파일 존재 및 올바른 설정
- [ ] `apps/`, `packages/` 디렉토리 생성
- [ ] 루트 `package.json`에 올바른 scripts 정의

### ✅ 설정 패키지
- [ ] `@repo/typescript-config` 패키지 생성
- [ ] `@repo/eslint-config` 패키지 생성
- [ ] 루트에서 설정 패키지들 정상 참조

### ✅ 동작 확인
- [ ] `pnpm install` 정상 실행
- [ ] `pnpm turbo build` 오류 없이 실행
- [ ] `pnpm turbo lint` 정상 실행
- [ ] TypeScript 컴파일 정상 작동

## 다음 단계

모노레포 기본 설정이 완료되었습니다! 이제 다음과 같은 작업들을 진행할 수 있습니다:

1. **새 앱 추가**: `apps/` 디렉토리에 추가 애플리케이션 생성
2. **공유 라이브러리**: `packages/` 디렉토리에 공통 UI, 유틸리티 패키지 생성
3. **CI/CD 설정**: GitHub Actions를 통한 자동화된 빌드/테스트
4. **배포 설정**: 각 앱별 배포 파이프라인 구성

## 문제 해결

### 일반적인 문제들

**Q: pnpm install 시 peer dependency 경고가 발생합니다**
A: `.npmrc`에 `auto-install-peers=true` 설정이 되어 있는지 확인하고, 필요시 `--shamefully-hoist` 플래그 사용

**Q: Turbo가 패키지를 찾지 못합니다**
A: `pnpm-workspace.yaml`의 패턴이 올바른지 확인하고, `pnpm install` 재실행

**Q: TypeScript 경로 에러가 발생합니다**
A: 각 프로젝트의 `tsconfig.json`에서 `references` 설정과 `baseUrl`, `paths` 설정을 확인

**Q: ESLint가 워크스페이스 패키지를 인식하지 못합니다**
A: ESLint 설정에서 `import/resolver` 설정을 확인하고, 프로젝트 루트에서 실행하는지 확인

이제 당신의 pnpm Turbo 모노레포가 준비되었습니다! 🎉