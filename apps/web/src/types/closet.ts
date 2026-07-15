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

// UI 색상 스와치용 프리셋 — 서버에는 name(string)만 전송
export const CLOSET_COLORS: ClosetColorOption[] = [
  { name: "블랙", hex: "#1c1b19" },
  { name: "화이트", hex: "#ffffff" },
  { name: "그레이", hex: "#a8a49c" },
  { name: "베이지", hex: "#d8c3a0" },
  { name: "브라운", hex: "#8a5a3b" },
  { name: "네이비", hex: "#33456b" },
  { name: "그린", hex: "#4c6b4f" },
];

// GET /closet, GET /closet/:id 응답 데이터 형태
export interface ClosetItem {
  id: number;
  userId: number;
  imageUrl: string;
  category: ClothingCategory;
  color: string;
  brand?: string;
  memo?: string;
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
    isFavorite: false,
  };
}

export function draftToCreatePayload(
  draft: ClosetItemDraft,
): ClosetItemCreatePayload | null {
  if (!draft.imageUrl || !draft.category || !draft.color) return null;
  return {
    imageUrl: draft.imageUrl,
    category: draft.category,
    color: draft.color,
    brand: draft.brand || undefined,
    memo: draft.memo || undefined,
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
