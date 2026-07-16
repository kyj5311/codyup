import { useEffect, useState } from "react";
import Card from "../../../components/Card";
import ClosetItemThumbnail from "../../../components/ClosetItemThumbnail";
import { fetchCoordiRecommendations } from "../../../api/coaching-api";
import type { CoordiRecommendation } from "../../../types/coaching";
import type { ClosetItem } from "../../../types/closet";

interface CoordiRecommendationPanelProps {
  closetItems: ClosetItem[];
}

export default function CoordiRecommendationPanel({
  closetItems,
}: CoordiRecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState
    CoordiRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchCoordiRecommendations().then((res) => {
      if (ignore) return;
      if (res.success && res.data) setRecommendations(res.data);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  function findItem(id: string): ClosetItem | undefined {
    return closetItems.find((item) => item.id === id);
  }

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-gray-text">불러오는 중...</p>;
  }

  if (recommendations.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-text">
        아직 추천할 코디가 없어요. 옷장을 더 채워보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec) => (
        <Card key={rec.id} tone="cream">
          <p className="text-[15px] font-semibold text-ink">{rec.title}</p>
          <p className="mt-1 text-sm text-ink-soft">{rec.reason}</p>
          <div className="mt-3 flex gap-2">
            {rec.closetItemIds.map((id) => {
              const item = findItem(id);
              return (
                <ClosetItemThumbnail
                  key={id}
                  imageUrl={item?.imageUrl ?? null}
                  alt={item ? `${item.color.name} ${item.subCategory}` : "옷"}
                  className="aspect-square w-16"
                />
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}