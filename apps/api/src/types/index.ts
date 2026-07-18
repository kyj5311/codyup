// apps/api/src/types/index.ts

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ClosetItem {
  id: number;
  userId: number;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  memo?: string;
  fit?: string;
  length?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClosetAnalysis {
  totalItems: number;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
  missingCategories: string[];
}

export interface MissingItemSuggestion {
  category: string;
  reason: string;
  priority: number;
}

export interface UserProfile {
  personalColor: string | null;
  bodyType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  monthlyBudget: number | null;
  email: string;
  createdAt: string;
}

export interface UpdateUserProfileInput {
  personalColor?: string;
  bodyType?: string;
  heightCm?: number;
  weightKg?: number;
  monthlyBudget?: number;
}

export type RoadmapPriority = 'high' | 'medium' | 'low';

export interface RoadmapItem {
  id: number;
  category: string;
  itemName: string;
  estimatedPriceKrw: number;
  priority: RoadmapPriority;
  reason: string;
  recommendedColor: { name: string; hex: string } | null;
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

export interface CoordiEvaluationResult {
  id: string;
  closetItemIds: number[];
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  evaluatedAt: string;
}

export interface CoordiRecommendation {
  id: string;
  title: string;
  closetItemIds: number[];
  reason: string;
}

export interface DashboardTodayCoordiItem {
  id: string;
  imageUrl: string | null;
  colorHex: string;
  colorName: string;
  label: string;
}

export interface DashboardNextRoadmapItem {
  id: string;
  itemName: string;
  estimatedPriceKrw: number;
}

export interface DashboardSummary {
  nickname: string;
  closetCompletionPercent: number;
  todayCoordi: DashboardTodayCoordiItem[];
  nextRoadmapItem: DashboardNextRoadmapItem | null;
  latestEvaluationScore: number | null;
}
