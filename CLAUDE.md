# 코디업 (CodyUp)

옷장 관리 + 예산 기반 구매 로드맵 + AI 코디 평가를 제공하는 스타일링 매니지먼트 서비스입니다.
이 문서는 팀 전원(그리고 각자의 AI 코딩 에이전트)이 공유하는 프로젝트 규칙입니다. **코드를 생성하기 전에 이 문서를 컨텍스트로 반드시 참고하세요.**

레포 구조는 **모노레포**입니다. 프론트/백엔드 코드가 한 레포 안에 `apps/web`, `apps/api`로 나뉘어 있습니다. 본인 담당 폴더 바깥은 임의로 수정하지 마세요.

## 프로젝트 개요

- **서비스명**: 코디업 (CodyUp)
- **핵심 기능**: 옷장 등록·관리, 예산 기반 구매 우선순위 로드맵, AI 코디 추천/평가, 개인 스타일 대시보드
- **팀 구성**: 프론트엔드 2명(FE1·FE2) · 백엔드 2명(BE1·BE2) · 기획 1명(PM) · 디자인 1명(DS)
- **본행사**: 2026-07-21(화)

### 담당 도메인 (역할 분담은 기존과 동일, 레포만 통합)

| 역할 | 담당 영역 | 작업 폴더 |
|---|---|---|
| BE1 | 옷장 데이터 축 — 유저/체형/예산 프로필, 옷장 CRUD, 옷장 진단 (비전 API 자동 태깅은 2차 기능으로 보류, 1차는 수동 입력) | `apps/api/src/services/closet`, `apps/api/src/services/user` |
| BE2 | 로드맵·AI 코칭 축 — 구매 로드맵 엔진, AI 코디 추천/평가, 개선 피드백 | `apps/api/src/services/roadmap`, `apps/api/src/services/coaching` |
| FE1 | 온보딩 + 내 옷장 화면 전체 | `apps/web/src/pages/onboarding`, `apps/web/src/pages/closet` |
| FE2 | 스타일 플랜 + 코디 코칭 + 마이페이지 + 홈 대시보드 | `apps/web/src/pages/style-plan`, `apps/web/src/pages/coaching`, `apps/web/src/pages/mypage`, `apps/web/src/pages/dashboard` |

> 다른 담당자의 폴더를 수정해야 하는 경우 반드시 PR로 리뷰를 받으세요. (금지 사항 참고)

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 방식, `tailwind.config.js` 없이 CSS `@theme`로 설정) |
| 상태 관리 | React Context + useState (필요 시 Zustand) |
| 백엔드 | Node.js (LTS 20.x) + Express + TypeScript |
| DB | MySQL 8 (Prisma ORM) |
| 이미지 저장 | Cloudinary |
| 인증 | JWT (Bearer 토큰) |
| 배포 | 프론트: Vercel (Root Directory: `apps/web`) / 백엔드: Render 또는 Railway (Root Directory: `apps/api`) |
| 패키지 매니저 | npm workspaces (yarn/pnpm 혼용 금지) |
| 로컬 런타임 | Node 20 LTS로 전원 통일 |
| 레포지토리명 | `codyup` (모노레포, 단일 레포) |
| 배포 프로젝트명 | Vercel/Render 프로젝트명은 `codyup-web` / `codyup-api`로 통일 (배포 대상만 구분, 소스는 한 레포) |

## 폴더 구조 (모노레포)

```
codyup/
  apps/
    web/                # 프론트엔드 (codyup-web 배포 대상)
      src/
        components/      # 공통 컴포넌트 (Button, Card, Badge 등 디자인 시스템 컴포넌트)
        pages/
          onboarding/     # FE1
          closet/         # FE1
          style-plan/      # FE2
          coaching/        # FE2
          mypage/          # FE2
          dashboard/       # FE2
        hooks/
        api/             # axios 등 API 호출 함수
        store/
        types/
        utils/
      package.json
    api/                 # 백엔드 (codyup-api 배포 대상)
      src/
        routes/
        controllers/
        services/
          closet/          # BE1
          user/            # BE1
          roadmap/         # BE2
          coaching/        # BE2
        models/           # Prisma schema / 타입
        middlewares/
        types/
        utils/
      package.json
  package.json           # workspaces 루트 (npm workspaces)
  CLAUDE.md
  .env.example
  .gitignore
```

## 코드 컨벤션

| 항목 | 규칙 |
|---|---|
| 변수·함수 | camelCase (예: `getClosetItems`) |
| 컴포넌트·클래스·타입 | PascalCase (예: `ClosetCard`, `UserProfile`) |
| 상수 | UPPER_SNAKE_CASE (예: `MAX_BUDGET`) |
| 파일명 | 컴포넌트는 PascalCase(`ClosetCard.tsx`), 그 외는 kebab-case(`api-client.ts`) |
| API 엔드포인트 | 소문자 + 하이픈(kebab-case), 복수형 명사 (예: `/api/closet-items`, `/api/purchase-roadmap`) |
| Lint/Formatter | ESLint(airbnb-typescript 또는 standard) + Prettier, 저장 시 자동 포맷 전원 적용, 루트에 공통 설정 하나만 둠 |

## API / 데이터 규약

### 공통 응답 포맷

**성공**
```json
{
  "success": true,
  "data": { },
  "error": null
}
```

