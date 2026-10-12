import { useRef, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import ColorSwatchPicker from "../../components/ColorSwatchPicker";
import ClosetItemThumbnail from "../../components/ClosetItemThumbnail";
import { createClosetItem } from "../../api/closet-api";
import {
  CATEGORIES,
  CLOSET_COLOR_GROUPS,
  createEmptyDraft,
  draftToCreatePayload,
  FIT_OPTIONS,
  FITTABLE_CATEGORIES,
  LENGTH_OPTIONS_BY_CATEGORY,
  type ClosetItem,
  type ClosetItemDraft,
} from "../../types/closet";

interface InitialClosetStepProps {
  onComplete: (items: ClosetItem[]) => void;
  onBack: () => void;
}

export default function InitialClosetStep({
  onComplete,
  onBack,
}: InitialClosetStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ClosetItemDraft>(createEmptyDraft());
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdd =
    draft.imagePreviewUrl !== null &&
    draft.category !== null &&
    draft.color !== null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDraft((prev) => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: previewUrl,
      // TODO: 이미지 업로드 API(Cloudinary 등) 나오면 여기서 업로드하고
      // 실제 반환 URL을 넣어야 함. 지금은 로컬 blob URL을 임시로 사용.
      imageUrl: previewUrl,
    }));
  }

  async function handleAddItem() {
    const payload = draftToCreatePayload(draft);
    if (!canAdd || !payload) return;

    setIsSaving(true);
    setError(null);
    try {
      // BE1 연동: POST /closet (내 옷장 등록과 동일한 API)
      const res = await createClosetItem(payload);
      if (res.success && res.data) {
        setItems((prev) => [res.data as ClosetItem, ...prev]);
        setDraft(createEmptyDraft());
      } else {
        setError(res.error?.message ?? "등록에 실패했어요. 다시 시도해 주세요.");
      }
    } catch {
      setError("서버에 연결할 수 없어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
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
                imageUrl={item.imageUrl}
                alt={`${item.category} 등록 완료`}
                category={item.category}
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
          {draft.imagePreviewUrl ? (
            <img
              src={draft.imagePreviewUrl}
              alt="등록할 옷 미리보기"
              className="h-28 w-28 rounded-2xl object-cover"
            />
          ) : (
            <>
              <p className="text-[15px] font-medium text-ink">
                사진을 업로드해 주세요
              </p>
              <p className="mt-1 text-xs text-gray-text">
                JPG, PNG / 최대 30MB · 1:1 비율 이미지를 권장해요
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
                onClick={() => setDraft((prev) => ({ ...prev, category }))}
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
              groups={CLOSET_COLOR_GROUPS}
              selectedName={draft.color}
              onSelect={(color) =>
                setDraft((prev) => ({ ...prev, color: color.name }))
              }
            />
          </div>
        </div>

        {draft.category && FITTABLE_CATEGORIES.includes(draft.category) && (
          <>
            <div className="mt-5">
              <span className="text-sm font-medium text-ink-soft">
                핏 (선택) · 체형 반영 코디 추천에 사용돼요
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {FIT_OPTIONS.map((fit) => (
                  <Chip
                    key={fit}
                    selected={draft.fit === fit}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        fit: prev.fit === fit ? null : fit,
                      }))
                    }
                  >
                    {fit}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-sm font-medium text-ink-soft">
                기장 (선택)
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(LENGTH_OPTIONS_BY_CATEGORY[draft.category] ?? []).map(
                  (length) => (
                    <Chip
                      key={length}
                      selected={draft.length === length}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          length: prev.length === length ? null : length,
                        }))
                      }
                    >
                      {length}
                    </Chip>
                  ),
                )}
              </div>
            </div>
          </>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

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
