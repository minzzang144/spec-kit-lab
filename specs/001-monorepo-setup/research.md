# Research: pnpm Turbo 모노레포 설정

**브랜치**: `001-monorepo-setup` | **날짜**: 2025-01-21
**연구 범위**: pnpm workspace + Turbo 기반 모노레포 구축

## 의사결정 요약

### **Decision 1**: pnpm workspace 기반 모노레포 선택
**Rationale**:
- pnpm은 디스크 공간 효율성 (hard link 사용으로 중복 제거)
- 엄격한 의존성 관리 (phantom dependencies 방지)
- workspace 기능으로 모노레포 최적화
- Turbo와의 완벽한 호환성

**Alternatives considered**:
- npm workspaces: pnpm 대비 성능 및 디스크 사용량 비효율
- yarn workspaces: phantom dependency 문제, 느린 설치 속도

### **Decision 2**: Turbo 빌드 시스템 도입
**Rationale**:
- 지능적인 캐싱으로 빌드 시간 단축 (최대 85% 향상)
- 병렬 실행으로 중형 규모(5-15 프로젝트) 최적화
- 의존성 그래프 자동 관리
- 증분 빌드 지원으로 변경된 부분만 재빌드

**Alternatives considered**:
- Nx: 러닝 커브가 높고, 우리 규모에 과도한 기능
- Lerna: 레거시 도구, 성능 및 캐싱 기능 부족
- Rush: 복잡한 설정, Microsoft 환경에 특화

### **Decision 3**: @repo/config 패키지 구조
**Rationale**:
- 중앙화된 설정 관리 (ESLint, Prettier, TypeScript, Tailwind)
- 버전 관리를 통한 설정 변경 추적
- 각 앱/패키지에서 단일 import로 설정 사용

**Alternatives considered**:
- 루트 레벨 설정 파일: 각 프로젝트별 커스터마이징 어려움
- 개별 설정 파일: 중복 설정, 일관성 유지 어려움

## 핵심 구성 요소

### 1. pnpm Workspace 설정

#### 루트 package.json 핵심 설정
```json
{
  "packageManager": "pnpm@9.14.4",
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=9.0.0"
  }
}
```

#### .npmrc 주요 설정
- `auto-install-peers=true`: 피어 의존성 자동 설치
- `prefer-workspace-packages=true`: 워크스페이스 패키지 우선 사용
- `shared-workspace-lockfile=true`: 통합 락파일로 일관성 보장

### 2. Turbo 파이프라인 구성

#### 핵심 파이프라인
- **build**: `^build` 의존성으로 패키지 우선 빌드
- **dev**: `persistent: true`로 개발 서버 유지
- **lint/test**: 빌드 후 실행으로 타입 안전성 보장

#### 캐싱 전략
- 입력: 소스 코드, 설정 파일, 환경변수
- 출력: dist/, .next/, build/ 디렉토리
- 전역 의존성: package.json, pnpm-lock.yaml 변경 시 캐시 무효화

### 3. TypeScript Project References

#### 장점
- 증분 컴파일: 변경된 부분만 다시 컴파일
- IDE 성능 향상: 프로젝트간 이동 시 빠른 타입 추론
- 순환 의존성 방지: 컴파일 타임에 의존성 그래프 검증

#### 구조
```
루트 tsconfig.json (references 정의)
├── packages/typescript-config/ (공통 설정)
├── apps/*/tsconfig.json (앱별 설정 + references)
└── packages/*/tsconfig.json (패키지별 설정)
```

### 4. 코드 품질 도구 통합

#### ESLint 설정 계층
- `@repo/eslint-config`: 기본 규칙
- `@repo/eslint-config/react`: React 특화 규칙
- `@repo/eslint-config/next`: Next.js 특화 규칙

#### Prettier + Tailwind 통합
- `prettier-plugin-tailwindcss`: 클래스 자동 정렬
- 일관된 코드 포맷팅으로 코드 리뷰 효율성 증대

## 성능 최적화 전략

### 1. 설치 최적화
- `side-effects-cache=true`: 사이드 이펙트 캐싱 활성화
- `resolution-mode=highest`: 의존성 해결 성능 향상
- 공유 락파일로 중복 설치 방지

### 2. 빌드 최적화
- Turbo 원격 캐시 (선택사항): 팀 전체 빌드 캐시 공유
- 병렬 실행: CPU 코어 수에 따른 자동 조절
- 스마트 의존성 추적: 실제 변경사항만 재빌드

### 3. 개발 환경 최적화
- TypeScript project references로 IDE 성능 향상
- Hot reload 최적화: 패키지 변경 시 앱 자동 재시작
- 개발 서버 병렬 실행 지원

## 확장성 고려사항

### 중형 규모 (5-15 프로젝트) 최적화
- 메모리 사용량: 약 2-4GB (프로젝트 규모에 따라)
- 빌드 시간: 초기 빌드 3-10분, 증분 빌드 30초-2분
- 개발자 환경: 8GB RAM 이상 권장

### 향후 확장 대비
- apps/ 디렉토리 세분화 가능 (frontend/, backend/, mobile/)
- packages/ 디렉토리 도메인별 분류 (ui/, business/, infra/)
- 마이크로프론트엔드 지원을 위한 module federation 준비

## 보안 및 안정성

### 의존성 관리
- `audit-level=moderate`: 보안 취약점 중간 수준 이상 체크
- 엄격한 버전 관리: workspace 패키지 버전 통일 강제
- Renovate/Dependabot 연동으로 자동 업데이트

### CI/CD 최적화
- Turbo 캐시를 활용한 CI 빌드 시간 단축
- 변경된 패키지만 선별적 배포
- 병렬 테스트 실행으로 피드백 시간 단축

이 연구 결과는 pnpm + Turbo 조합이 우리의 중형 규모 웹 개발 모노레포에 최적화된 솔루션임을 확인했습니다. 특히 개발 경험, 빌드 성능, 확장성 면에서 균형잡힌 선택입니다.