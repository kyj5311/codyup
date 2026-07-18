import { useEffect, useState } from "react";
import { Footprints, Layers, PersonStanding, Shirt, Watch, X } from "lucide-react";
import type { ClothingCategory } from "../types/closet";

interface ClosetItemThumbnailProps {
  imageUrl: string | null;
  alt: string;
  // Cloudinary 연동 전이라 카테고리 아이콘 폴백에 사용. 안 넘기면 기본 Shirt 아이콘.
  category?: ClothingCategory;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

// Cloudinary 이미지 업로드가 보류되어, 실제 사진 대신 카테고리별 기본 아이콘으로 대체
export const CLOSET_CATEGORY_ICON_MAP: Record<ClothingCategory, typeof Shirt> = {
  상의: Shirt,
  하의: PersonStanding,
  아우터: Layers,
  신발: Footprints,
  악세서리: Watch,
};

/**
 * 옷 썸네일 카드. 내옷장 그리드, 온보딩 초기 옷장 등록, 코디 코칭(FE2) 화면에서 공유.
 * onClick이 있으면 클릭 가능한 버튼으로, onDelete가 있으면 우상단 삭제 뱃지를 표시.
 * imageUrl이 없거나 로드에 실패하면(깨진 이미지) 카테고리 기본 아이콘을 보여준다.
 */
export default function ClosetItemThumbnail({
  imageUrl,
  alt,
  category,
  onClick,
  onDelete,
  className = "aspect-[3/4] w-full",
}: ClosetItemThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  // imageUrl이 바뀌면(다른 아이템으로 재사용되는 리스트 아이템 등) 에러 상태 초기화
  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !hasError;
  const Icon = category ? CLOSET_CATEGORY_ICON_MAP[category] : Shirt;

  const content = showImage ? (
    <img
      src={imageUrl as string}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setHasError(true)}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-cream-deep">
      <Icon size={28} strokeWidth={1.5} className="text-gray-text" />
    </div>
  );

  return (
    <div className="relative">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={["overflow-hidden rounded-2xl", className].join(" ")}
        >
          {content}
        </button>
      ) : (
        <div className={["overflow-hidden rounded-2xl", className].join(" ")}>
          {content}
        </div>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label="삭제"
          onClick={onDelete}
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-bg"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
