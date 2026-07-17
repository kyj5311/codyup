// 온보딩 전 구간에서 공유하는 타입
// CLAUDE.md 컨벤션: 타입은 PascalCase
import type { ClosetItem } from "./closet";

export type BodyShape =
  | "스트레이트"
  | "웨이브"
  | "내추럴"
  | "모래시계"
  | "직사각형"
  | "역삼각형";

// 퍼스널컬러 4계절 12톤 분류
export type PersonalColorTone =
  | "봄 라이트"
  | "봄 브라이트"
  | "봄 트루"
  | "여름 라이트"
  | "여름 뮤트"
  | "여름 브라이트"
  | "가을 뮤트"
  | "가을 딥"
  | "가을 스트롱"
  | "겨울 브라이트"
  | "겨울 딥"
  | "겨울 클리어";

export interface PersonalColorSeasonGroup {
  season: string;
  tones: PersonalColorTone[];
}

export const PERSONAL_COLOR_SEASONS: PersonalColorSeasonGroup[] = [
  { season: "봄 웜톤", tones: ["봄 라이트", "봄 브라이트", "봄 트루"] },
  { season: "여름 쿨톤", tones: ["여름 라이트", "여름 뮤트", "여름 브라이트"] },
  { season: "가을 웜톤", tones: ["가을 뮤트", "가을 딥", "가을 스트롱"] },
  { season: "겨울 쿨톤", tones: ["겨울 브라이트", "겨울 딥", "겨울 클리어"] },
];

// 퍼스널컬러 진단 UI(FE1) — 실제 판별 로직/모델 연동은 BE1 담당
export interface PersonalColorInput {
  uploadedImageFile: File | null;
  // 사용자가 사진 없이 직접 선택하는 경우를 위한 폴백 선택지
  selfSelectedTone: PersonalColorTone | null;
}

// 퍼스널컬러 진단 API 응답 (엔드포인트는 BE1 명세서에 아직 없음, 추후 확정)
export interface PersonalColorResult {
  season: string; // 예: "가을웜"
  confidence: number; // 0~1
}

export interface BodyInfoInput {
  heightCm: number | null;
  weightKg: number | null;
  bodyShape: BodyShape | null;
}

// 통화/가격: KRW, 정수(원 단위) — CLAUDE.md API 규약 준수
export interface BudgetInput {
  monthlyBudgetKrw: number | null;
}

export interface OnboardingState {
  personalColor: PersonalColorInput;
  personalColorResult: PersonalColorResult | null;
  bodyInfo: BodyInfoInput;
  budget: BudgetInput;
  initialClosetItems: ClosetItem[];
}

export const ONBOARDING_STEPS = [
  "intro",
  "personal-color",
  "body-info",
  "budget",
  "initial-closet",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/**
 * PUT /user/profile로 보낼 personalColor 문자열 조합.
 * 수동 선택은 "봄 라이트"처럼 12톤 라벨을 그대로 사용하고,
 * (아직 없는) 진단 API 결과는 그 계절/톤 문자열을 그대로 사용.
 */
export function buildPersonalColorLabel(
  result: PersonalColorResult | null,
  manualTone: PersonalColorTone | null,
): string {
  if (result) {
    return result.season;
  }
  return manualTone ?? "";
}
