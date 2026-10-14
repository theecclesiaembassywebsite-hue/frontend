"use client";

import { Fragment, useState, type ReactNode } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { FormGuardFields } from "@/components/forms/FormGuardFields";
import {
  DISPLAY_TYPES,
  isFieldVisible,
  type AnswerValue,
  type CoreKey,
  type RegistrationFormConfig,
  type RegistrationFormField,
} from "@/lib/registration-form";

export interface FormSubmission {
  /** Name, email and phone, which fill the enrolment's own columns. */
  core: Partial<Record<CoreKey, string>>;
  /** Every other visible question, keyed by field id. */
  answers: Record<string, AnswerValue>;
  files: Record<string, File>;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const textareaClass =
  "w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none";

interface Props {
  config: RegistrationFormConfig;
  onSubmit: (submission: FormSubmission) => void | Promise<void>;
  submitLabel: string;
  submitIcon?: ReactNode;
  submitVariant?: "primary" | "giving" | "secondary";
  submitClassName?: string;
  onCancel?: () => void;
  disabled?: boolean;
  /** Placeholder-as-label layout, for forms that show no visible labels. */
  compact?: boolean;
  /** Rendered above the first field. */
  top?: ReactNode;
  /** Page-specific controls placed right after the field with that id. */
  after?: Record<string, ReactNode>;
  /** Bot defence for the public forms; off for signed-in-only endpoints. */
  guard?: boolean;
  className?: string;
}

/** Draws a server-defined form and hands back its answers. */
export default function FormRenderer({
  config,
  onSubmit,
  submitLabel,
  submitIcon,
  submitVariant = "primary",
  submitClassName,
  onCancel,
  disabled,
  compact = false,
  top,
  after,
  guard = true,
  className = "space-y-4",
}: Props) {
  const [values, setValues] = useState<Record<string, AnswerValue>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const set = (id: string, v: AnswerValue) => setValues((prev) => ({ ...prev, [id]: v }));

  function pickFile(id: string, file: File | null) {
    setFileErrors((e) => ({ ...e, [id]: "" }));
    setFiles((f) => {
      const next = { ...f };
      delete next[id];
      return next;
    });
    if (!file) return;
    if (!FILE_TYPES.includes(file.type)) {
      return setFileErrors((e) => ({ ...e, [id]: "Upload a JPG, PNG, WebP or PDF file." }));
    }
    if (file.size > MAX_FILE_BYTES) {
      return setFileErrors((e) => ({ ...e, [id]: "File is larger than 10 MB." }));
    }
    setFiles((f) => ({ ...f, [id]: file }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const core: FormSubmission["core"] = {};
    const answers: FormSubmission["answers"] = {};
    for (const f of config.fields) {
      if (DISPLAY_TYPES.includes(f.type) || f.type === "file") continue;
      if (!isFieldVisible(config.fields, f, values)) continue;
      const v = values[f.id];
      if (f.core) core[f.core] = typeof v === "string" ? v.trim() : "";
      else if (f.type === "checkbox") answers[f.id] = v === true;
      else if (typeof v === "string" && v.trim()) answers[f.id] = v.trim();
    }
    const outFiles: Record<string, File> = {};
    for (const f of config.fields) {
      if (f.type !== "file" || !isFieldVisible(config.fields, f, values)) continue;
      if (files[f.id]) outFiles[f.id] = files[f.id];
      else if (f.required) {
        return setFileErrors((errs) => ({ ...errs, [f.id]: `Please upload: ${f.label}.` }));
      }
    }
    void onSubmit({ core, answers, files: outFiles });
  }

  function renderField(f: RegistrationFormField) {
    const id = `rf-${f.id}`;
    const text = (values[f.id] as string | undefined) ?? "";
    const label = f.required && !f.core ? `${f.label} *` : f.label;
    const help = f.helpText && f.type !== "heading" && f.type !== "info" ? (
      <p className="font-body text-xs text-gray-text">{f.helpText}</p>
    ) : null;

    switch (f.type) {
      case "heading":
        return (
          <div className="space-y-1 border-t border-gray-border pt-5">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-slate">{f.label}</p>
            {f.helpText && <p className="font-body text-xs text-gray-text">{f.helpText}</p>}
          </div>
        );

      case "info":
        return (
          <div className="space-y-2 rounded-[10px] bg-purple-light/40 px-4 py-3 text-sm">
            <p className="font-heading font-semibold text-slate">{f.label}</p>
            {(f.helpText ?? "")
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <p key={i} className="text-[13px] text-gray-text">
                  {line}
                </p>
              ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex flex-col gap-1">
            <label htmlFor={id} className="flex cursor-pointer items-start gap-2 font-body text-sm text-slate">
              <input
                id={id}
                type="checkbox"
                checked={values[f.id] === true}
                onChange={(e) => set(f.id, e.target.checked)}
                required={f.required}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                {f.label}
                {f.required && <span className="text-error"> *</span>}
              </span>
            </label>
            {help}
          </div>
        );

      case "radio":
        return (
          <div>
            <p className="font-body text-sm font-medium text-slate">
              {f.label}
              {f.required && <span className="text-error"> *</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {(f.options ?? []).map((opt) => (
                <label key={opt} className="inline-flex cursor-pointer items-center gap-2 font-body text-sm text-slate">
                  <input
                    type="radio"
                    name={id}
                    value={opt}
                    checked={text === opt}
                    onChange={() => set(f.id, opt)}
                    required={f.required}
                    className="h-4 w-4 accent-[var(--color-purple,#5b2a9e)]"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {help && <div className="mt-2">{help}</div>}
          </div>
        );

      case "select":
        return (
          <div className="flex flex-col gap-1.5">
            <Select
              id={id}
              label={compact ? undefined : label}
              aria-label={compact ? f.label : undefined}
              required={f.required}
              value={text}
              onChange={(e) => set(f.id, e.target.value)}
              placeholder={f.placeholder || (compact ? f.label : "Select...")}
              options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
            />
            {help}
          </div>
        );

      case "textarea":
        return (
          <div className="flex flex-col gap-1.5">
            {!compact && (
              <label htmlFor={id} className="font-body text-sm font-medium text-slate">
                {label}
              </label>
            )}
            <textarea
              id={id}
              rows={3}
              maxLength={2000}
              required={f.required}
              aria-label={compact ? f.label : undefined}
              placeholder={f.placeholder || (compact ? f.label : undefined)}
              value={text}
              onChange={(e) => set(f.id, e.target.value)}
              className={textareaClass}
            />
            {help}
          </div>
        );

      case "file":
        return (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="font-body text-sm font-medium text-slate">
              {f.label}
              {f.required && <span className="text-error"> *</span>}
            </label>
            <input
              id={id}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => pickFile(f.id, e.target.files?.[0] ?? null)}
              required={f.required}
              className="font-body text-sm text-gray-text file:mr-4 file:rounded-[4px] file:border-0 file:bg-purple-light/60 file:px-4 file:py-2 file:font-heading file:text-sm file:font-semibold file:text-purple"
            />
            {help}
            {fileErrors[f.id] && <span className="font-body text-xs text-error">{fileErrors[f.id]}</span>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-1.5">
            <Input
              id={id}
              label={compact ? undefined : label}
              aria-label={compact ? f.label : undefined}
              type={f.type === "text" ? "text" : f.type}
              required={f.required}
              maxLength={f.type === "text" ? 500 : f.type === "tel" ? 25 : undefined}
              placeholder={f.placeholder || (compact ? f.label : undefined)}
              value={text}
              onChange={(e) => set(f.id, e.target.value)}
            />
            {help}
          </div>
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {guard && <FormGuardFields />}
      {top}
      {config.fields
        .filter((f) => isFieldVisible(config.fields, f, values))
        .map((f) => (
          <Fragment key={f.id}>
            {renderField(f)}
            {after?.[f.id]}
          </Fragment>
        ))}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant={submitVariant}
          disabled={disabled}
          className={submitClassName ?? "flex-1 justify-center gap-2"}
        >
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
