// 마이페이지 화면에서 쓰는 타입 (FE2 담당)
// 체형/예산/퍼스널컬러는 온보딩(FE1) 타입을 그대로 재사용

import type {
  BodyInfoInput,
  BudgetInput,
  PersonalColorResult,
} from "./onboarding";

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  bodyInfo: BodyInfoInput;
  budget: BudgetInput;
  personalColorResult: PersonalColorResult | null;
  joinedAt: string; // ISO 8601
}

export interface UpdateProfileRequest {
  nickname?: string;
  bodyInfo?: BodyInfoInput;
  budget?: BudgetInput;
}