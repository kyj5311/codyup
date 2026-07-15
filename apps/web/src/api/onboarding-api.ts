import axios from "axios";
import type {
  BodyInfoInput,
  BudgetInput,
  PersonalColorResult,
} from "../types/onboarding";

// CLAUDE.md 규약: 공통 응답 포맷 { success, data, error }
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 퍼스널컬러 진단 요청
 * 담당: FE1(업로드 UI) + BE1(비전 API 연동)
 * TODO(BE1): POST /api/personal-color-diagnosis 스펙 확정 후 응답 매핑 검증
 */
export async function requestPersonalColorDiagnosis(
  imageFile: File,
): Promise<ApiResponse<PersonalColorResult>> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const { data } = await client.post<ApiResponse<PersonalColorResult>>(
    "/api/personal-color-diagnosis",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/**
 * 체형 정보 저장
 * 담당: FE1(입력 폼) + BE1(저장 API)
 * TODO(BE1): POST /api/user-body-profile 스펙 확정
 */
export async function saveBodyInfo(
  payload: BodyInfoInput,
): Promise<ApiResponse<null>> {
  const { data } = await client.post<ApiResponse<null>>(
    "/api/user-body-profile",
    payload,
  );
  return data;
}

/**
 * 월 예산 저장 (구매 로드맵 엔진과 연결)
 * 담당: FE1(입력 폼) + BE2(예산 데이터 저장)
 * TODO(BE2): POST /api/purchase-roadmap/budget 스펙 확정
 */
export async function saveMonthlyBudget(
  payload: BudgetInput,
): Promise<ApiResponse<null>> {
  const { data } = await client.post<ApiResponse<null>>(
    "/api/purchase-roadmap/budget",
    payload,
  );
  return data;
}

/**
 * 온보딩 내 초기 옷장 아이템 등록
 * 담당: FE1(간단 등록 플로우, 내옷장 등록 로직 재사용) + BE1(옷장 CRUD)
 * TODO(BE1): POST /api/closet-items 스펙 확정 (기존 옷장 등록 API 재사용)
 */
export async function registerInitialClosetItem(
  imageFile: File,
  meta: { category: string; color: string; seasons: string[] },
): Promise<ApiResponse<{ id: string }>> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("category", meta.category);
  formData.append("color", meta.color);
  meta.seasons.forEach((season) => formData.append("seasons[]", season));

  const { data } = await client.post<ApiResponse<{ id: string }>>(
    "/api/closet-items",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
