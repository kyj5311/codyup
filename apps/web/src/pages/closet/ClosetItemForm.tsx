import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import {
  CLOSET_COLORS,
  SUB_CATEGORY_MAP,
  createEmptyDraft,
  type ClosetItemDraft,
  type ClothingCategory,
  type Season,
} from "../../types/closet";

interface ClosetItemFormProps {
  title: string;
  initialDraft?: ClosetItemDraft;
  isSaving: boolean;
  onSubmit: (draft: ClosetItemDraft) => void;
  onBack: () => void;
}

const CATEGORIES: ClothingCategory[] = ["상의", "하의", "아우터", "신발"];
const SEASONS: Season[] = ["봄", "여름", "가을", "겨울"];

export default function ClosetItemForm({
  title,
  initialDraft,
  isSaving,
  onSubmit,
  onBack,
}: ClosetItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ClosetItemDraft>(
    initialDraft ?? createEmptyDraft(),
  );

  const canSubmit =
    draft.imagePreviewUrl !== null &&
    draft.category !== null &&
    draft.subCategory !== null &&
    draft.color !== null &&
    draft.seasons.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setDraft((prev) => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: URL.createObjectURL(file),
    }));
  }

  function toggleSeason(season: Season) {
    setDraft((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter((s) => s !== season)
        : [...prev.seasons, season],
    }));
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
          {title}
        </h1>
        <span className="w-5" />
      </header>

      <div className="flex-1 pb-28">
        <p className="mt-4 text-sm font-medium text-ink-soft">사진업로드</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />
        <Card
          tone="cream"
          className="mt-2 flex min-h-[200px] cursor-pointer flex-col items-center justify-center border border-dashed border-line text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {draft.imagePreviewUrl ? (
            <img
              src={draft.imagePreviewUrl}
              alt="등록할 옷 미리보기"
              className="h-40 w-40 rounded-2xl object-cover"
            />
          ) : (
            <>
              <p className="text-[15px] font-medium text-ink">
                사진을 업로드해 주세요
              </p>
              <p className="mt-1 text-xs text-gray-text">
                JPG, PNG / 최대 30MB
              </p>
            </>
          )}
        </Card>

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">카테고리</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                selected={draft.category === category}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    category,
                    subCategory: null,
                  }))
                }
              >
                {category}
              </Chip>
            ))}
          </div>
          {draft.category && (
            <div className="mt-2 flex flex-wrap gap-2">
              {SUB_CATEGORY_MAP[draft.category].map((sub) => (
                <Chip
                  key={sub}
                  selected={draft.subCategory === sub}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, subCategory: sub }))
                  }
                >
                  {sub}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">색상</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {CLOSET_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                onClick={() => setDraft((prev) => ({ ...prev, color: c }))}
                className={[
                  "h-9 w-9 rounded-full border transition-transform",
                  draft.color?.name === c.name
                    ? "scale-110 border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "border-line",
                ].join(" ")}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">계절</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <Chip
                key={season}
                selected={draft.seasons.includes(season)}
                onClick={() => toggleSeason(season)}
              >
                {season}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">
            메모 (선택)
          </span>
          <textarea
            value={draft.memo}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, memo: e.target.value }))
            }
            placeholder="옷에 대한 메모를 입력해 주세요"
            rows={3}
            className="mt-2 w-full rounded-2xl border border-line bg-transparent p-4 text-[15px] outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] bg-cream px-6 pb-8 pt-3">
        <Button
          onClick={() => onSubmit(draft)}
          disabled={!canSubmit || isSaving}
        >
          {isSaving ? "저장 중..." : "완료"}
        </Button>
      </div>
    </div>
  );
}
