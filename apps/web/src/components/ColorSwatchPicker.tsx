import { useState } from "react";
import { Check } from "lucide-react";
import Chip from "./Chip";
import type { ClosetColorGroup, ClosetColorOption } from "../types/closet";

interface ColorSwatchPickerProps {
  groups: ClosetColorGroup[];
  selectedName: string | null;
  onSelect: (color: ClosetColorOption) => void;
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
 * 색상 선택 UI. 옷 등록 폼(내옷장)과 온보딩 초기 옷장 등록에서 공유.
 * 큰 그룹 중 하나를 탭처럼 선택하면(기본값: 첫 번째 그룹) 그 아래에 세부 색상이 나타남.
 */
export default function ColorSwatchPicker({
  groups,
  selectedName,
  onSelect,
}: ColorSwatchPickerProps) {
  const initialGroupLabel =
    groups.find((g) => g.colors.some((c) => c.name === selectedName))
      ?.label ?? groups[0]?.label ?? null;
  const [activeLabel, setActiveLabel] = useState<string | null>(
    initialGroupLabel,
  );
  const activeGroup =
    groups.find((g) => g.label === activeLabel) ?? groups[0] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Chip
            key={group.label}
            selected={activeLabel === group.label}
            onClick={() => setActiveLabel(group.label)}
          >
            {group.label}
          </Chip>
        ))}
      </div>

      {activeGroup && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {activeGroup.colors.map((c) => {
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
      )}
    </div>
  );
}
