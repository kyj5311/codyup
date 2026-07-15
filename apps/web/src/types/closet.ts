// 내 옷장 화면에서 공유하는 타입 (FE1 담당)

export type ClothingCategory = "상의" | "하의" | "아우터" | "신발";

export const SUB_CATEGORY_MAP: Record<ClothingCategory, string[]> = {
  상의: ["니트", "셔츠", "티셔츠", "블라우스"],
  하의: ["데님", "슬랙스", "스커트", "반바지"],
  아우터: ["코트", "자켓", "패딩", "가디건"],
  신발: ["스니커즈", "로퍼", "부츠", "샌들"],
};

export type Season = "봄" | "여름" | "가을" | "겨울";

export interface ClosetColor {
  name: string;
  hex: string;
}

export const CLOSET_COLORS: ClosetColor[] = [
  { name: "블랙", hex: "#1c1b19" },
  { name: "화이트", hex: "#ffffff" },
  { name: "그레이", hex: "#a8a49c" },
  { name: "베이지", hex: "#d8c3a0" },
  { name: "브라운", hex: "#8a5a3b" },
  { name: "네이비", hex: "#33456b" },
  { name: "그린", hex: "#4c6b4f" },
];

export interface ClosetItem {
  id: string;
  imageUrl: string | null;
  category: ClothingCategory;
  subCategory: string;
  color: ClosetColor;
  seasons: Season[];
  memo: string;
}

// 서버 등록/수정 요청 payload (이미지는 별도 파일로 전송)
export interface ClosetItemDraft {
  category: ClothingCategory | null;
  subCategory: string | null;
  color: ClosetColor | null;
  seasons: Season[];
  memo: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
}

export function createEmptyDraft(): ClosetItemDraft {
  return {
    category: null,
    subCategory: null,
    color: null,
    seasons: [],
    memo: "",
    imageFile: null,
    imagePreviewUrl: null,
  };
}
