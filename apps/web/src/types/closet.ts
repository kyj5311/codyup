// 내 옷장 화면 타입 — BE1 API 명세서(CodyUp BE1 API 명세서.txt) 기준
// 주의: 명세서에는 소분류(subCategory)/계절(season) 필드가 없고,
// 대신 brand, isFavorite 필드가 있음. 기존 설계에서 이 부분을 스펙에 맞춰 조정함.

export type ClothingCategory = "상의" | "하의" | "아우터" | "신발" | "악세서리";

export const CATEGORIES: ClothingCategory[] = [
  "상의",
  "하의",
  "아우터",
  "신발",
  "악세서리",
];

export interface ClosetColorOption {
  name: string;
  hex: string;
}

export interface ClosetColorGroup {
  label: string;
  colors: ClosetColorOption[];
}

// 색상 종류가 많아서 계층형(아코디언)으로 묶어 보여주기 위한 그룹 단위 팔레트
// 퍼스널컬러 12톤 추천과 실제 매칭이 되도록 세분화된 팔레트로 확장
export const CLOSET_COLOR_GROUPS: ClosetColorGroup[] = [
  {
    label: "무채색/기본",
    colors: [
      { name: "화이트", hex: "#ffffff" },
      { name: "클리어", hex: "#f5f5f0" },
      { name: "라이트 그레이", hex: "#d4d1cb" },
      { name: "그레이", hex: "#a8a49c" },
      { name: "다크 그레이", hex: "#6b6862" },
      { name: "블랙", hex: "#1c1b19" },
      { name: "아이보리", hex: "#f2ead9" },
      { name: "오트밀", hex: "#ded2bd" },
      { name: "샌드", hex: "#d9c7a3" },
      { name: "베이지", hex: "#d8c3a0" },
      { name: "다크 베이지", hex: "#b89b73" },
      { name: "카키 베이지", hex: "#ac9a72" },
    ],
  },
  {
    label: "웜/브라운",
    colors: [
      { name: "라이트 브라운", hex: "#a97c50" },
      { name: "카멜", hex: "#c19a6b" },
      { name: "브라운", hex: "#8a5a3b" },
      { name: "다크 브라운", hex: "#5c3d28" },
      { name: "머스타드", hex: "#d1a83b" },
      { name: "카키", hex: "#8c8552" },
      { name: "올리브 그린", hex: "#6f7239" },
    ],
  },
  {
    label: "레드/핑크/오렌지",
    colors: [
      { name: "페일 핑크", hex: "#f2d6d6" },
      { name: "라이트 핑크", hex: "#f0b8c2" },
      { name: "핑크", hex: "#e893a8" },
      { name: "다크핑크", hex: "#c85c78" },
      { name: "피치", hex: "#f4b393" },
      { name: "라이트 오렌지", hex: "#f2a35c" },
      { name: "오렌지", hex: "#e8792e" },
      { name: "다크 오렌지", hex: "#c15a1e" },
      { name: "브릭", hex: "#a8442c" },
      { name: "레드", hex: "#c62828" },
      { name: "딥레드", hex: "#8e1f1f" },
      { name: "버건디", hex: "#5e1f2e" },
    ],
  },
  {
    label: "블루/퍼플",
    colors: [
      { name: "라벤더", hex: "#c3b1d9" },
      { name: "퍼플", hex: "#7c5a9e" },
      { name: "스카이 블루", hex: "#8fc3e0" },
      { name: "블루", hex: "#3a6ea8" },
      { name: "다크 블루", hex: "#294c73" },
      { name: "네이비", hex: "#33456b" },
      { name: "다크 네이비", hex: "#1f2c47" },
    ],
  },
  {
    label: "그린/옐로우",
    colors: [
      { name: "라임", hex: "#b5cc4e" },
      { name: "라이트 옐로우", hex: "#f2e28a" },
      { name: "옐로우", hex: "#f0cc3c" },
      { name: "라이트 그린", hex: "#a8cc8c" },
      { name: "그린", hex: "#4c6b4f" },
      { name: "다크 그린", hex: "#2f4530" },
      { name: "민트", hex: "#a3d9c5" },
    ],
  },
  {
    label: "데님/메탈",
    colors: [
      { name: "연청", hex: "#a9c2d9" },
      { name: "중청", hex: "#5d84ab" },
      { name: "진청", hex: "#35547a" },
      { name: "흑청", hex: "#22334a" },
      { name: "데님", hex: "#4a6d8c" },
      { name: "실버", hex: "#c7c9cb" },
      { name: "골드", hex: "#cba135" },
      { name: "로즈골드", hex: "#d9a892" },
    ],
  },
];

