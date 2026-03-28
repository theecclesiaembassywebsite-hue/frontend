"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    return (
      <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-[3px] border transition-colors duration-150",
              "peer-checked:bg-purple peer-checked:border-purple",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-purple-vivid peer-focus-visible:ring-offset-2",
              checked ? "border-purple bg-purple" : "border-[#CCCCCC] bg-white",
              className
            )}
          >
            {checked && (
              <Check className="h-5 w-5 text-white p-0.5" strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <span className="font-body text-base text-slate">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
