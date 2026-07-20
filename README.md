# 코디업 (CodyUp)

옷장 관리 + 예산 기반 구매 로드맵 + AI 코디 평가를 제공하는 스타일링 매니지먼트 서비스입니다.

- **핵심 기능**: 옷장 등록·관리, 예산 기반 구매 우선순위 로드맵, AI 코디 추천/평가, 개인 스타일 대시보드
- **구조**: 모노레포 (`apps/web` 프론트엔드, `apps/api` 백엔드), npm workspaces

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite`, CSS `@theme`로 디자인 토큰 정의) |
| 백엔드 | Node.js (LTS 20.x) + Express + TypeScript |
| DB | MySQL 8 (Prisma ORM) |
| 인증 | JWT (Bearer 토큰) |
| 패키지 매니저 | npm workspaces |

## 폴더 구조

```
codyup/
  apps/
    web/    # 프론트엔드 (Vite + React)
    api/    # 백엔드 (Express + Prisma)
  package.json   # workspaces 루트
  CLAUDE.md      # 프로젝트 컨벤션 문서
```

각 담당 영역·컨벤션은 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 로컬 실행 가이드 (VS Code 기준)

### 사전 준비물

- Node.js 20 LTS
- MySQL 8
- Git
- VS Code

### ① 레포 클론 및 열기

```bash
git clone <레포 URL>
cd codyup
code .
```

### ② MySQL 준비

로컬에 MySQL 8이 설치·실행 중이어야 합니다. `codyup`이라는 이름의 데이터베이스를 하나 만들어 두세요.

```sql
CREATE DATABASE codyup;
```

> Windows에서 관리자 권한 없이 MySQL을 설치한 경우, Windows 서비스로 등록이 안 될 수 있습니다. 이런 환경에서는 재부팅 후 매번 `mysqld`를 수동으로 실행해야 합니다.

### ③ 환경변수 설정

`.env.example`을 복사해서 `.env` 파일을 만들고 실제 값을 채워주세요.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

- `apps/api/.env`
  - `DATABASE_URL`: `mysql://root:{비밀번호}@localhost:3306/codyup`
  - `JWT_SECRET`: 임의의 문자열
- `apps/web/.env`
  - `VITE_API_BASE_URL`: 비워두면 기본값(`http://localhost:4000/api`)으로 로컬 API를 바라봅니다.

### ④ 의존성 설치

VS Code에서 **터미널 → 새 터미널**을 열고, 프로젝트 루트에서 한 번만 실행하면 `apps/web`, `apps/api` 모두 설치됩니다.

```bash
npm install
```

### ⑤ DB 스키마 반영

```bash
cd apps/api
npx prisma generate
npx prisma db push
npm run db:seed   # 더미데이터가 필요하면 실행
cd ../..
```

### ⑥ 서버 실행

VS Code 터미널을 분할(터미널 패널 우측 상단 분할 아이콘, 또는 `Ctrl+Shift+5`)해서 두 개 띄운 뒤 각각 실행합니다.

```bash
# 터미널 1 — 백엔드 (http://localhost:4000)
npm run dev --workspace api

# 터미널 2 — 프론트엔드 (http://localhost:5173)
npm run dev --workspace web
```

### ⑦ 접속

브라우저에서 [http://localhost:5173](http://localhost:5173) 을 열면 됩니다.

## Git 규칙

- 브랜치: `main`(배포용, 보호) / `dev`(통합용) / `feature/{이름}-{기능}`
- 커밋: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:` 등. 모노레포이므로 범위 표기 권장 (예: `feat(api): ...`, `feat(web): ...`)
- PR은 `dev`로만 머지, 최소 1인 승인 필요

자세한 팀 컨벤션은 [CLAUDE.md](CLAUDE.md)를 참고하세요.
