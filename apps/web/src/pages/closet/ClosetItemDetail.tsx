import { useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import Button from "../../components/Button";
import ClosetItemForm from "./ClosetItemForm";
import { itemToDraft, type ClosetItem, type ClosetItemDraft } from "../../types/closet";

interface ClosetItemDetailProps {
  item: ClosetItem;
  isSaving: boolean;
  errorMessage?: string | null;
  onBack: () => void;
  onUpdate: (id: number, draft: ClosetItemDraft) => void;
  onDelete: (id: number) => void;
}

export default function ClosetItemDetail({
  item,
  isSaving,
  errorMessage,
  onBack,
  onUpdate,
  onDelete,
}: ClosetItemDetailProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ClosetItemForm
        title="옷 등록 수정"
        initialDraft={itemToDraft(item)}
        isSaving={isSaving}
        errorMessage={errorMessage}
        onBack={() => setIsEditing(false)}
        onSubmit={(draft) => onUpdate(item.id, draft)}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="text-ink"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-ink">
          옷 상세
        </h1>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-cream"
        >
          수정
        </button>
      </header>

      <div className="relative mt-3 aspect-[4/5] w-full overflow-hidden rounded-3xl bg-card">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={`${item.category} ${item.color}`}
            className="h-full w-full object-cover"
          />
        )}
        {item.isFavorite && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink">
            <Heart size={16} strokeWidth={2} fill="currentColor" />
          </span>
        )}
      </div>

      <dl className="mt-5 divide-y divide-line border-t border-line text-[15px]">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-text">카테고리</dt>
          <dd className="font-medium text-ink">{item.category}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-text">색상</dt>
          <dd className="font-medium text-ink">{item.color}</dd>
        </div>
        {item.fit && (
          <div className="flex items-center justify-between py-4">
            <dt className="text-gray-text">핏</dt>
            <dd className="font-medium text-ink">{item.fit}</dd>
          </div>
        )}
        {item.length && (
          <div className="flex items-center justify-between py-4">
            <dt className="text-gray-text">기장</dt>
            <dd className="font-medium text-ink">{item.length}</dd>
          </div>
        )}
        {item.brand && (
          <div className="flex items-center justify-between py-4">
            <dt className="text-gray-text">브랜드</dt>
            <dd className="font-medium text-ink">{item.brand}</dd>
          </div>
        )}
        {item.memo && (
          <div className="flex items-center justify-between py-4">
            <dt className="text-gray-text">메모</dt>
            <dd className="font-medium text-ink">{item.memo}</dd>
          </div>
        )}
      </dl>

      {errorMessage && (
        <p className="mt-4 text-sm text-danger">{errorMessage}</p>
      )}

      <div className="mt-auto pb-8 pt-8">
        <Button
          variant="secondary"
          className="!bg-danger-bg !text-danger"
          onClick={() => onDelete(item.id)}
        >
          삭제하기
        </Button>
      </div>
    </div>
  );
}
