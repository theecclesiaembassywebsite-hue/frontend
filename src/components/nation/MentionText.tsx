import type { MentionRef } from "@/lib/api";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Post / comment text with tagged members highlighted. Only names the server
 * confirmed as mentions are styled; any other "@word" stays plain text.
 * Rendered as React text nodes, never as HTML.
 */
export default function MentionText({
  text,
  mentions,
}: {
  text: string;
  mentions?: MentionRef[];
}) {
  if (!mentions?.length) return <>{text}</>;
  const names = [...new Set(mentions.map((m) => m.name))].sort(
    (a, b) => b.length - a.length,
  );
  const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).join("|")}))`, "g");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-semibold text-purple-vivid">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
