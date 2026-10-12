import { X } from "lucide-react";
import ClosetItemThumbnail from "./ClosetItemThumbnail";
import type { ClosetItem } from "../types/closet";

interface ClosetItemDetailModalProps {
  item: ClosetItem | null;
  onClose: () => void;
}

/** 옷 하나의 상세 정보를 보여주는 읽기 전용 바텀시트. 코디 추천 카드 등에서 아이템 클릭 시 사용. */
export default function ClosetItemDetailModal({
  item,
  onClose,
}: ClosetItemDetailModalProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl bg-cream p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink">옷 상세</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-ink">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4">
          <ClosetItemThumbnail
            imageUrl={item.imageUrl || null}
            alt={`${item.color} ${item.category}`}
            category={item.category}
            className="mx-auto aspect-square w-40"
          />
        </div>

        <dl className="mt-5 divide-y divide-line border-t border-line text-[15px]">
          <div className="flex items-center justify-between py-3">
            <dt className="text-gray-text">카테고리</dt>
            <dd className="font-medium text-ink">{item.category}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-gray-text">색상</dt>
            <dd className="font-medium text-ink">{item.color}</dd>
          </div>
          {item.fit && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-gray-text">핏</dt>
              <dd className="font-medium text-ink">{item.fit}</dd>
            </div>
          )}
          {item.length && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-gray-text">기장</dt>
              <dd className="font-medium text-ink">{item.length}</dd>
            </div>
          )}
          {item.brand && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-gray-text">브랜드</dt>
              <dd className="font-medium text-ink">{item.brand}</dd>
            </div>
          )}
          {item.memo && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-gray-text">메모</dt>
              <dd className="font-medium text-ink">{item.memo}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
