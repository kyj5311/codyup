import { httpClient, type ApiResponse } from "./http-client";

// BE2 담당(로드맵·AI 코칭 축) 영역의 엔드포인트.
// 현재 BE1 API 명세서에는 없는 기능이라 실제 경로는 BE2 확정 후 조정 필요.
// TODO(BE2): 아래 두 엔드포인트 확정되면 경로/응답 필드만 맞추면 됨.

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
