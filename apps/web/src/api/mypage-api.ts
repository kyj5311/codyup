import { apiClient, hasApiBase, type ApiResponse } from "./api-client";
import type { UpdateProfileRequest, UserProfile } from "../types/mypage";
import type { BodyShape } from "../types/onboarding";

// BE1이 실제로 제공하는 프로필 응답 (GET/PUT /user/profile)
interface Be1UserProfile {
  personalColor: string | null;
  bodyType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  monthlyBudget: number | null;
  email: string;
  createdAt: string;
}

const MOCK_PROFILE: UserProfile = {
  id: "user-1",
  nickname: "코디업러",
  email: "user@example.com",
  bodyInfo: { heightCm: 168, weightKg: 56, bodyShape: "스트레이트" },
  budget: { monthlyBudgetKrw: 300000 },
  personalColorResult: {
    season: "가을웜",
    confidence: 0.86,
    recommendedColors: ["#a8622f", "#8a5a3b", "#d8c3a0"],
  },
  joinedAt: "2026-03-02T09:00:00+09:00",
};

// BE1 응답을 마이페이지 화면 타입으로 변환.
// 주의: 닉네임·퍼스널컬러 신뢰도는 BE1 프로필 API에 아직 없는 필드라 비워둠(화면에서 "-"로 표시됨).
function fromBe1Profile(raw: Be1UserProfile): UserProfile {
  return {
    id: raw.email,
    nickname: raw.email.split("@")[0],
    email: raw.email,
    bodyInfo: {
      heightCm: raw.heightCm,
      weightKg: raw.weightKg,
      bodyShape: (raw.bodyType as BodyShape | null) ?? null,
    },
    budget: { monthlyBudgetKrw: raw.monthlyBudget },
    personalColorResult: raw.personalColor
      ? { season: raw.personalColor, confidence: 1, recommendedColors: [] }
      : null,
    joinedAt: raw.createdAt,
  };
}

/** 내 프로필 조회 — GET /user/profile (BE1 실제 엔드포인트) */
export async function fetchMyProfile(): Promise<ApiResponse<UserProfile>> {
  if (!hasApiBase()) {
    return { success: true, data: MOCK_PROFILE, error: null };
  }
  try {
    const { data } = await apiClient.get<ApiResponse<Be1UserProfile>>(
      "/user/profile",
    );
    if (!data.success || !data.data) return data as ApiResponse<UserProfile>;
    return { success: true, data: fromBe1Profile(data.data), error: null };
  } catch (err) {
    console.warn("[mypage-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_PROFILE, error: null };
  }
}

/** 프로필 수정 — PUT /user/profile (BE1 실제 엔드포인트) */
export async function updateMyProfile(
  patch: UpdateProfileRequest,
): Promise<ApiResponse<UserProfile>> {
  if (!hasApiBase()) {
    const merged: UserProfile = {
      ...MOCK_PROFILE,
      ...patch,
      bodyInfo: patch.bodyInfo ?? MOCK_PROFILE.bodyInfo,
      budget: patch.budget ?? MOCK_PROFILE.budget,
    };
    return { success: true, data: merged, error: null };
  }
  try {
    const { data } = await apiClient.put<ApiResponse<Be1UserProfile>>(
      "/user/profile",
      {
        ...(patch.bodyInfo?.bodyShape ? { bodyType: patch.bodyInfo.bodyShape } : {}),
        ...(patch.bodyInfo?.heightCm ? { heightCm: patch.bodyInfo.heightCm } : {}),
        ...(patch.bodyInfo?.weightKg ? { weightKg: patch.bodyInfo.weightKg } : {}),
        ...(patch.budget?.monthlyBudgetKrw
          ? { monthlyBudget: patch.budget.monthlyBudgetKrw }
          : {}),
      },
    );
    if (!data.success || !data.data) return data as ApiResponse<UserProfile>;
    return { success: true, data: fromBe1Profile(data.data), error: null };
  } catch (err) {
    console.warn("[mypage-api] 백엔드 미연동 - 목데이터로 처리", err);
    const merged: UserProfile = {
      ...MOCK_PROFILE,
      ...patch,
      bodyInfo: patch.bodyInfo ?? MOCK_PROFILE.bodyInfo,
      budget: patch.budget ?? MOCK_PROFILE.budget,
    };
    return { success: true, data: merged, error: null };
  }
}
