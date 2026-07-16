import type { TodayCoordiItem } from "../../../types/dashboard";

interface TodayCoordiSwatchProps {
  items: TodayCoordiItem[];
}

/**
 * 홈 대시보드 시그니처 컴포넌트: 오늘의 추천 코디를 색상 블록으로 보여준다.
 * 온보딩의 SwatchProgress와 같은 "이어붙은 색상 블록" 시각 언어를 공유하되,
 * 여기서는 진행률이 아니라 실제 추천 아이템의 색상을 표현한다.
 */
export default function TodayCoordiSwatch({ items }: TodayCoordiSwatchProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-text">
        아직 추천할 코디가 없어요. 옷장을 더 채워보세요.
      </p>
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