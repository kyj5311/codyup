import type { HTMLAttributes, ReactNode } from "react";

type CardTone = "cream" | "yellow";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  children: ReactNode;
}

const toneClass: Record<CardTone, string> = {
  cream: "bg-cream-deep",
  yellow: "bg-yellow",
};

export default function Card({
  tone = "cream",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={["rounded-card p-5", toneClass[tone], className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
