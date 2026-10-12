import type { TodayCoordiItem } from "../../../types/dashboard";

interface TodayCoordiSwatchProps {
  items: TodayCoordiItem[];
  /** true면 대시보드 카드 우측에 들어가는 작은 색상 블록만 렌더링 (라벨 없음) */
  compact?: boolean;
}

export default function TodayCoordiSwatch({
  items,
  compact = false,
}: TodayCoordiSwatchProps) {
  if (items.length === 0) {
    return compact ? null : (
      <p className="text-sm text-gray-text">
        아직 추천할 코디가 없어요. 옷장을 더 채워보세요.
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex h-full w-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            title={`${item.colorName} · ${item.label}`}
            className={[
              "h-full flex-1",
              index > 0 ? "border-l border-cream" : "",
            ].join(" ")}
            style={{ backgroundColor: item.colorHex }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex h-12 w-full overflow-hidden rounded-card">
        {items.map((item, index) => (
          <div
            key={item.id}
            title={`${item.colorName} · ${item.label}`}
            className={[
              "h-full flex-1",
              index > 0 ? "border-l border-cream" : "",
            ].join(" ")}
            style={{ backgroundColor: item.colorHex }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <span key={item.id} className="text-xs text-gray-text">
            {item.colorName} {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}