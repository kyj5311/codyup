import { httpClient, type ApiResponse } from "./http-client";

// BE1 명세서 기준: 퍼스널컬러/체형/월예산이 하나의 유저 프로필 API로 통합되어 있음
// (원래 CLAUDE.md 담당표엔 예산이 BE2 소관으로 되어 있었는데, 실제 스펙은 BE1의
//  /user/profile 하나로 합쳐져 있어 그에 맞춰 반영. 예산이 로드맵 엔진과 별도로도
//  필요한지는 BE2와 확인 필요.)

export interface UserProfilePayload {
  personalColor: string;
  bodyType: string;
  heightCm?: number;
  weightKg?: number;
  monthlyBudget: number;
}

export interface UserProfile extends UserProfilePayload {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/** 온보딩 프로필 저장 — PUT /user/profile */
export async function saveUserProfile(
  payload: UserProfilePayload,
): Promise<ApiResponse<UserProfile>> {
  const { data } = await httpClient.put<ApiResponse<UserProfile>>(
    "/user/profile",
    payload,
  );
  return data;
}

/** 온보딩 프로필 조회 — GET /user/profile */
export async function fetchUserProfile(): Promise<ApiResponse<UserProfile>> {
  const { data } = await httpClient.get<ApiResponse<UserProfile>>(
    "/user/profile",
  );
  return data;
}

/**
 * 퍼스널컬러 진단(사진 업로드 → 진단 결과) — BE1 명세서에는 아직 없는 엔드포인트.
 * PersonalColorStep에서 사진으로 진단을 시도하는 부분은 이 함수가 실제 API가
 * 생기기 전까지는 항상 실패하고, 사용자가 웜톤/쿨톤을 직접 선택하는 폴백으로
 * 넘어가도록 되어 있습니다. BE1에게 이 엔드포인트 스펙을 확인해주세요.
 */
export async function requestPersonalColorDiagnosis(
  imageFile: File,
): Promise<ApiResponse<{ season: string; confidence: number }>> {
  const formData = new FormData();
  formData.append("image", imageFile);
  const { data } = await httpClient.post<
    ApiResponse<{ season: string; confidence: number }>
  >("/personal-color-diagnosis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