**실패**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CLOSET_001",
    "message": "옷장 아이템을 찾을 수 없습니다."
  }
}
```

### 상세 규칙

| 항목 | 규칙 |
|---|---|
| HTTP 상태코드 | 200(성공) / 201(생성) / 400(잘못된 요청) / 401(미인증) / 404(없음) / 500(서버 오류) |
| 에러코드 | `{도메인}_{번호}` 형식 — 예: `AUTH_001`, `CLOSET_001`, `ROADMAP_001`, `EVAL_001` |
| 날짜/시간 | ISO 8601 (예: `2026-07-21T09:00:00+09:00`) |
| 통화/가격 | KRW, 정수(원 단위, 소수점 없음) |
| 인증 방식 | `Authorization: Bearer {JWT}` 헤더 |

## Git 규칙

| 항목 | 규칙 |
|---|---|
| 브랜치 전략 | `main`(배포용, 보호) / `dev`(통합용) / `feature/{이름}-{기능}` (예: `feature/be1-closet-api`) |
| 커밋 컨벤션 | Conventional Commits — `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`. 모노레포이므로 범위 표기 권장 (예: `feat(api): 옷장 등록 API 추가`, `feat(web): 옷장 목록 화면 구현`) |
| PR 규칙 | 최소 1인 승인 후 머지, `dev`로만 머지(직접 `main` 머지 금지), 변경 화면 스크린샷 첨부 권장. 본인 담당 폴더 외 변경이 포함된 PR은 해당 담당자 리뷰 필수 |
| 머지 방식 | Squash and merge |

## 디자인 시스템

| 항목 | 규칙 |
|---|---|
| 토큰 export | Figma Variables → `apps/web/src/index.css`의 `@theme { --color-*, --font-*, --spacing-* }` 블록으로 반영 (Tailwind v4는 `tailwind.config.js` 대신 CSS 안에서 직접 정의) |
| 공통 컴포넌트명 | PascalCase, 디자인 파일 컴포넌트명과 1:1 일치 (`Button`, `Card`, `Badge` 등) |
| props 규칙 | camelCase, 공통 props명 통일 (예: `variant`, `size`, `disabled`) |
| 아이콘 | `lucide-react` 통일, 임의 SVG 혼용 금지 |
| 앱 타이틀/파비콘 | 브라우저 탭 타이틀 "코디업 (CodyUp)"로 통일 |

## 환경변수 / 시크릿 관리

| 항목 | 규칙 |
|---|---|
| 관리 방식 | `apps/web/.env`, `apps/api/.env`(개인 로컬, 실키값) / 각각 `.env.example`(레포에 커밋, 키 이름만·값은 빈칸) |
| .gitignore | 루트 `.gitignore`에서 모든 `.env` 제외, `.env.example`만 커밋 허용 |
| 비공개 키 공유 | Cloudinary·LLM API·비전 API 키 등은 팀 노션 비공개 페이지에만 기록, 채팅방·레포 노출 금지 |
| 배포 환경변수 | Vercel/Render 대시보드에서 각 프로젝트(`codyup-web`/`codyup-api`)별로 별도 등록 |

## 진행 현황 (수시 업데이트)

### 완료
- **BE1**: 옷장 CRUD(등록/목록/수정/삭제), 카테고리·색상 집계 분석, 부족 카테고리 추천 로직 완료 → `dev` 브랜치에 머지 완료
  - 제공 API: `GET /api/closet`(옷장 아이템 목록), `GET /api/user/profile`(퍼스널컬러·체형·예산)
- **레포**: `codyup` 모노레포 생성, `dev` 브랜치 생성 및 보호(ruleset) 설정 완료, 팀원 초대 완료

### 진행 중 / 확정된 결정사항
- **옷 등록 방식**: 비전 API 자동 태깅은 2차 기능으로 보류. **1차는 사용자가 카테고리·색상을 직접 선택하는 수동 입력 방식**으로 먼저 완성. 시간이 남으면 이후 비전 API 자동 태깅으로 업그레이드.
- **화면 우선순위**: 내 옷장 파트를 최우선으로 완성 (기획·디자인팀 결정). FE2(민서)는 초반 1~2일 옷장 파트에 임시 합류 후 본인 도메인(스타일 플랜 등)으로 복귀.
- **BE2(로드맵·AI 코칭) 착수 브리핑**: BE1이 제공하는 `GET /api/closet`, `GET /api/user/profile` 데이터를 입력값으로 삼아 아래를 구현
  1. 옷장 데이터 기반 코디 조합 생성 로직
  2. 유저 퍼스널컬러·체형 반영 AI 코디 평가
  3. 예산 반영 구매 로드맵 엔진
  - BE1과는 데이터 스키마(ClosetItem, UserProfile 필드 구조)를 맞춰서 진행할 것

## 금지 사항

- 비공개 키를 코드에 하드코딩하지 않는다
- 다른 담당자의 폴더(예: BE1이 `apps/api/src/services/roadmap`)를 임의로 수정하지 않는다 — 필요 시 PR 리뷰를 거친다
- `main` 브랜치에 직접 머지하지 않는다
- npm 외 다른 패키지 매니저(yarn/pnpm)를 혼용하지 않는다
- `apps/web`과 `apps/api`의 의존성을 서로 뒤섞어 설치하지 않는다 (workspace 범위를 지켜서 설치)

---
*이 문서는 팀 컨벤션 체크리스트(Phase 0)에서 반대 의견 없이 확정된 내용을 기준으로 작성되었으며, 이후 모노레포 구조 결정에 맞춰 갱신되었습니다.*
