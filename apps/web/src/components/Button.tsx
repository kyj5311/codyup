import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream disabled:bg-line disabled:text-gray-text",
  secondary: "bg-yellow text-ink disabled:bg-line disabled:text-gray-text",
  ghost: "bg-transparent text-ink-soft underline underline-offset-4",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "lg",
  disabled = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "w-full rounded-pill font-semibold transition-opacity",
        "active:opacity-70 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
