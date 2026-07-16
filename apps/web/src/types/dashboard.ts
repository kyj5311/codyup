// 홈 대시보드 화면에서 쓰는 타입 (FE2 담당)

export interface TodayCoordiItem {
  id: string;
  imageUrl: string | null;
  colorHex: string;
  colorName: string;
  label: string;
}

export interface NextRoadmapPreview {
  id: string;
  itemName: string;
  estimatedPriceKrw: number;
}

export interface DashboardSummary {
  nickname: string;
  closetCompletionPercent: number; // 0~100
  todayCoordi: TodayCoordiItem[];
  nextRoadmapItem: NextRoadmapPreview | null;
  latestEvaluationScore: number | null;
}