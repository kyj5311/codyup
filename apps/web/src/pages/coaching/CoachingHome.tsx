import { useEffect, useState } from "react";
import Tabs from "../../components/Tabs";
import PageHeader from "../../components/PageHeader";
import { fetchClosetItems } from "../../api/closet-api";
import type { ClosetItem } from "../../types/closet";
import CoordiEvaluationPanel from "./components/CoordiEvaluationPanel";
import CoordiRecommendationPanel from "./components/CoordiRecommendationPanel";

const TABS = ["평가", "추천"] as const;
type CoachingTab = (typeof TABS)[number];

// 백엔드 미연동 상태에서 화면을 볼 수 있도록 준비한 목 옷장 데이터
// BE1 명세서 기준 ClosetItem 형태(id: number, color: string, subCategory 없음)에 맞춤
const NOW = new Date().toISOString();
const MOCK_CLOSET_ITEMS: ClosetItem[] = [
  {
    id: 1,
    userId: 1,
    imageUrl: "",
    category: "상의",
    color: "네이비",
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    userId: 1,
    imageUrl: "",
    category: "하의",
    color: "베이지",
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    userId: 1,
    imageUrl: "",
    category: "아우터",
    color: "네이비",
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    userId: 1,
    imageUrl: "",
    category: "신발",
    color: "베이지",
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export default function CoachingHome() {
  const [tab, setTab] = useState<CoachingTab>("평가");
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchClosetItems()
      .then((res) => {
        if (ignore) return;
        if (res.success && res.data && res.data.length > 0) {
          setClosetItems(res.data);
        } else {
          setClosetItems(MOCK_CLOSET_ITEMS);
        }
      })
      .catch(() => {
        if (!ignore) setClosetItems(MOCK_CLOSET_ITEMS);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      <PageHeader title="코디 코칭" />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {isLoading ? (
        <p className="py-8 text-center text-sm text-gray-text">
          불러오는 중...
        </p>
      ) : tab === "평가" ? (
        <CoordiEvaluationPanel closetItems={closetItems} />
      ) : (
        <CoordiRecommendationPanel closetItems={closetItems} />
      )}
    </div>
  );
}