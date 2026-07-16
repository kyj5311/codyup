// 코디 코칭(AI 코디 평가/추천) 화면에서 쓰는 타입 (FE2 담당)

export interface CoordiEvaluationRequest {
  closetItemIds: string[];
}

export interface CoordiEvaluationResult {
  id: string;
  closetItemIds: string[];
  score: number; // 0~100
  summary: string;
  strengths: string[];
  improvements: string[];
  evaluatedAt: string; // ISO 8601
}

export interface CoordiRecommendation {
  id: string;
  title: string;
  closetItemIds: string[];
  reason: string;
}