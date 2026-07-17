// 코디 코칭(AI 코디 평가/추천) 화면에서 쓰는 타입 (FE2 담당)
// closetItemIds는 옷장 아이템의 실제 id 타입(number, BE1 명세 기준)을 따른다.

export interface CoordiEvaluationRequest {
  closetItemIds: number[];
}

export interface CoordiEvaluationResult {
  id: string;
  closetItemIds: number[];
  score: number; // 0~100
  summary: string;
  strengths: string[];
  improvements: string[];
  evaluatedAt: string; // ISO 8601
}

export interface CoordiRecommendation {
  id: string;
  title: string;
  closetItemIds: number[];
  reason: string;
}