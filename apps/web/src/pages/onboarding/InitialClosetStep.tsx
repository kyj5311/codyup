import { useRef, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import ColorSwatchPicker from "../../components/ColorSwatchPicker";
import ClosetItemThumbnail from "../../components/ClosetItemThumbnail";
import { registerInitialClosetItem } from "../../api/onboarding-api";
import { CLOSET_COLORS } from "../../types/closet";
import type { InitialClosetItem, Season } from "../../types/onboarding";

interface InitialClosetStepProps {
  onComplete: (items: InitialClosetItem[]) => void;
  onBack: () => void;
}

const CATEGORIES = ["상의", "하의", "아우터", "신발"];
const SEASONS: Season[] = ["봄", "여름", "가을", "겨울", "사계절"];

function createEmptyDraft(): Omit<InitialClosetItem, "id"> {
  return {
    imageFile: null,
    previewUrl: null,
    category: null,
    color: null,
    seasons: [],
  };
}

export default function InitialClosetStep({
  onComplete,
  onBack,
}: InitialClosetStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(createEmptyDraft());
  const [items, setItems] = useState<InitialClosetItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const canAdd =
    draft.imageFile !== null &&
    draft.category !== null &&
    draft.color !== null &&
    draft.seasons.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setDraft((prev) => ({
      ...prev,
      imageFile: file,
      previewUrl: URL.createObjectURL(file),
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

  async function handleAddItem() {
    if (!canAdd || !draft.imageFile || !draft.category || !draft.color) return;

    setIsSaving(true);
    try {
      // BE1 연동: 옷장 등록 화면과 동일한 API 재사용
      await registerInitialClosetItem(draft.imageFile, {
        category: draft.category,
        color: draft.color,
        seasons: draft.seasons,
      });
    } finally {
      setIsSaving(false);
    }

    setItems((prev) => [
      ...prev,
      { ...draft, id: crypto.randomUUID() } as InitialClosetItem,
    ]);
    setDraft(createEmptyDraft());
  }

  function handleFinish() {
    onComplete(items);
  }

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-ink-soft">초기 옷장 등록</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          자주 입는 옷{"\n"}몇 벌만 등록해 볼까요?
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          지금 등록한 옷은 &apos;내 옷장&apos;에서 언제든 수정할 수 있어요.
        </p>

        {items.length > 0 && (
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {items.map((item) => (
              <ClosetItemThumbnail
                key={item.id}
                imageUrl={item.previewUrl}
                alt={`${item.category} 등록 완료`}
                className="h-16 w-16 shrink-0"
              />
            ))}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-sm font-semibold text-ink-soft">
              {items.length}벌
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />

        <Card
          tone="cream"
          className="mt-5 flex min-h-[160px] cursor-pointer flex-col items-center justify-center border border-dashed border-line text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {draft.previewUrl ? (
            <img
              src={draft.previewUrl}
              alt="등록할 옷 미리보기"
              className="h-28 w-28 rounded-2xl object-cover"
            />
          ) : (
            <>
              <p className="text-[15px] font-medium text-ink">
                사진을 업로드해 주세요
              </p>
              <p className="mt-1 text-xs text-gray-text">JPG, PNG / 최대 30MB</p>
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
                  setDraft((prev) => ({ ...prev, category }))
                }
              >
                {category}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">색상</span>
          <div className="mt-2">
            <ColorSwatchPicker
              colors={CLOSET_COLORS}
              selectedName={draft.color}
              onSelect={(color) =>
                setDraft((prev) => ({ ...prev, color: color.name }))
              }
            />
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

        <Button
          className="mt-5"
          variant="secondary"
          onClick={handleAddItem}
          disabled={!canAdd || isSaving}
        >
          {isSaving ? "등록 중..." : "옷장에 추가하기"}
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleFinish}>
          {items.length > 0 ? "완료" : "건너뛰고 시작하기"}
        </Button>
        <Button variant="ghost" size="md" onClick={onBack}>
          이전으로
        </Button>
      </div>
    </div>
  );
}
