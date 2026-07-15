interface ColorOption {
  name: string;
  hex: string;
}

interface ColorSwatchPickerProps {
  colors: ColorOption[];
  selectedName: string | null;
  onSelect: (color: ColorOption) => void;
}

/**
 * 색상 선택 스와치. 옷 등록 폼(내옷장)과 온보딩 초기 옷장 등록에서 공유.
 */
export default function ColorSwatchPicker({
  colors,
  selectedName,
  onSelect,
}: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          aria-label={c.name}
          onClick={() => onSelect(c)}
          className={[
            "h-9 w-9 rounded-full border transition-transform",
            selectedName === c.name
              ? "scale-110 border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream"
              : "border-line",
          ].join(" ")}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}
