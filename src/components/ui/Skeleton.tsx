import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "card" | "table-row";
  className?: string;
}

export function Skeleton({
  variant = "text",
  className,
}: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circle: "h-12 w-12 rounded-full",
    card: "h-64 w-full rounded-lg",
    "table-row": "h-12 w-full rounded",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-border",
        variants[variant],
        className
      )}
    />
  );
}

export function SkeletonGroup({
  count = 3,
  variant = "text",
  className,
}: {
  count?: number;
  variant?: "text" | "circle" | "card" | "table-row";
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
