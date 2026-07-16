import { apiClient, type ApiResponse } from "./api-client";
import type { UpdateProfileRequest, UserProfile } from "../types/mypage";

// TODO(BE1): 실제 유저 프로필 엔드포인트 스펙 확정되면 아래 목데이터 제거
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

/** 내 프로필 조회 — TODO(BE1): GET /api/users/me 스펙 확정 */
export async function fetchMyProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const { data } =
      await apiClient.get<ApiResponse<UserProfile>>("/api/users/me");
    return data;
  } catch (err) {
    console.warn("[mypage-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_PROFILE, error: null };
  }
}

/** 프로필 수정 — TODO(BE1): PATCH /api/users/me 스펙 확정 */
export async function updateMyProfile(
  patch: UpdateProfileRequest,
): Promise<ApiResponse<UserProfile>> {
  try {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      "/api/users/me",
      patch,
    );
    return data;
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