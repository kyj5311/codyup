import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "../../../components/Button";
import ClosetItemThumbnail from "../../../components/ClosetItemThumbnail";
import { evaluateCoordi } from "../../../api/coaching-api";
import type { CoordiEvaluationResult } from "../../../types/coaching";
import type { ClosetItem, ClothingCategory } from "../../../types/closet";

interface CoordiEvaluationPanelProps {
  closetItems: ClosetItem[];
}

// 실제로 동시에 입을 수 있는 건 하나뿐인 카테고리 — 이 중에서는 항상 최대 1개만 선택되게 함
// (악세서리는 여러 개 같이 착용 가능하니 제외)
const SINGLE_SELECT_CATEGORIES: ClothingCategory[] = ["상의", "하의", "아우터", "신발"];

export default function CoordiEvaluationPanel({
  closetItems,
}: CoordiEvaluationPanelProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [result, setResult] = useState<CoordiEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleSelect(item: ClosetItem) {
    setResult(null);
    setSelectedIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((i) => i !== item.id);
      }
      if (SINGLE_SELECT_CATEGORIES.includes(item.category)) {
        // 같은 카테고리를 이미 골랐으면 새로 고른 것으로 교체(라디오 버튼처럼 동작)
        const withoutSameCategory = prev.filter((id) => {
          const existing = closetItems.find((c) => c.id === id);
          return existing?.category !== item.category;
        });
        return [...withoutSameCategory, item.id];
      }
      return [...prev, item.id];
    });
  }

  async function handleEvaluate() {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await evaluateCoordi({ closetItemIds: selectedIds });
    setIsSubmitting(false);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setErrorMessage(res.error?.message ?? "평가를 처리하지 못했어요.");
    }
  }

  if (closetItems.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-text">
        먼저 내 옷장에 옷을 등록해야 코디를 평가할 수 있어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-ink-soft">
          평가받고 싶은 옷을 골라주세요 ({selectedIds.length}개 선택)
        </p>
        <p className="mt-1 text-xs text-gray-text">
          상의·하의·아우터·신발은 하나씩만 선택돼요. 다시 누르면 다른 아이템으로 바뀌어요.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {closetItems.map((item) => (
          <ClosetItemThumbnail
            key={item.id}
            imageUrl={item.imageUrl || null}
            alt={`${item.color} ${item.category}`}
            onClick={() => toggleSelect(item)}
            className={[
              "aspect-square w-full",
              selectedIds.includes(item.id)
                ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                : "",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="sticky bottom-0 -mx-5 bg-cream px-5 pb-3 pt-2">
        <Button
          onClick={handleEvaluate}
          disabled={selectedIds.length === 0 || isSubmitting}
        >
          {isSubmitting ? "평가 중..." : "AI 코디 평가받기"}
        </Button>
      </div>

      {errorMessage && (
        <p className="text-sm text-danger">{errorMessage}</p>
      )}

      {result && (
        <div className="rounded-card bg-cream-deep p-5">
          <div className="flex items-center gap-1.5 text-ink">
            <Sparkles size={16} />
            <p className="text-sm font-semibold">AI 평가 결과</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-ink">{result.score}점</p>
          <p className="mt-1 text-sm text-ink-soft">{result.summary}</p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-ink">좋은 점</p>
            <ul className="mt-1 list-inside list-disc text-sm text-ink-soft">
              {result.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {result.improvements.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-ink">개선하면 좋은 점</p>
              <ul className="mt-1 list-inside list-disc text-sm text-ink-soft">
                {result.improvements.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}