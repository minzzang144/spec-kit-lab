# Data Model: 모노레포 환경 구성

**브랜치**: `001-monorepo-setup` | **날짜**: 2025-01-21
**참조**: spec.md 요구사항에서 추출된 핵심 엔터티들

## 핵심 엔터티

### 1. Workspace (워크스페이스)
모노레포의 루트 레벨 관리 단위

**속성**:
- `name`: 워크스페이스 이름 (예: @yourorg/monorepo)
- `version`: 워크스페이스 버전
- `packageManager`: 사용하는 패키지 매니저 (pnpm@9.14.4)
- `nodeVersion`: 요구 Node.js 버전 (>=18.17.0)
- `workspacePatterns`: 워크스페이스 패턴 배열 (['apps/*', 'packages/*'])

**상태**:
- `INITIALIZING`: 워크스페이스 설정 중
- `READY`: 사용 가능한 상태
- `BUILDING`: 빌드 진행 중
- `ERROR`: 오류 상태

**검증 규칙**:
- packageManager는 pnpm이어야 함
- nodeVersion은 18.17.0 이상이어야 함
- workspacePatterns는 빈 배열이 아니어야 함

### 2. Project (프로젝트)
워크스페이스 내 독립적인 애플리케이션 또는 라이브러리

**속성**:
- `name`: 프로젝트 이름 (예: @yourorg/web-app)
- `type`: 프로젝트 타입 (APP, PACKAGE)
- `location`: 프로젝트 경로 (apps/web, packages/ui)
- `dependencies`: 의존하는 다른 프로젝트들의 ID 배열
- `scripts`: 사용 가능한 스크립트 목록
- `buildOutputPath`: 빌드 출력 경로

**타입별 분류**:
- **APP**: 독립적으로 실행 가능한 애플리케이션 (frontend, backend, mobile)
- **PACKAGE**: 다른 프로젝트에서 사용되는 라이브러리 (ui, utils, config)

**상태**:
- `CREATED`: 프로젝트 생성됨
- `CONFIGURED`: 설정 완료
- `BUILDING`: 빌드 중
- `BUILT`: 빌드 완료
- `FAILED`: 빌드 실패
- `RUNNING`: 개발 서버 실행 중

**검증 규칙**:
- name은 @워크스페이스명/프로젝트명 형식
- type은 APP 또는 PACKAGE 중 하나
- location은 워크스페이스 패턴과 일치해야 함
- APP 타입은 apps/ 디렉토리에, PACKAGE 타입은 packages/ 디렉토리에 위치

### 3. SharedLibrary (공유 라이브러리)
여러 프로젝트에서 공통으로 사용하는 코드 모음

**속성**:
- `name`: 라이브러리 이름 (예: @repo/ui, @repo/config)
- `category`: 라이브러리 분류 (UI, UTILS, CONFIG, TYPES)
- `exportedModules`: 내보내는 모듈 목록
- `consumers`: 이 라이브러리를 사용하는 프로젝트들
- `version`: 라이브러리 버전

**분류별 특성**:
- **UI**: React 컴포넌트, 스타일 시스템
- **UTILS**: 공통 유틸리티 함수, 헬퍼
- **CONFIG**: ESLint, Prettier, TypeScript 설정
- **TYPES**: 공유 TypeScript 타입 정의

**검증 규칙**:
- name은 @repo/ 접두사 사용
- category는 정의된 분류 중 하나
- exportedModules는 빈 배열이 아니어야 함

### 4. DependencyGraph (의존성 그래프)
프로젝트 간 의존 관계를 나타내는 구조

**속성**:
- `nodes`: 모든 프로젝트의 노드 정보
- `edges`: 의존성 관계 (from → to)
- `topologicalOrder`: 위상 정렬된 빌드 순서
- `cycles`: 순환 의존성 목록 (감지된 경우)

**노드 구조**:
- `id`: 프로젝트 고유 식별자
- `name`: 프로젝트 이름
- `dependsOn`: 의존하는 프로젝트 ID 배열
- `dependents`: 이 프로젝트에 의존하는 프로젝트 ID 배열

**에지 구조**:
- `from`: 의존하는 프로젝트 ID
- `to`: 의존 대상 프로젝트 ID
- `type`: 의존성 타입 (RUNTIME, DEVTIME, PEER)

**검증 규칙**:
- 순환 의존성이 감지되면 오류 발생
- topologicalOrder는 의존성을 고려한 올바른 순서여야 함
- 모든 노드는 최소 하나의 경로로 연결되어야 함

### 5. BuildTarget (빌드 타겟)
빌드 가능한 개별 단위

**속성**:
- `projectId`: 소속 프로젝트 ID
- `name`: 빌드 타겟 이름 (build, dev, test, lint)
- `dependencies`: 선행되어야 할 다른 빌드 타겟들
- `inputs`: 빌드에 영향을 주는 입력 파일 패턴
- `outputs`: 빌드 결과물 경로
- `cached`: 캐시 사용 여부
- `persistent`: 지속적 실행 여부 (dev 서버 등)

**타입별 특성**:
- **build**: 프로덕션 빌드, 출력물 생성
- **dev**: 개발 서버, 지속적 실행
- **test**: 테스트 실행, 커버리지 생성
- **lint**: 코드 품질 검사

**상태 전이**:
```
PENDING → RUNNING → (SUCCESS | FAILED)
     ↓
  SKIPPED (캐시 히트 시)
```

**검증 규칙**:
- dependencies는 순환 의존성 없이 정의
- persistent 타겟은 cached가 false여야 함
- outputs 경로는 프로젝트 디렉토리 내에 위치

## 엔터티 관계

### 1:N 관계
- **Workspace** → **Project**: 하나의 워크스페이스는 여러 프로젝트를 포함
- **Project** → **BuildTarget**: 하나의 프로젝트는 여러 빌드 타겟을 가짐

### N:M 관계
- **Project** ↔ **SharedLibrary**: 프로젝트들이 공유 라이브러리를 사용하고, 공유 라이브러리는 여러 프로젝트에서 사용됨
- **Project** ↔ **Project** (의존성): 프로젝트 간 의존 관계

### 집계 관계
- **DependencyGraph**: 모든 프로젝트와 의존성을 집계하여 관리

## 비즈니스 규칙

### 의존성 관리 규칙
1. **순환 의존성 금지**: 프로젝트 간 순환 의존성 감지 시 빌드 실패
2. **버전 통일**: 동일한 외부 의존성은 모든 프로젝트에서 같은 버전 사용
3. **계층적 의존성**: packages는 다른 packages에만 의존, apps는 packages에 의존 가능

### 빌드 규칙
1. **Fail-fast 전략**: 하나의 프로젝트 빌드 실패 시 전체 빌드 중단
2. **의존성 우선 빌드**: 의존 대상 프로젝트를 먼저 빌드
3. **증분 빌드**: 변경된 프로젝트와 그에 의존하는 프로젝트만 재빌드

### 네이밍 규칙
1. **워크스페이스 패키지**: @조직명/패키지명 형식
2. **공유 라이브러리**: @repo/라이브러리명 형식
3. **프로젝트 디렉토리**: kebab-case 사용

이 데이터 모델은 모노레포의 구조적 무결성을 보장하고, 의존성 관리와 빌드 프로세스의 안정성을 제공합니다.