import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import PageHeader from "../../components/PageHeader";
import { fetchRoadmap, toggleRoadmapItemPurchased } from "../../api/roadmap-api";
import type { RoadmapData, RoadmapItem } from "../../types/roadmap";
import type { ClothingCategory } from "../../types/closet";
import RoadmapItemCard from "./components/RoadmapItemCard";

type CategoryFilter = ClothingCategory | "전체";

const CATEGORY_FILTERS: CategoryFilter[] = [
  "전체",
  "상의",
  "하의",
  "아우터",
  "신발",
];

export default function StylePlanHome() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>("전체");

  useEffect(() => {
    let ignore = false;
    fetchRoadmap().then((res) => {
      if (ignore) return;
      if (res.success && res.data) setRoadmap(res.data);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (!roadmap) return [];
    if (filter === "전체") return roadmap.items;
    return roadmap.items.filter((item) => item.category === filter);
  }, [roadmap, filter]);

  async function handleTogglePurchased(item: RoadmapItem) {
    if (!roadmap) return;
    const nextValue = !item.isPurchased;

    // 낙관적 업데이트
    setRoadmap({
      ...roadmap,
      items: roadmap.items.map((i) =>
        i.id === item.id ? { ...i, isPurchased: nextValue } : i,
      ),
    });

    const res = await toggleRoadmapItemPurchased(item.id, nextValue);
    if (!res.success) {
      // 실패 시 롤백
      setRoadmap((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === item.id ? { ...i, isPurchased: item.isPurchased } : i,
              ),
            }
          : prev,
      );
    }
  }

  if (isLoading) {
    return <p className="p-5 text-sm text-gray-text">불러오는 중...</p>;
  }

  if (!roadmap) {
    return (
      <p className="p-5 text-sm text-gray-text">
        구매 로드맵을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  const { summary } = roadmap;

  return (
    <div className="flex flex-col gap-5 p-5">
      <PageHeader title="스타일 플랜" />

      <Card tone="cream">
        <p className="text-sm text-ink-soft">이번 달 예산</p>
        <p className="mt-1 text-2xl font-bold text-ink">
          {summary.monthlyBudgetKrw.toLocaleString("ko-KR")}원
        </p>
        <div className="mt-3 flex justify-between text-xs text-gray-text">
          <span>
            사용 예정 {summary.allocatedKrw.toLocaleString("ko-KR")}원
          </span>
          <span>남은 예산 {summary.remainingKrw.toLocaleString("ko-KR")}원</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-cream-deep">
          <div
            className="h-full rounded-pill bg-yellow-deep"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (summary.allocatedKrw / summary.monthlyBudgetKrw) * 100,
                ),
              )}%`,
            }}
          />
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((category) => (
          <Chip
            key={category}
            selected={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visibleItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-text">
            해당 카테고리의 추천 아이템이 없어요.
          </p>
        ) : (
          visibleItems.map((item) => (
            <RoadmapItemCard
              key={item.id}
              item={item}
              onTogglePurchased={handleTogglePurchased}
            />
          ))
        )}
      </div>
    </div>
  );
}