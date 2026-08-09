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

const columnStyles: Record<2 | 3 | 4, string> = {
  2: "grid gap-5 md:grid-cols-2",
  3: "grid gap-5 md:grid-cols-2 lg:grid-cols-3",
  4: "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function SkeletonGroup({
  count = 3,
  variant = "text",
  /** Lay the placeholders out as a grid so they stand in for the real cards. */
  columns,
  className,
}: {
  count?: number;
  variant?: "text" | "circle" | "card" | "table-row";
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div className={cn(columns ? columnStyles[columns] : "space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
