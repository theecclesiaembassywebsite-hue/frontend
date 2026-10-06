// Shows which client a submission came from. The backend records this from an
// X-Client-Platform header, so it is analytics only: informational, never a
// basis for any decision. Rows from before tracking began arrive as UNKNOWN.
const LABELS: Record<string, { label: string; className: string }> = {
  WEB: { label: "Website", className: "bg-info/10 text-info" },
  IOS: { label: "iOS app", className: "bg-purple/10 text-purple" },
  ANDROID: { label: "Android app", className: "bg-success/10 text-success" },
};

export function SubmittedViaBadge({ source }: { source?: string | null }) {
  const known = source ? LABELS[source] : undefined;
  const { label, className } = known ?? {
    label: "Unknown",
    className: "bg-gray-border/40 text-gray-text",
  };
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 font-heading text-[10px] font-semibold ${className}`}
      title="Where this was submitted from"
    >
      {label}
    </span>
  );
}
