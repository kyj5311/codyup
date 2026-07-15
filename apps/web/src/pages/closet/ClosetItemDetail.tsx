import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Button from "../../components/Button";
import ClosetItemForm from "./ClosetItemForm";
import type { ClosetItem, ClosetItemDraft } from "../../types/closet";

interface ClosetItemDetailProps {
  item: ClosetItem;
  isSaving: boolean;
  onBack: () => void;
  onUpdate: (id: string, draft: ClosetItemDraft) => void;
  onDelete: (id: string) => void;
}

function itemToDraft(item: ClosetItem): ClosetItemDraft {
  return {
    category: item.category,
    subCategory: item.subCategory,
    color: item.color,
    seasons: item.seasons,
    memo: item.memo,
    imageFile: null,
    imagePreviewUrl: item.imageUrl,
  };
}

export default function ClosetItemDetail({
  item,
  isSaving,
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
        onBack={() => setIsEditing(false)}
        onSubmit={(draft) => {
          onUpdate(item.id, draft);
          setIsEditing(false);
        }}
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
          옷 등록
        </h1>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-cream"
        >
          수정
        </button>
      </header>

      <div className="mt-3 aspect-[4/5] w-full overflow-hidden rounded-3xl bg-card">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={`${item.category} ${item.subCategory}`}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <dl className="mt-5 divide-y divide-line border-t border-line text-[15px]">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-text">카테고리</dt>
          <dd className="font-medium text-ink">
            {item.category} &gt; {item.subCategory}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-text">색상</dt>
          <dd className="flex items-center gap-2 font-medium text-ink">
            <span
              className="h-5 w-5 rounded-full border border-line"
              style={{ backgroundColor: item.color.hex }}
            />
            {item.color.name}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-text">계절</dt>
          <dd className="font-medium text-ink">{item.seasons.join(", ")}</dd>
        </div>
        {item.memo && (
          <div className="flex items-center justify-between py-4">
            <dt className="text-gray-text">메모</dt>
            <dd className="font-medium text-ink">{item.memo}</dd>
          </div>
        )}
      </dl>

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
