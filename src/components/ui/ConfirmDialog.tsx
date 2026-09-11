"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm action as a destructive (red) action instead of the brand gold primary. */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

const confirmButtonBase =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 font-heading text-[13px] font-semibold uppercase tracking-[1.5px] transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Branded replacement for `window.confirm(...)`. Built on the shadcn
 * alert-dialog primitives but styled with this project's own button look
 * (not shadcn's default button) so it matches the rest of the app.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={submitting}
            className={cn(
              confirmButtonBase,
              "border border-slate/12 bg-white text-slate hover:border-slate/25 hover:bg-slate/4"
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            className={cn(
              confirmButtonBase,
              destructive
                ? "bg-error text-white shadow-[0_14px_28px_rgba(231,76,60,0.24)] hover:-translate-y-0.5 hover:bg-error/90"
                : "bg-gold text-[#0E0B1E] shadow-[0_14px_28px_rgba(201,168,76,0.2)] hover:-translate-y-0.5 hover:bg-gold-dark"
            )}
          >
            {submitting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
