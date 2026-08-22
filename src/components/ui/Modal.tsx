"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Everything focusable, minus anything explicitly removed from the tab order.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Kept in a ref so the effect below depends only on isOpen. Every caller
  // passes an inline arrow for onClose, so its identity changes on each parent
  // render — and a form inside the dialog re-renders the parent on every
  // keystroke. Re-running the effect would hand focus back to the opener and
  // then into the first control, yanking the caret out of the field.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    // Remember where focus came from so it can be handed back on close —
    // without this, dismissing the dialog drops keyboard users at the top of
    // the document and they have to tab all the way back.
    const opener = document.activeElement as HTMLElement | null;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap. Tab is otherwise free to walk out of the dialog and into
      // the page behind it, which is still visible but inert to the eye.
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";

    // Move focus into the dialog: the first control if there is one, else the
    // panel itself so the screen reader announces the dialog rather than
    // leaving focus stranded on the page behind.
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    // For dense dialogs — multi-column field grids, long forms, the hub
    // manager. Below this, a grid-cols-3 row gets ~150px per column and the
    // labels wrap onto three lines each. Prose-reading dialogs deliberately
    // stay narrower: a wide measure hurts readability rather than helping.
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={cn(
          "surface-light relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl outline-none",
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between bg-purple px-6 py-4 border-b">
            <h2 id={titleId} className="font-heading text-xl font-bold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-lavender transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-text hover:text-slate transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
