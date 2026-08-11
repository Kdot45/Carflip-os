"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-accent-400 to-accent-600 text-ink-950 shadow-[0_4px_14px_-4px_rgba(255,122,26,0.55)] hover:from-accent-400 hover:to-accent-700 active:to-accent-700 disabled:from-ink-500 disabled:to-ink-500 disabled:text-ink-300 disabled:shadow-none",
  secondary:
    "bg-ink-700 text-ink-50 border border-ink-500 hover:bg-ink-600 active:bg-ink-500 disabled:text-ink-300",
  ghost: "bg-transparent text-ink-100 hover:bg-ink-700 active:bg-ink-600",
  danger: "bg-ink-700 text-bad border border-bad/30 hover:bg-ink-600 active:bg-ink-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-5 py-3 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
