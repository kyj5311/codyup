# FE1 내 옷장 화면 구현 안내

CLAUDE.md 기준 FE1 담당 영역 중 '내 옷장 화면 전체'를 구현했습니다.
BE1이 맡은 옷장 CRUD API는 실제 엔드포인트가 없으므로
`apps/web/src/api/closet-api.ts`에 axios 스텁을 만들어 두었고,
`TODO(BE1)` 주석으로 연동 지점을 표시했습니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `pages/closet/ClosetFlow.tsx` | 목록/등록/상세 3개 화면 상태 관리 (진입점) |
| `pages/closet/ClosetHome.tsx` | 옷장 목록 - 전체/상의/하의/아우터/신발 탭, 그리드, 편집(삭제) 토글, 등록 FAB |
| `pages/closet/ClosetItemForm.tsx` | 옷 등록/수정 공용 폼 - 사진/카테고리/색상/계절/메모 |
| `pages/closet/ClosetItemDetail.tsx` | 옷 상세 - 수정 버튼으로 폼 전환, 삭제하기 |
| `types/closet.ts` | ClosetItem, 카테고리/색상/계절 타입 및 상수 |
| `api/closet-api.ts` | 옷장 CRUD axios 스텁 (BE1 연동 지점) |
| `components/Tabs.tsx` | 공통 탭 컴포넌트 (제네릭, 다른 화면에서도 재사용 가능) |

기존 온보딩에서 만든 `Button`, `Card`, `Chip` 컴포넌트를 그대로 재사용합니다.

## 프로젝트에 반영하는 법

1. 위 파일들을 실제 레포의 같은 경로에 복사 (겹치는 파일 없음, 새로 추가되는 파일만 있음)
2. 라우터에 `/closet` 경로 연결
   ```tsx
   <Route path="/closet" element={<ClosetFlow />} />
   ```
3. `npm run build`로 타입 에러 없는지 확인 (React19/Vite8/Tailwind4.3 조합에서 검증 완료)
4. BE1이 실제 API를 만들면 `closet-api.ts`의 요청/응답 필드만 맞추면 됩니다. UI 코드는 안 건드려도 됩니다.

## 디자인 근거

첨부 PDF의 '내옷장' 목록 화면(탭+총 개수+편집+그리드+FAB), '옷 등록' 화면(사진업로드+카테고리+색상+계절+메모+완료),
'옷 등록 수정' 화면(수정/삭제하기)을 그대로 재현했습니다. 색상 토큰은 온보딩과 동일한
`--color-cream` / `--color-yellow` / `--color-ink` 세트를 사용합니다.

## 업데이트 (아이콘 규칙 준수)

CLAUDE.md 디자인 시스템 규칙("아이콘: `lucide-react` 통일, 임의 SVG 혼용 금지")에 맞춰
`≡`/`♪`/`←`/`×` 같은 텍스트 문자 아이콘을 `lucide-react`의 `Menu`/`Bell`/`ChevronLeft`/`X`/`Plus`로 교체했습니다.
`package.json`에 `lucide-react` 의존성을 추가해야 합니다.

```bash
npm install lucide-react
```
