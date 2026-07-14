// 온보딩 전 구간에서 공유하는 타입
// CLAUDE.md 컨벤션: 타입은 PascalCase

export type Season = "봄" | "여름" | "가을" | "겨울" | "사계절";

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
  selfSelectedTone: "웜톤" | "쿨톤" | "모름" | null;
}

// BE1이 비전 API 응답으로 채워주는 결과 형태 (FE1은 이 타입을 그대로 받아 렌더링만 함)
export interface PersonalColorResult {
  season: "봄웜" | "여름쿨" | "가을웜" | "겨울쿨";
  confidence: number; // 0~1
  recommendedColors: string[]; // hex 배열
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

export interface InitialClosetItem {
  id: string;
  imageFile: File | null;
  previewUrl: string | null;
  category: string | null;
  color: string | null;
  seasons: Season[];
}

export interface OnboardingState {
  personalColor: PersonalColorInput;
  personalColorResult: PersonalColorResult | null;
  bodyInfo: BodyInfoInput;
  budget: BudgetInput;
  initialClosetItems: InitialClosetItem[];
}

export const ONBOARDING_STEPS = [
  "intro",
  "personal-color",
  "body-info",
  "budget",
  "initial-closet",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
