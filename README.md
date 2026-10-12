# 코디업 (CodyUp)

> **옷을 추천받는 앱이 아니라, 옷장을 계획하고 코디 실력을 키우는 앱**

옷장 데이터·퍼스널컬러·체형을 기반으로 **예산 안에서 무엇을 살지 우선순위를 제시**하고, 지금 가진 옷만으로 만들 수 있는 코디를 **점수와 이유**와 함께 평가·추천하는 AI 스타일링 매니지먼트 서비스입니다.
멋쟁이사자처럼 교내 해커톤(2026)에서 6인 팀(FE 2 · BE 2 · 기획 1 · 디자인 1)으로 개발했습니다.

[▶ 데모 영상](https://youtube.com/shorts/QHdaH5c96Pc) · [Notion 원본 기록](https://eggplant-tiglon-fa0.notion.site/392be414a28880418b7ae2470f7a0b57?source=copy_link)

<p>
  <img src="docs/images/home.png" alt="홈" width="190" />
  <img src="docs/images/closet-analysis.png" alt="AI 옷장 분석" width="190" />
  <img src="docs/images/coordi-evaluation.png" alt="AI 코디 평가 결과" width="190" />
  <img src="docs/images/style-plan.png" alt="스타일 플랜(구매 로드맵)" width="190" />
</p>

## 주요 기능

| 기능 | 설명 |
|---|---|
| 내 옷장 | 카테고리·색상·핏·기장·브랜드·메모로 옷 등록/수정/삭제 (1차는 수동 입력) |
| AI 옷장 분석 | 옷장 완성도(%), 카테고리 분포, 퍼스널컬러·체형을 반영한 종합 분석, 지금 바로 만들 수 있는 코디 목록 |
| AI 코디 평가·추천 | 고른 옷 조합을 100점 만점으로 채점하고 **좋은 점 / 개선할 점**을 근거와 함께 제시 |
| 스타일 플랜 | 월 예산 안에서 "무엇을·얼마에·어떤 순서로" 살지 우선순위 로드맵. 각 아이템이 코디 점수를 몇 점 올리는지 함께 표시 |
| 온보딩·마이페이지 | 퍼스널컬러(9톤 중 선택)·체형·월 예산 입력과 수정 |

## 핵심 설계 — 코디 규칙 점수 시스템

AI 코디 평가·추천, 옷장 완성도, 구매 로드맵 세 기능이 **하나의 채점 엔진**([`coordi-scoring.ts`](apps/api/src/services/coaching/coordi-scoring.ts))을 공유합니다. "좋은 코디"의 기준을 한 곳에 정의해두었기 때문에, 코디를 평가할 때도 다음에 뭘 살지 추천할 때도 같은 기준으로 답합니다.

| 항목 | 배점 | 기준 |
|---|---|---|
| 기본 완성도 | 40 | 상의·하의·신발 구성 여부 |
| 아우터 | +5 | 아우터 포함 |
| 색상 궁합 | +10 (충돌 시 감점) | 색상환(HSL) 각도 차이로 유사색/보색/충돌 판정 |
| 무채색 | +5 | 블랙·화이트·그레이 계열 포함 |
| 퍼스널컬러 매칭 | +15 | 12톤별 추천 색상 포함 여부 |
| 체형 핏·기장 | +15 | 체형별 선호 핏·기장과의 일치 |
| 체형 보완 색상 | +10 | 상·하의 명도 배치가 체형 보완 규칙에 맞는지 |
| 즐겨찾기 | +3 가산 | 100점 상한 |

**왜 LLM이 아니라 규칙 기반인가** — 초기에는 LLM API 연동을 염두에 뒀지만(`.env.example`에 `LLM_API_KEY` 자리가 그 흔적), 해커톤 일정, 라이브 데모의 응답 안정성, 그리고 *"왜 이 점수인가"를 사용자에게 근거로 보여줘야 하는 코칭 서비스의 성격* 때문에 결정론적 점수 시스템으로 구현했습니다. 배점표 자체가 곧 설명이 됩니다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite`, CSS `@theme`로 디자인 토큰 정의) |
| 백엔드 | Node.js (LTS 20.x) + Express + TypeScript |
| DB | MySQL 8 (Prisma ORM) |
| 인증 | JWT (Bearer 토큰) |
| 패키지 매니저 | npm workspaces |

## 아키텍처

모노레포 하나에 프론트(`apps/web`)와 백엔드(`apps/api`)가 함께 있고, 백엔드는 `routes → controllers → services` 계층으로 나뉩니다. 도메인(옷장·유저 / 로드맵·코칭) 단위로 서비스를 분리해 담당자별 작업 영역이 겹치지 않게 했습니다.

```
codyup/
  apps/
    web/    # 프론트엔드 (Vite + React)
      src/pages/{onboarding,closet,style-plan,coaching,mypage,dashboard}
    api/    # 백엔드 (Express + Prisma)
      src/services/{closet,user,roadmap,coaching}
      prisma/schema.prisma
  docs/images/   # README 스크린샷
  package.json   # workspaces 루트
  CLAUDE.md      # 팀 공통 컨벤션 (사람 + AI 코딩 에이전트가 함께 참조)
```

- 모든 API는 `{ success, data, error }` 공통 응답 포맷과 `{도메인}_{번호}` 에러코드 규약을 따릅니다.
- 팀원 전원이 각자의 AI 코딩 에이전트로 병렬 개발했기 때문에, 코드 스타일이 섞이지 않도록 개발 시작 전에 컨벤션을 [CLAUDE.md](CLAUDE.md) 한 문서로 합의했습니다.

## 팀과 역할

| 역할 | 담당 |
|---|---|
| **개발 리드 · BE2 (김영재)** | 기술 컨벤션·아키텍처 수립, 역할 분담·일정 조율, 브랜치·배포 프로세스 결정 / 구매 로드맵 엔진, AI 코디 평가·추천 |
| BE1 | 옷장·유저 프로필 API, 옷장 진단 |
| FE1 | 온보딩, 내 옷장 화면 |
| FE2 | 스타일 플랜, 코디 코칭, 마이페이지, 홈 대시보드 |
| 기획 · 디자인 | 서비스 기획, 디자인 시스템 |

## 직접 해결한 문제들

- **API가 있는데 화면은 목업을 보여주던 버그** — `VITE_API_BASE_URL`이 비어있으면 실제 호출 없이 하드코딩 목업을 반환하던 가드가 4개 API 모듈에 남아 있어, 홈·스타일 플랜·코디 코칭·마이페이지가 실제 데이터와 무관한 화면을 보여주고 있었습니다. API를 직접 호출해 백엔드는 정상임을 확인한 뒤 화면 문구와 응답이 어긋나는 점에서 원인을 좁혀 가드를 제거했습니다.
- **로컬 MySQL root 비밀번호 불일치** — 설치본마다 root 비밀번호가 독립적이라 다른 환경의 값이 통하지 않았고, 서비스를 `--init-file`로 재시작해 복구했습니다.
- **보호된 `main` 브랜치와 배포 일정** — PR 없는 직접 병합이 저장소 규칙(GH013)으로 거부되는 것을 확인하고, 우회하지 않고 PR 프로세스로 전환했습니다.

## 현재 한계와 다음 단계

- 옷 등록은 **수동 입력**입니다. 비전 API 자동 태깅은 2차 기능으로 보류했습니다.
- 이미지 업로드(Cloudinary)는 아직 연동 전이라, 사진이 없는 아이템은 카테고리 아이콘으로 표시됩니다.
- 점수 시스템은 색상·체형·구성 중심이라 **아이템의 격식(캐주얼/포멀) 궁합**은 아직 모델링하지 않습니다.
- 추천 코디 선정 시 상의 색상 다양성만 보장하고 하의·아우터·신발의 다양성은 보장하지 않습니다.
- 다음 단계: AI 평가 정확도 고도화, 유저 간 코디 피드백 커뮤니티.

## 로컬 실행 가이드

### 사전 준비물

- Node.js 20 LTS
- MySQL 8
- Git

### ① 레포 클론

```bash
git clone https://github.com/kyj5311/codyup.git
cd codyup
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

프로젝트 루트에서 한 번만 실행하면 `apps/web`, `apps/api` 모두 설치됩니다.

```bash
npm install
```

### ⑤ DB 스키마 반영

```bash
cd apps/api
npx prisma generate
npx prisma db push
npm run db:seed   # 데모 계정 6개 생성 (PIN은 prisma/seed.ts 참고)
cd ../..
```

### ⑥ 서버 실행

터미널을 두 개 띄워 각각 실행합니다.

```bash
# 터미널 1 — 백엔드 (http://localhost:4000)
npm run dev --workspace api

# 터미널 2 — 프론트엔드 (http://localhost:5173)
npm run dev --workspace web
```

### ⑦ 접속

브라우저에서 [http://localhost:5173](http://localhost:5173) 을 열고, 로그인 화면에서 데모 계정(FE1 / FE2 / BE1 / BE2 / Planner / Designer)을 고르면 됩니다.

## Git 규칙

- 브랜치: `main`(배포용, 보호) / `dev`(통합용) / `feature/{이름}-{기능}`
- 커밋: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:` 등. 모노레포이므로 범위 표기 권장 (예: `feat(api): ...`, `feat(web): ...`)
- PR은 `dev`로만 머지, 최소 1인 승인 필요

자세한 팀 컨벤션은 [CLAUDE.md](CLAUDE.md)를 참고하세요.
