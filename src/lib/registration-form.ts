"use client";

import { useEffect, useState } from "react";
import { registrationForms } from "@/lib/api";

// Server-defined registration forms. The backend owns the field list (including
// name, email and phone); this file only describes its shape and loads it.

export type FormKey = "KISOLAM" | "KISOLAM_DTD" | "TEMA" | "INTENTIONALITY_CLASS";
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
const FALLBACKS: Partial<Record<FormKey, RegistrationFormConfig>> = {
  KISOLAM: CORE_FALLBACK,
  TEMA: CORE_FALLBACK,
  INTENTIONALITY_CLASS: { fields: [] },
};

export type FormStatus = "loading" | "ready" | "error";

// One fetch per form per minute for the whole page session, however many
// components or navigations ask. A failed fetch is forgotten so the next ask retries.
const FORM_TTL_MS = 60_000;
const loaded = new Map<FormKey, { at: number; request: Promise<RegistrationFormConfig> }>();

function loadForm(key: FormKey): Promise<RegistrationFormConfig> {
  const hit = loaded.get(key);
  if (hit && Date.now() - hit.at < FORM_TTL_MS) return hit.request;
  const request = registrationForms.get(key);
  loaded.set(key, { at: Date.now(), request });
  request.catch(() => {
    if (loaded.get(key)?.request === request) loaded.delete(key);
  });
  return request;
}

/**
 * Loads the live form. `config` is null only for a form that has no sensible
 * fallback (the DTD form) until it arrives; the others render immediately and
 * update when the server answers.
 */
export function useRegistrationForm(key: FormKey): {
  config: RegistrationFormConfig | null;
  status: FormStatus;
} {
  const [state, setState] = useState<{ config: RegistrationFormConfig | null; status: FormStatus }>({
    config: FALLBACKS[key] ?? null,
    status: "loading",
  });
  useEffect(() => {
    let cancelled = false;
    loadForm(key)
      .then((c) => {
        if (!cancelled && Array.isArray(c?.fields)) setState({ config: { fields: c.fields }, status: "ready" });
        else if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return state;
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