// UI 색상 스와치용 프리셋 — 서버에는 name(string)만 전송
export const CLOSET_COLORS: ClosetColorOption[] = CLOSET_COLOR_GROUPS.flatMap(
  (group) => group.colors,
);

// 체형 반영 코디 추천용 — 상의/하의/아우터에서만 입력받음 (신발/악세서리는 해당 없음)
export const FITTABLE_CATEGORIES: ClothingCategory[] = ["상의", "하의", "아우터"];

export const FIT_OPTIONS = ["슬림", "레귤러", "오버", "루즈"] as const;

// 기장 선택지는 카테고리마다 의미가 달라서(상의=크롭~롱, 하의=반바지~긴바지, 아우터=숏~롱) 따로 둠
export const LENGTH_OPTIONS_BY_CATEGORY: Partial<
  Record<ClothingCategory, string[]>
> = {
  상의: ["크롭", "레귤러", "롱"],
  하의: ["숏", "롱"],
  아우터: ["숏", "미디", "롱"],
};

// GET /closet, GET /closet/:id 응답 데이터 형태
export interface ClosetItem {
  id: number;
  userId: number;
  imageUrl: string;
  category: ClothingCategory;
  color: string;
  brand?: string;
  memo?: string;
  fit?: string;
  length?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// POST /closet 요청 바디
export interface ClosetItemCreatePayload {
  imageUrl: string;
  category: ClothingCategory;
  color: string;
  brand?: string;
  memo?: string;
  fit?: string;
  length?: string;
  isFavorite?: boolean;
}

// PUT /closet/:id 요청 바디 (수정할 필드만 포함)
export type ClosetItemUpdatePayload = Partial<ClosetItemCreatePayload>;

// 폼에서 다루는 로컬 상태 (이미지 업로드 전/후 상태를 함께 관리)
export interface ClosetItemDraft {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  // TODO: 이미지 업로드 API(Cloudinary 등) 연동 전까지는 null.
  // 업로드 API가 나오면 여기에 실제 업로드된 URL을 채워서 POST /closet에 사용.
  imageUrl: string | null;
  category: ClothingCategory | null;
  color: string | null;
  brand: string;
  memo: string;
  fit: string | null;
  length: string | null;
  isFavorite: boolean;
}

export function createEmptyDraft(): ClosetItemDraft {
  return {
    imageFile: null,
    imagePreviewUrl: null,
    imageUrl: null,
    category: null,
    color: null,
    brand: "",
    memo: "",
    fit: null,
    length: null,
    isFavorite: false,
  };
}

export function draftToCreatePayload(
  draft: ClosetItemDraft,
): ClosetItemCreatePayload | null {
  if (!draft.imageUrl || !draft.category || !draft.color) return null;
  const isFittable = FITTABLE_CATEGORIES.includes(draft.category);
  return {
    imageUrl: draft.imageUrl,
    category: draft.category,
    color: draft.color,
    brand: draft.brand || undefined,
    memo: draft.memo || undefined,
    fit: isFittable ? draft.fit ?? undefined : undefined,
    length: isFittable ? draft.length ?? undefined : undefined,
    isFavorite: draft.isFavorite,
  };
}

export function itemToDraft(item: ClosetItem): ClosetItemDraft {
  return {
    imageFile: null,
    imagePreviewUrl: item.imageUrl,
    imageUrl: item.imageUrl,
    category: item.category,
    color: item.color,
    brand: item.brand ?? "",
    memo: item.memo ?? "",
    fit: item.fit ?? null,
    length: item.length ?? null,
    isFavorite: item.isFavorite,
  };
}

// 옷장 분석 API 응답 (GET /closet/analysis)
export interface ClosetAnalysis {
  totalItems: number;
  categoryCounts: Partial<Record<ClothingCategory, number>>;
  colorCounts: Record<string, number>;
  missingCategories: ClothingCategory[];
}

// 부족 아이템 추천 API 응답 (GET /closet/missing)
export interface MissingClosetItem {
  category: ClothingCategory;
  reason: string;
  priority: number;
}
