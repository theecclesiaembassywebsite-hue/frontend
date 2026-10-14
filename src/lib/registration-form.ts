"use client";

import { useEffect, useState } from "react";
import { registrationForms } from "@/lib/api";

// Server-defined registration forms. The backend owns the field list (including
// name, email and phone); this file only describes its shape and loads it.

// A form belongs to a programme and, optionally, to one course in it.
export type FormKey = "KISOLAM" | "TEMA" | "INTENTIONALITY_CLASS";
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "number"
  | "email"
  | "tel"
  | "file"
  | "heading"
  | "info";
export type CoreKey = "name" | "email" | "phone";

export interface RegistrationFormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  core?: CoreKey;
  showIf?: { field: string; equals: string };
  sheetColumn?: string;
}

export interface RegistrationFormConfig {
  fields: RegistrationFormField[];
}

export type AnswerValue = string | boolean;

/** Types that only shape the page and never carry an answer. */
export const DISPLAY_TYPES: FieldType[] = ["heading", "info"];

// What a form shows if the server cannot be reached. The three standard fields
// are enough to register; extra questions simply do not appear.
const CORE_FALLBACK: RegistrationFormConfig = {
  fields: [
    { id: "name", core: "name", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
    { id: "email", core: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
    { id: "phone", core: "phone", type: "tel", label: "Phone Number", placeholder: "+234...", required: true },
  ],
};
const FALLBACKS: Record<FormKey, RegistrationFormConfig> = {
  KISOLAM: CORE_FALLBACK,
  TEMA: CORE_FALLBACK,
  INTENTIONALITY_CLASS: { fields: [] },
};

export type FormStatus = "loading" | "ready" | "error";

// One fetch per form per minute for the whole page session, however many
// components or navigations ask. A failed fetch is forgotten so the next ask retries.
const FORM_TTL_MS = 60_000;
const loaded = new Map<string, { at: number; request: Promise<RegistrationFormConfig> }>();

function loadForm(program: FormKey, courseId?: string): Promise<RegistrationFormConfig> {
  const id = `${program}:${courseId ?? ""}`;
  const hit = loaded.get(id);
  if (hit && Date.now() - hit.at < FORM_TTL_MS) return hit.request;
  const request = registrationForms.get(program, courseId);
  loaded.set(id, { at: Date.now(), request });
  request.catch(() => {
    if (loaded.get(id)?.request === request) loaded.delete(id);
  });
  return request;
}

interface Options {
  /** Wait to fetch until this is true, e.g. until a course has been chosen. */
  enabled?: boolean;
  /**
   * Show the standard fields while loading or if the fetch fails. Turn off for a
   * form that must not appear without its extras (DTD needs its photo field).
   */
  fallback?: boolean;
  /** While a different course's form loads, keep showing the previous one. */
  keepPrevious?: boolean;
}

/**
 * Loads the live form for a programme, or for one course in it. `config` is
 * null only when there is no fallback and the form has not arrived yet.
 */
export function useRegistrationForm(
  program: FormKey,
  courseId?: string,
  { enabled = true, fallback = true, keepPrevious = false }: Options = {},
): { config: RegistrationFormConfig | null; status: FormStatus } {
  const id = `${program}:${courseId ?? ""}`;
  const [result, setResult] = useState<{
    id: string;
    config: RegistrationFormConfig | null;
    status: "ready" | "error";
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadForm(program, courseId)
      .then((c) => {
        if (cancelled) return;
        if (Array.isArray(c?.fields)) setResult({ id, config: { fields: c.fields }, status: "ready" });
        else setResult({ id, config: null, status: "error" });
      })
      .catch(() => {
        if (!cancelled) setResult({ id, config: null, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, enabled, program, courseId]);

  const base = fallback ? FALLBACKS[program] : null;
  if (result && result.id === id) {
    return { config: result.config ?? base, status: result.status };
  }
  return { config: keepPrevious && result?.config ? result.config : base, status: "loading" };
}

/** Whether a field is shown, given the answers so far. Hidden parents hide their children. */
export function isFieldVisible(
  fields: RegistrationFormField[],
  field: RegistrationFormField,
  values: Record<string, AnswerValue>,
): boolean {
  if (!field.showIf) return true;
  const parent = fields.find((f) => f.id === field.showIf!.field);
  if (!parent || !isFieldVisible(fields, parent, values)) return false;
  return String(values[parent.id] ?? "") === field.showIf.equals;
}
