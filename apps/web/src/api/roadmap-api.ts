import { apiClient, type ApiResponse } from "./api-client";
import type { RoadmapData, RoadmapItem } from "../types/roadmap";

// TODO(BE2): 실제 엔드포인트 스펙 확정되면 아래 목데이터 제거
const MOCK_ROADMAP: RoadmapData = {
  summary: {
    monthlyBudgetKrw: 300000,
    allocatedKrw: 210000,
    remainingKrw: 90000,
  },
  items: [
    {
      id: "rm-1",
      category: "아우터",
      itemName: "베이지 트렌치코트",
      estimatedPriceKrw: 120000,
      priority: "high",
      reason: "옷장에 봄/가을용 아우터가 없어요. 활용도가 가장 높아요.",
      recommendedColor: { name: "베이지", hex: "#d8c3a0" },
      isPurchased: false,
    },
    {
      id: "rm-2",
      category: "하의",
      itemName: "네이비 슬랙스",
      estimatedPriceKrw: 59000,
      priority: "high",
      reason: "보유한 상의 대부분과 잘 어울리는 기본템이에요.",
      recommendedColor: { name: "네이비", hex: "#33456b" },
      isPurchased: false,
    },
    {
      id: "rm-3",
      category: "신발",
      itemName: "화이트 스니커즈",
      estimatedPriceKrw: 89000,
      priority: "medium",
      reason: "캐주얼 코디 완성도를 높여줘요.",
      recommendedColor: { name: "화이트", hex: "#ffffff" },
      isPurchased: false,
    },
    {
      id: "rm-4",
      category: "상의",
      itemName: "그레이 니트",
      estimatedPriceKrw: 45000,
      priority: "low",
      reason: "가을 레이어드용으로 여유 있을 때 추가하면 좋아요.",
      recommendedColor: { name: "그레이", hex: "#a8a49c" },
      isPurchased: true,
    },
  ],
};

/** 구매 로드맵 조회 — TODO(BE2): GET /api/purchase-roadmap 스펙 확정 */
export async function fetchRoadmap(): Promise<ApiResponse<RoadmapData>> {
  try {
    const { data } =
      await apiClient.get<ApiResponse<RoadmapData>>("/api/purchase-roadmap");
    return data;
  } catch (err) {
    console.warn("[roadmap-api] 백엔드 미연동 - 목데이터로 대체", err);
    return { success: true, data: MOCK_ROADMAP, error: null };
  }
}

/** 구매 완료 토글 — TODO(BE2): PATCH /api/purchase-roadmap/:id 스펙 확정 */
export async function toggleRoadmapItemPurchased(
  itemId: string,
  isPurchased: boolean,
): Promise<ApiResponse<RoadmapItem>> {
  try {
    const { data } = await apiClient.patch<ApiResponse<RoadmapItem>>(
      `/api/purchase-roadmap/${itemId}`,
      { isPurchased },
    );
    return data;
  } catch (err) {
    console.warn("[roadmap-api] 백엔드 미연동 - 목데이터로 처리", err);
    const item = MOCK_ROADMAP.items.find((i) => i.id === itemId) ?? null;
    if (item) item.isPurchased = isPurchased;
    return {
      success: !!item,
      data: item,
      error: item
        ? null
        : { code: "ROADMAP_001", message: "로드맵 아이템을 찾을 수 없습니다." },
    };
  }
}