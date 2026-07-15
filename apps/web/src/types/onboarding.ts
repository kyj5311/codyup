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

// 퍼스널컬러 진단 UI(FE1) — 실제 판별 로직/모델 연동은 BE1 담당
export interface PersonalColorInput {
  uploadedImageFile: File | null;
  // 사용자가 사진 없이 직접 선택하는 경우를 위한 폴백 선택지
  selfSelectedTone: "웜톤" | "쿨톤" | null;
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
 * BE1 응답 예시가 "가을 웜 뮤트"처럼 공백으로 구분된 문자열이라,
 * 진단 결과("가을웜")나 수동 선택("웜톤")을 최대한 비슷한 형태로 변환.
 */
export function buildPersonalColorLabel(
  result: PersonalColorResult | null,
  manualTone: "웜톤" | "쿨톤" | null,
): string {
  if (result) {
    // "가을웜" -> "가을 웜" 처럼 계절/톤 사이에 공백 삽입
    return result.season.replace(/(웜|쿨)$/, " $1");
  }
  return manualTone ?? "";
}
