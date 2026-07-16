import { useEffect, useState } from "react";
import Tabs from "../../components/Tabs";
import PageHeader from "../../components/PageHeader";
import { fetchClosetItems } from "../../api/closet-api";
import type { ClosetItem, ClosetColor } from "../../types/closet";
import CoordiEvaluationPanel from "./components/CoordiEvaluationPanel";
import CoordiRecommendationPanel from "./components/CoordiRecommendationPanel";

const TABS = ["평가", "추천"] as const;
type CoachingTab = (typeof TABS)[number];

// 백엔드 미연동 상태에서 화면을 볼 수 있도록 준비한 목 옷장 데이터
const NAVY: ClosetColor = { name: "네이비", hex: "#33456b" };
const BEIGE: ClosetColor = { name: "베이지", hex: "#d8c3a0" };
const MOCK_CLOSET_ITEMS: ClosetItem[] = [
  {
    id: "closet-1",
    imageUrl: null,
    category: "상의",
    subCategory: "니트",
    color: NAVY,
    seasons: ["가을", "겨울"],
    memo: "",
  },
  {
    id: "closet-2",
    imageUrl: null,
    category: "하의",
    subCategory: "슬랙스",
    color: BEIGE,
    seasons: ["봄", "가을"],
    memo: "",
  },
  {
    id: "closet-3",
    imageUrl: null,
    category: "아우터",
    subCategory: "코트",
    color: NAVY,
    seasons: ["겨울"],
    memo: "",
  },
  {
    id: "closet-4",
    imageUrl: null,
    category: "신발",
    subCategory: "로퍼",
    color: BEIGE,
    seasons: ["봄", "가을"],
    memo: "",
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