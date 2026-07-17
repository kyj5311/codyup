import { httpClient, type ApiResponse } from "./http-client";
import { apiClient, hasApiBase } from "./api-client";
import type {
  CoordiEvaluationRequest,
  CoordiEvaluationResult,
  CoordiRecommendation,
} from "../types/coaching";

// BE2 담당(로드맵·AI 코칭 축) 영역의 엔드포인트.
// 현재 BE1 API 명세서에는 없는 기능이라 실제 경로는 BE2 확정 후 조정 필요.
// TODO(BE2): 아래 두 엔드포인트 확정되면 경로/응답 필드만 맞추면 됨.

// "코디 코칭" 탭(CoordiEvaluationPanel/CoordiRecommendationPanel)이 쓰는 실제 BE2 엔드포인트.
// POST /api/coordi-evaluations, GET /api/coordi-recommendations — BE2가 이미 구현/검증 완료.
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

function buildMockEvaluation(closetItemIds: string[]): CoordiEvaluationResult {
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

/** AI 코디 평가 — POST /api/coordi-evaluations (에러코드: EVAL_xxx) */
export async function evaluateCoordi(
  request: CoordiEvaluationRequest,
): Promise<ApiResponse<CoordiEvaluationResult>> {
  if (!hasApiBase()) {
    if (request.closetItemIds.length === 0) {
      return {
        success: false,
        data: null,
        error: { code: "EVAL_001", message: "평가할 옷을 1개 이상 선택해주세요." },
      };
    }
    return { success: true, data: buildMockEvaluation(request.closetItemIds), error: null };
  }
  try {
    const { data } = await apiClient.post<ApiResponse<CoordiEvaluationResult>>(
      "/coordi-evaluations",
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
    return { success: true, data: buildMockEvaluation(request.closetItemIds), error: null };
  }
}

/** AI 코디 추천 목록 — GET /api/coordi-recommendations */
export async function fetchCoordiRecommendations(): Promise<ApiResponse<CoordiRecommendation[]>> {
  if (!hasApiBase()) {
    return { success: true, data: MOCK_RECOMMENDATIONS, error: null };
  }
  try {
    const { data } = await apiClient.get<ApiResponse<CoordiRecommendation[]>>(
      "/coordi-recommendations",
    );
    return data;
  } catch (err) {
    console.warn("[coaching-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_RECOMMENDATIONS, error: null };
  }
}

export interface AiClosetSummary {
  summary: string;
}

export interface UsableCoordi {
  id: number;
  title: string;
  itemIds: number[];
}

/** AI 종합 분석 — TODO(BE2): 옷장 데이터를 바탕으로 한 텍스트 인사이트 */
export async function fetchAiClosetSummary(): Promise<
  ApiResponse<AiClosetSummary>
> {
  const { data } = await httpClient.get<ApiResponse<AiClosetSummary>>(
    "/coaching/closet-summary",
  );
  return data;
}

/** 활용 가능한 코디 — TODO(BE2): 지금 옷장으로 조합 가능한 코디 추천 목록 */
export async function fetchUsableCoordis(): Promise<
  ApiResponse<UsableCoordi[]>
> {
  const { data } = await httpClient.get<ApiResponse<UsableCoordi[]>>(
    "/coaching/usable-coordis",
  );
  return data;
}
