// 데모/오프라인 상황에서 화면이 비어 보이지 않도록 쓰는 목업 데이터.
// 실제 API(GET /closet, GET /closet/analysis, GET /closet/missing) 호출이
// 실패했을 때만 폴백으로 사용되고, 성공하면 전혀 쓰이지 않는다.
import type {
  ClosetAnalysis,
  ClosetItem,
  MissingClosetItem,
} from "../types/closet";

export const MOCK_CLOSET_ITEMS: ClosetItem[] = [
  {
    id: 9001,
    userId: 0,
    imageUrl: "",
    category: "상의",
    color: "블랙",
    brand: "무신사 스탠다드",
    memo: "가장 자주 입는 기본 티셔츠",
    isFavorite: true,
    createdAt: "2026-07-01T09:00:00+09:00",
    updatedAt: "2026-07-01T09:00:00+09:00",
  },
  {
    id: 9002,
    userId: 0,
    imageUrl: "",
    category: "상의",
    color: "화이트",
    brand: "유니클로",
    isFavorite: false,
    createdAt: "2026-07-02T09:00:00+09:00",
    updatedAt: "2026-07-02T09:00:00+09:00",
  },
  {
    id: 9003,
    userId: 0,
    imageUrl: "",
    category: "상의",
    color: "화이트",
    isFavorite: false,
    createdAt: "2026-07-03T09:00:00+09:00",
    updatedAt: "2026-07-03T09:00:00+09:00",
  },
  {
    id: 9004,
    userId: 0,
    imageUrl: "",
    category: "하의",
    color: "블랙",
    brand: "리바이스",
    memo: "슬림 핏 청바지",
    isFavorite: false,
    createdAt: "2026-07-04T09:00:00+09:00",
    updatedAt: "2026-07-04T09:00:00+09:00",
  },
];

export const MOCK_CLOSET_ANALYSIS: ClosetAnalysis = {
  totalItems: 4,
  categoryCounts: { 상의: 3, 하의: 1 },
  colorCounts: { 블랙: 2, 화이트: 2 },
  missingCategories: ["아우터", "신발", "악세서리"],
};

export const MOCK_MISSING_ITEMS: MissingClosetItem[] = [
  {
    category: "아우터",
    reason: "아우터 아이템이 부족합니다. 코디 다양성을 위해 추가를 권장합니다.",
    priority: 1,
  },
  {
    category: "신발",
    reason: "신발 아이템이 부족합니다. 코디 다양성을 위해 추가를 권장합니다.",
    priority: 2,
  },
  {
    category: "악세서리",
    reason: "악세서리 아이템이 부족합니다. 코디 다양성을 위해 추가를 권장합니다.",
    priority: 3,
  },
];
