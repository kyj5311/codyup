import { Check } from "lucide-react";
import Card from "../../../components/Card";
import { PRIORITY_LABEL, type RoadmapItem } from "../../../types/roadmap";

interface RoadmapItemCardProps {
  item: RoadmapItem;
  onTogglePurchased: (item: RoadmapItem) => void;
}

const PRIORITY_TONE: Record<RoadmapItem["priority"], string> = {
  high: "text-danger",
  medium: "text-ink",
  low: "text-gray-text",
};

export default function RoadmapItemCard({
  item,
  onTogglePurchased,
}: RoadmapItemCardProps) {
  return (
    <Card tone="cream" className={item.isPurchased ? "opacity-50" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {item.recommendedColor && (
              <span
                className="h-3 w-3 rounded-full border border-line"
                style={{ backgroundColor: item.recommendedColor.hex }}
              />
            )}
            <span
              className={[
                "text-xs font-semibold",
                PRIORITY_TONE[item.priority],
              ].join(" ")}
            >
              {PRIORITY_LABEL[item.priority]}
            </span>
            <span className="text-xs text-gray-text">{item.category}</span>
          </div>
          <p className="mt-1.5 text-[15px] font-medium text-ink">
            {item.itemName}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {item.estimatedPriceKrw.toLocaleString("ko-KR")}원
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-text">
            {item.reason}
          </p>
        </div>
        <button
          type="button"
          aria-label={item.isPurchased ? "구매완료 취소" : "구매완료 표시"}
          onClick={() => onTogglePurchased(item)}
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            item.isPurchased
              ? "border-ink bg-ink text-cream"
              : "border-line bg-transparent text-gray-text",
          ].join(" ")}
        >
          <Check size={16} strokeWidth={2.5} />
        </button>
      </div>
    </Card>
  );
}