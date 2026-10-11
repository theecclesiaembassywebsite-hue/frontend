"use client";

import { useEffect, useRef, useState } from "react";
import { nation, type MemberSuggestion, type MentionRef } from "@/lib/api";

interface MentionInputProps {
  value: string;
  onValueChange: (value: string) => void;
  mentions: MentionRef[];
  onMentionsChange: (mentions: MentionRef[]) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  onEnter?: () => void;
}

// What the member is typing right after an "@": up to two words, so a full
// name can be searched ("@Grace Ad"), ending at the caret.
const TRIGGER = /(^|\s)@([^\s@]{0,30}(?: [^\s@]{0,30})?)$/;

/**
 * A text field that suggests members when the writer types "@".
 *
 * The text stays plain ("@Grace Adeyemi"). Picking a suggestion records the
 * member in `mentions`; the caller sends those ids with the post, and the
 * server re-validates them. Typing an @name by hand without picking tags
 * nobody — which is what keeps this from notifying the wrong "Grace".
 */
export default function MentionInput({
  value,
  onValueChange,
  mentions,
  onMentionsChange,
  placeholder,
  maxLength,
  disabled,
  multiline = false,
  rows = 3,
  className,
  onEnter,
}: MentionInputProps) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (query === null || query.trim().length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      nation
        .searchMembers(query)
        .then((found) => {
          if (cancelled) return;
          setSuggestions(Array.isArray(found) ? found : []);
          setActive(0);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Results only count while the field is still asking for them; this avoids
  // clearing state from inside the effect above.
  const shown = query !== null && query.trim().length >= 2 ? suggestions : [];

  function detect(text: string, caret: number) {
    const match = TRIGGER.exec(text.slice(0, caret));
    setQuery(match ? match[2] : null);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    onValueChange(e.target.value);
    detect(e.target.value, e.target.selectionStart ?? e.target.value.length);
  }

  function pick(member: MemberSuggestion) {
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const match = TRIGGER.exec(before);
    if (!match) return;
    const start = before.length - match[2].length - 1; // index of the "@"
    const inserted = `@${member.name} `;
    const next = value.slice(0, start) + inserted + value.slice(caret);
    onValueChange(next);
    if (!mentions.some((m) => m.userId === member.id)) {
      onMentionsChange([...mentions, { userId: member.id, name: member.name }]);
    }
    setQuery(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      const pos = start + inserted.length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (shown.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % shown.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + shown.length) % shown.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pick(shown[active]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setQuery(null);
        return;
      }
    }
    if (!multiline && e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  const shared = {
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onClick: (e: React.MouseEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      detect(value, e.currentTarget.selectionStart ?? value.length),
    placeholder,
    maxLength,
    disabled,
    className,
    "aria-autocomplete": "list" as const,
    "aria-expanded": shown.length > 0,
  };

  return (
    <div className="relative flex-1">
      {multiline ? (
        <textarea ref={ref} rows={rows} {...shared} />
      ) : (
        <input ref={ref} type="text" {...shared} />
      )}
      {shown.length > 0 && (
        <ul
          role="listbox"
          aria-label="Suggested members"
          className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-auto rounded-[8px] border border-gray-border bg-white py-1 shadow-lg"
        >
          {shown.map((m, i) => (
            <li key={m.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                // mousedown, not click: click fires after the field loses focus
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(m);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left font-body text-sm text-slate ${
                  i === active ? "bg-lavender" : "hover:bg-lavender"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-light text-[10px] font-heading font-bold text-purple">
                  {m.name.charAt(0).toUpperCase()}
                </span>
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Mentions whose "@Name" is still in the text — the ones worth sending. */
export function activeMentions(text: string, mentions: MentionRef[]) {
  return mentions.filter((m) => text.includes(`@${m.name}`));
}
