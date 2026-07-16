import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "../../../components/Button";
import ClosetItemThumbnail from "../../../components/ClosetItemThumbnail";
import { evaluateCoordi } from "../../../api/coaching-api";
import type { CoordiEvaluationResult } from "../../../types/coaching";
import type { ClosetItem } from "../../../types/closet";

interface CoordiEvaluationPanelProps {
  closetItems: ClosetItem[];
}

export default function CoordiEvaluationPanel({
  closetItems,
}: CoordiEvaluationPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<CoordiEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleSelect(id: string) {
    setResult(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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
      <p className="text-sm text-ink-soft">
        평가받고 싶은 옷을 골라주세요 ({selectedIds.length}개 선택)
      </p>

      <div className="grid grid-cols-3 gap-3">
        {closetItems.map((item) => (
          <ClosetItemThumbnail
            key={item.id}
            imageUrl={item.imageUrl}
            alt={`${item.color.name} ${item.subCategory}`}
            onClick={() => toggleSelect(item.id)}
            className={[
              "aspect-[3/4] w-full",
              selectedIds.includes(item.id)
                ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                : "",
            ].join(" ")}
          />
        ))}
      </div>

      <Button
        onClick={handleEvaluate}
        disabled={selectedIds.length === 0 || isSubmitting}
      >
        {isSubmitting ? "평가 중..." : "AI 코디 평가받기"}
      </Button>

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