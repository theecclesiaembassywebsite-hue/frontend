"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-body text-sm font-medium text-slate"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-12 w-full rounded-[4px] border bg-white px-4 font-body text-base text-slate placeholder:text-gray-text",
            "transition-colors duration-150",
            "focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none",
            error
              ? "border-error"
              : "border-gray-border",
            className
          )}
          {...props}
        />
        {error && (
          <span className="font-body text-xs text-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
