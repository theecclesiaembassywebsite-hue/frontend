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
        "bg-gold text-[#0E0B1E] rounded-[4px] px-8 py-3 min-w-[140px]",
        "hover:bg-gold-dark hover:shadow-md",
        "active:bg-gold-dark active:shadow-inner",
        "disabled:bg-gold-light disabled:text-[#0E0B1E]/50"
      ),
      secondary: cn(
        "bg-transparent rounded-[4px] px-8 py-3 min-w-[140px] border-2",
        onDark
          ? "border-gold text-gold hover:bg-gold/10"
          : "border-[#0E0B1E] text-[#0E0B1E] hover:bg-[#0E0B1E]/10"
      ),
      ghost: cn(
        "bg-transparent border-none text-gold px-4 py-2",
        "hover:underline"
      ),
      giving: cn(
        "bg-gradient-to-r from-gold-dark to-gold text-[#0E0B1E] rounded-[8px] px-10 py-4",
        "hover:opacity-90 hover:shadow-md",
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
