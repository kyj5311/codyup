import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export default function Chip({
  selected = false,
  className = "",
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      className={[
        "h-11 rounded-2xl border px-4 text-sm font-medium transition-colors",
        selected
          ? "border-ink bg-ink text-cream"
          : "border-line bg-transparent text-ink-soft",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
