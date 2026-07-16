import { apiClient, type ApiResponse } from "./api-client";
import type {
  CoordiEvaluationRequest,
  CoordiEvaluationResult,
  CoordiRecommendation,
} from "../types/coaching";

// TODO(BE2): 실제 AI 평가/추천 엔드포인트 스펙 확정되면 아래 목데이터 제거
const MOCK_RECOMMENDATIONS: CoordiRecommendation[] = [
  {
    id: "rec-1",
    title: "오피스 캐주얼",
    closetItemIds: ["closet-1", "closet-3"],
    reason: "보유하신 네이비 톤 아이템으로 차분한 느낌을 냈어요.",
  },
  {
    id: "rec-2",
    title: "주말 나들이룩",
    closetItemIds: ["closet-2", "closet-4"],
    reason: "가벼운 소재끼리 매치해 편안한 인상을 줘요.",
  },
];

function buildMockEvaluation(
  closetItemIds: string[],
): CoordiEvaluationResult {
  return {
    id: `eval-${Date.now()}`,
    closetItemIds,
    score: 78,
    summary: "색상 밸런스는 좋지만 상하의 핏 대비가 조금 아쉬워요.",
    strengths: ["색상 조합이 자연스러워요", "계절감이 잘 맞아요"],
    improvements: ["아우터를 더 여유 있는 핏으로 바꿔보세요"],
    evaluatedAt: new Date().toISOString(),
  };
}

/** AI 코디 평가 — TODO(BE2): POST /api/coordi-evaluations 스펙 확정 (에러코드: EVAL_xxx) */
export async function evaluateCoordi(
  request: CoordiEvaluationRequest,
): Promise<ApiResponse<CoordiEvaluationResult>> {
  try {
    const { data } = await apiClient.post<ApiResponse<CoordiEvaluationResult>>(
      "/api/coordi-evaluations",
      request,
    );
    return data;
  } catch (err) {
    console.warn("[coaching-api] 백엔드 미연동 - 목데이터로 대체", err);
    if (request.closetItemIds.length === 0) {
      return {
        success: false,
        data: null,
        error: { code: "EVAL_001", message: "평가할 옷을 1개 이상 선택해주세요." },
      };
    }
    return {
      success: true,
      data: buildMockEvaluation(request.closetItemIds),
      error: null,
    };
  }
}

/** AI 코디 추천 목록 — TODO(BE2): GET /api/coordi-recommendations 스펙 확정 */
export async function fetchCoordiRecommendations(): Promise
  ApiResponse<CoordiRecommendation[]>
> {
  try {
    const { data } = await apiClient.get<ApiResponse<CoordiRecommendation[]>>(
      "/api/coordi-recommendations",
    );
    return data;
  } catch (err) {
    console.warn("[coaching-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_RECOMMENDATIONS, error: null };
  }
}