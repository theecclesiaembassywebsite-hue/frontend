"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "giving";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  /** On dark background — affects secondary button styling */
  onDark?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", loading, onDark, disabled, children, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-heading text-[13px] font-semibold uppercase tracking-[1.5px] leading-4 transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed";

    const variants: Record<ButtonVariant, string> = {
      primary: cn(
        "bg-purple text-white rounded-[4px] px-8 py-3 min-w-[140px]",
        "hover:bg-purple-hover hover:shadow-purple",
        "active:bg-purple-pressed active:shadow-inner",
        "disabled:bg-purple-muted"
      ),
      secondary: cn(
        "bg-transparent rounded-[4px] px-8 py-3 min-w-[140px] border-2",
        onDark
          ? "border-white text-white hover:bg-white/10"
          : "border-purple text-purple hover:bg-purple/10"
      ),
      ghost: cn(
        "bg-transparent border-none text-purple-vivid px-4 py-2",
        "hover:underline"
      ),
      giving: cn(
        "bg-gradient-to-r from-purple to-purple-vivid text-white rounded-[8px] px-10 py-4",
        "hover:opacity-90 hover:shadow-purple",
        "disabled:opacity-50"
      ),
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
