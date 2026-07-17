import { Check } from "lucide-react";

interface ColorOption {
  name: string;
  hex: string;
}

interface ColorSwatchPickerProps {
  colors: ColorOption[];
  selectedName: string | null;
  onSelect: (color: ColorOption) => void;
}

// 밝은 색 위에는 어두운 체크, 어두운 색 위에는 밝은 체크가 보이도록 명도 계산
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

/**
 * 색상 선택 리스트. 옷 등록 폼(내옷장)과 온보딩 초기 옷장 등록에서 공유.
 * 원 아이콘 옆에 색상 이름을 함께 표시해 어떤 색을 골랐는지 바로 알 수 있게 함.
 */
export default function ColorSwatchPicker({
  colors,
  selectedName,
  onSelect,
}: ColorSwatchPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {colors.map((c) => {
        const isSelected = selectedName === c.name;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelect(c)}
            className={[
              "flex items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors",
              isSelected ? "bg-cream-deep" : "",
            ].join(" ")}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line"
              style={{ backgroundColor: c.hex }}
            >
              {isSelected && (
                <Check
                  size={14}
                  strokeWidth={3}
                  className={isLightColor(c.hex) ? "text-ink" : "text-cream"}
                />
              )}
            </span>
            <span
              className={[
                "text-sm",
                isSelected ? "font-semibold text-ink" : "text-ink-soft",
              ].join(" ")}
            >
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
