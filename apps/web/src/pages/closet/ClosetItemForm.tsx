import { useRef, useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import ColorSwatchPicker from "../../components/ColorSwatchPicker";
import {
  CATEGORIES,
  CLOSET_COLOR_GROUPS,
  createEmptyDraft,
  FIT_OPTIONS,
  FITTABLE_CATEGORIES,
  LENGTH_OPTIONS_BY_CATEGORY,
  type ClosetItemDraft,
} from "../../types/closet";

interface ClosetItemFormProps {
  title: string;
  initialDraft?: ClosetItemDraft;
  isSaving: boolean;
  errorMessage?: string | null;
  onSubmit: (draft: ClosetItemDraft) => void;
  onBack: () => void;
}

export default function ClosetItemForm({
  title,
  initialDraft,
  isSaving,
  errorMessage,
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
    draft.color !== null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDraft((prev) => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: previewUrl,
      // TODO: 이미지 업로드 API(Cloudinary 등) 나오면 업로드 후 실제 URL로 교체
      imageUrl: previewUrl,
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
        <button
          type="button"
          aria-label="즐겨찾기"
          onClick={() =>
            setDraft((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
          }
          className="text-ink"
        >
          <Heart
            size={22}
            strokeWidth={2}
            fill={draft.isFavorite ? "currentColor" : "none"}
          />
        </button>
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

        <div className="mt-5">
          <span className="text-sm font-medium text-ink-soft">
            브랜드 (선택)
          </span>
          <input
            type="text"
            value={draft.brand}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, brand: e.target.value }))
            }
            placeholder="예: 나이키"
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-transparent px-4 text-[15px] outline-none focus:border-ink"
          />
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

        {errorMessage && (
          <p className="mt-4 text-sm text-danger">{errorMessage}</p>
        )}
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
