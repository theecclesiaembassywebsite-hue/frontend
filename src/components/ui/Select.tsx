"use client";

import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "h-12 w-full appearance-none rounded-[4px] border bg-white px-4 pr-10 font-body text-base text-slate",
              "transition-colors duration-150",
              "focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none",
              error ? "border-error" : "border-gray-border",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-text"
            size={20}
          />
        </div>
        {error && (
          <span className="font-body text-xs text-error">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
