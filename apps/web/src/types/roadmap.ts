// 스타일 플랜(예산 기반 구매 로드맵) 화면에서 쓰는 타입 (FE2 담당)
// 옷 카테고리는 내옷장(FE1) 타입을 그대로 재사용해 일관성 유지

import type { ClothingCategory, ClosetColorOption } from "./closet";

export type RoadmapPriority = "high" | "medium" | "low";

export const PRIORITY_LABEL: Record<RoadmapPriority, string> = {
  high: "우선 구매",
  medium: "추천",
  low: "여유 있을 때",
};

export interface RoadmapItem {
  id: string;
  category: ClothingCategory;
  itemName: string;
  estimatedPriceKrw: number; // KRW 정수, 소수점 없음
  priority: RoadmapPriority;
  reason: string;
  recommendedColor: ClosetColorOption | null;
  isPurchased: boolean;
}

export interface RoadmapSummary {
  monthlyBudgetKrw: number;
  allocatedKrw: number;
  remainingKrw: number;
}

export interface RoadmapData {
  summary: RoadmapSummary;
  items: RoadmapItem[];
}