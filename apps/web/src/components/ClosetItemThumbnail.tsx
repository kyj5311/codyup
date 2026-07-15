import { X } from "lucide-react";

interface ClosetItemThumbnailProps {
  imageUrl: string | null;
  alt: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * 옷 썸네일 카드. 내옷장 그리드와 온보딩 초기 옷장 등록 목록에서 공유.
 * onClick이 있으면 클릭 가능한 버튼으로, onDelete가 있으면 우상단 삭제 뱃지를 표시.
 */
export default function ClosetItemThumbnail({
  imageUrl,
  alt,
  onClick,
  onDelete,
  className = "aspect-[3/4] w-full",
}: ClosetItemThumbnailProps) {
  const imageNode = imageUrl ? (
    <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
  ) : null;

  return (
    <div className="relative">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={["overflow-hidden rounded-2xl bg-card", className].join(
            " ",
          )}
        >
          {imageNode}
        </button>
      ) : (
        <div
          className={["overflow-hidden rounded-2xl bg-card", className].join(
            " ",
          )}
        >
          {imageNode}
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
