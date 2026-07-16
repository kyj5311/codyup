import { apiClient, type ApiResponse } from "./api-client";
import type { DashboardSummary } from "../types/dashboard";

// TODO(BE1/BE2): 실제 대시보드 요약 엔드포인트 스펙 확정되면 아래 목데이터 제거
const MOCK_DASHBOARD: DashboardSummary = {
  nickname: "코디업러",
  closetCompletionPercent: 62,
  todayCoordi: [
    { id: "tc-1", imageUrl: null, colorHex: "#33456b", colorName: "네이비", label: "니트" },
    { id: "tc-2", imageUrl: null, colorHex: "#d8c3a0", colorName: "베이지", label: "슬랙스" },
    { id: "tc-3", imageUrl: null, colorHex: "#1c1b19", colorName: "블랙", label: "로퍼" },
  ],
  nextRoadmapItem: {
    id: "rm-1",
    itemName: "베이지 트렌치코트",
    estimatedPriceKrw: 120000,
  },
  latestEvaluationScore: 78,
};

/** 홈 대시보드 요약 — TODO(BE1/BE2): GET /api/dashboard-summary 스펙 확정 */
export async function fetchDashboardSummary(): Promise
  ApiResponse<DashboardSummary>
> {
  try {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(
      "/api/dashboard-summary",
    );
    return data;
  } catch (err) {
    console.warn("[dashboard-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_DASHBOARD, error: null };
  }
}