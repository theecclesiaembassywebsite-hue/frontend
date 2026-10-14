"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ClipboardList, Lock, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { intentionalityClass, registrationForms, training } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  DISPLAY_TYPES,
  type FieldType,
  type FormKey,
  type RegistrationFormConfig,
  type RegistrationFormField,
} from "@/lib/registration-form";

const FORMS: { key: FormKey; label: string; roles: string[] }[] = [
  { key: "KISOLAM", label: "KISOLAM", roles: ["ADMIN", "SUPER_ADMIN", "KISOLAM_ADMIN"] },
  { key: "TEMA", label: "TEMA", roles: ["ADMIN", "SUPER_ADMIN", "TEMA_ADMIN"] },
  { key: "INTENTIONALITY_CLASS", label: "Intentionality Class", roles: ["ADMIN", "SUPER_ADMIN"] },
];

const TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Choice buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email address" },
  { value: "tel", label: "Phone number" },
];

const selectClass =
  "h-12 w-full rounded-[4px] border border-gray-border bg-white px-4 font-body text-base text-slate focus:border-purple-vivid focus:outline-none";
const areaClass =
  "w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate focus:border-purple-vivid focus:outline-none";

const isChoice = (t: FieldType) => t === "select" || t === "radio";
const newId = () => `q_${Math.random().toString(36).slice(2, 10)}`;

function FieldEditor({
  field,
  index,
  count,
  earlier,
  onChange,
  onMove,
  onRemove,
}: {
  field: RegistrationFormField;
  index: number;
  count: number;
  /** Fields above this one that a condition may refer to. */
  earlier: RegistrationFormField[];
  onChange: (f: RegistrationFormField) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof RegistrationFormField>(k: K, v: RegistrationFormField[K]) =>
    onChange({ ...field, [k]: v });
  const display = DISPLAY_TYPES.includes(field.type);
  const locked = !!field.core || field.type === "file";
  const dependable = earlier.filter((f) => isChoice(f.type) || f.type === "checkbox");
  const dep = field.showIf ? earlier.find((f) => f.id === field.showIf!.field) : undefined;
  const depOptions = dep ? (dep.type === "checkbox" ? ["true", "false"] : (dep.options ?? [])) : [];

  const kind =
    field.type === "heading" ? "Section heading" : field.type === "info" ? "Information note" : field.core ? "Standard field" : field.type === "file" ? "Photo upload" : "Question";

  return (
    <div className="space-y-3 rounded-[10px] border border-gray-border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.14em] text-gray-text">
          {locked && <Lock size={12} aria-label="Cannot be removed" />}
          {kind} · {index + 1}
        </p>
        <div className="flex gap-1">
          <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}
            className="rounded p-2 text-gray-text hover:bg-off-white disabled:opacity-30">
            <ArrowUp size={16} />
          </button>
          <button type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}
            className="rounded p-2 text-gray-text hover:bg-off-white disabled:opacity-30">
            <ArrowDown size={16} />
          </button>
          {!locked && (
            <button type="button" aria-label="Remove" onClick={onRemove} className="rounded p-2 text-error hover:bg-off-white">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <Input
          id={`label-${field.id}`}
          label={field.type === "heading" ? "Heading" : field.type === "info" ? "Note title" : "Question"}
          value={field.label}
          maxLength={200}
          onChange={(e) => set("label", e.target.value)}
        />
        {!locked && !display && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`type-${field.id}`} className="font-body text-sm font-medium text-slate">
              Answer type
            </label>
            <select
              id={`type-${field.id}`}
              className={selectClass}
              value={field.type}
              onChange={(e) => {
                const type = e.target.value as FieldType;
                onChange({
                  ...field,
                  type,
                  options: isChoice(type) ? (field.options?.length ? field.options : ["", ""]) : undefined,
                });
              }}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isChoice(field.type) && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`opts-${field.id}`} className="font-body text-sm font-medium text-slate">
            Options (one per line, at least 2)
          </label>
          <textarea
            id={`opts-${field.id}`}
            rows={4}
            className={areaClass}
            value={(field.options ?? []).join("\n")}
            onChange={(e) => set("options", e.target.value.split("\n"))}
          />
        </div>
      )}

      {!display && field.type !== "checkbox" && field.type !== "radio" && field.type !== "file" && (
        <Input
          id={`ph-${field.id}`}
          label="Placeholder (optional)"
          value={field.placeholder ?? ""}
          maxLength={120}
          onChange={(e) => set("placeholder", e.target.value)}
        />
      )}

      {display ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`help-${field.id}`} className="font-body text-sm font-medium text-slate">
            {field.type === "heading" ? "Hint under the heading (optional)" : "Text (a new line starts a new paragraph)"}
          </label>
          <textarea
            id={`help-${field.id}`}
            rows={field.type === "info" ? 5 : 2}
            maxLength={1000}
            className={areaClass}
            value={field.helpText ?? ""}
            onChange={(e) => set("helpText", e.target.value)}
          />
        </div>
      ) : (
        <Input
          id={`help-${field.id}`}
          label="Help text under the field (optional)"
          value={field.helpText ?? ""}
          maxLength={1000}
          onChange={(e) => set("helpText", e.target.value)}
        />
      )}

      {!display && !field.core && (
        <label className="flex items-center gap-2 font-body text-sm text-slate">
          <input type="checkbox" checked={field.required} onChange={(e) => set("required", e.target.checked)} className="h-4 w-4" />
          {field.type === "checkbox" ? "Must be ticked to register" : "Required"}
        </label>
      )}

      {!field.core && dependable.length > 0 && (
        <div className="rounded-[8px] bg-off-white p-3">
          <label className="flex items-center gap-2 font-body text-sm text-slate">
            <input
              type="checkbox"
              checked={!!field.showIf}
              onChange={(e) =>
                set("showIf", e.target.checked ? { field: dependable[0].id, equals: "" } : undefined)
              }
              className="h-4 w-4"
            />
            Only show this when an earlier answer matches
          </label>
          {field.showIf && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select
                aria-label="Earlier question"
                className={selectClass}
                value={field.showIf.field}
                onChange={(e) => set("showIf", { field: e.target.value, equals: "" })}
              >
                {dependable.map((f) => (
                  <option key={f.id} value={f.id}>{f.label || "(untitled)"}</option>
                ))}
              </select>
              <select
                aria-label="Answer"
                className={selectClass}
                value={field.showIf.equals}
                onChange={(e) => set("showIf", { field: field.showIf!.field, equals: e.target.value })}
              >
                <option value="" disabled>is...</option>
                {depOptions.map((o) => (
                  <option key={o} value={o}>
                    {o === "true" ? "ticked" : o === "false" ? "not ticked" : o}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {!display && (
        <Input
          id={`col-${field.id}`}
          label="Column title in Google Sheets (optional)"
          value={field.sheetColumn ?? ""}
          maxLength={60}
          onChange={(e) => set("sheetColumn", e.target.value)}
        />
      )}
    </div>
  );
}

type Source = "course" | "program" | "builtin";

function FormEditor({
  formKey,
  courseId,
  courseName,
}: {
  formKey: FormKey;
  /** Undefined edits the programme's default form. */
  courseId?: string;
  courseName?: string;
}) {
  const { success, error } = useToast();
  const [config, setConfig] = useState<RegistrationFormConfig>({ fields: [] });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [source, setSource] = useState<Source>("builtin");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setDirty(false);
    setConfirmReset(false);
    registrationForms
      .get(formKey, courseId, true)
      .then((c) => {
        if (cancelled) return;
        setConfig({ fields: c?.fields ?? [] });
        setSource(c?.source ?? "builtin");
      })
      .catch((e) => error(e instanceof Error ? e.message : "Could not load this form."))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, courseId]);

  const update = (fields: RegistrationFormField[]) => {
    setConfig({ fields });
    setDirty(true);
  };

  function move(i: number, dir: -1 | 1) {
    const fields = [...config.fields];
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]];
    update(fields);
  }

  function add(type: FieldType) {
    const base = { id: newId(), label: "", type, required: false };
    update([
      ...config.fields,
      isChoice(type) ? { ...base, options: ["", ""] } : base,
    ]);
  }

  async function save() {
    for (const [i, f] of config.fields.entries()) {
      if (!f.label.trim()) return error(`Item ${i + 1} needs some text.`);
      if (isChoice(f.type) && (f.options ?? []).filter((o) => o.trim()).length < 2) {
        return error(`"${f.label}" needs at least 2 options.`);
      }
      if (f.showIf && !f.showIf.equals) return error(`"${f.label}" needs a value for its condition.`);
    }
    setSaving(true);
    try {
      const saved = await registrationForms.save(formKey, courseId, {
        fields: config.fields.map((f) => ({
          ...f,
          options: isChoice(f.type) ? (f.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
        })),
      });
      setConfig({ fields: saved.fields ?? [] });
      setSource(courseId ? "course" : "program");
      setDirty(false);
      success("Form saved. Changes are live on the website and the app.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save the form.");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      const fresh = await registrationForms.reset(formKey, courseId);
      setConfig({ fields: fresh.fields ?? [] });
      setSource(fresh.source ?? "builtin");
      setDirty(false);
      setConfirmReset(false);
      success(courseId ? "This course now uses the default form." : "Form restored to the original.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not reset the form.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <div className="h-40 animate-pulse rounded-[10px] bg-white" />;

  return (
    <div className="space-y-4">
      <p className="rounded-[8px] bg-purple-light/40 px-4 py-3 font-body text-sm text-slate">
        {courseId
          ? source === "course"
            ? `${courseName} has its own form.`
            : `${courseName} is using the ${source === "program" ? "programme's default" : "original"} form. Saving here creates a form just for this course.`
          : "This is the default form. Every course in this programme uses it unless it has a form of its own."}
      </p>
      <p className="font-body text-sm text-gray-text">
        This is exactly what people fill in. Standard fields (marked with a lock) can be reworded and moved but not
        removed. Removing a question hides it from new registrations; answers already collected are kept.
      </p>

      {config.fields.map((f, i) => (
        <FieldEditor
          key={f.id}
          field={f}
          index={i}
          count={config.fields.length}
          earlier={config.fields.slice(0, i)}
          onChange={(next) => update(config.fields.map((x, j) => (j === i ? next : x)))}
          onMove={(dir) => move(i, dir)}
          onRemove={() => update(config.fields.filter((_, j) => j !== i))}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={config.fields.length >= 40} onClick={() => add("text")}>
          <Plus size={16} className="mr-2" /> Add question
        </Button>
        <Button type="button" variant="secondary" disabled={config.fields.length >= 40} onClick={() => add("heading")}>
          <Plus size={16} className="mr-2" /> Add section heading
        </Button>
        <Button type="button" variant="secondary" disabled={config.fields.length >= 40} onClick={() => add("info")}>
          <Plus size={16} className="mr-2" /> Add note
        </Button>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-border bg-off-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <p className="font-body text-xs text-gray-text">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          {confirmReset ? (
            <span className="flex items-center gap-2 font-body text-xs">
              {courseId ? "Remove this course's own form?" : "Replace this form with the original?"}
              <button type="button" onClick={reset} disabled={saving} className="font-semibold text-error">Yes, restore</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="text-gray-text">Cancel</button>
            </span>
          ) : (
            (courseId ? source === "course" : true) && (
              <button type="button" onClick={() => setConfirmReset(true)} className="font-body text-xs text-gray-text underline">
                {courseId ? "Use the default form" : "Restore original"}
              </button>
            )
          )}
        </div>
        <Button type="button" variant="primary" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving..." : "Save form"}
        </Button>
      </div>
    </div>
  );
}

function AdminFormsContent() {
  const { user } = useAuth();
  const allowed = useMemo(() => FORMS.filter((f) => f.roles.includes(user?.role ?? "")), [user?.role]);
  const [active, setActive] = useState<FormKey | null>(null);
  const current = active ?? allowed[0]?.key ?? null;
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [courseId, setCourseId] = useState("");
  const { error } = useToast();

  // The courses of the chosen programme: training courses for KISOLAM and TEMA,
  // class phases for the Intentionality Class.
  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setCourseId("");
    setCourses([]);
    const load =
      current === "INTENTIONALITY_CLASS"
        ? intentionalityClass.adminGetCourses().then((rows) =>
            (rows ?? []).map((c: { id: string; title: string }) => ({ id: c.id, name: c.title })),
          )
        : training
            .getAdminCourses(current)
            .then((rows) => rows.map((c) => ({ id: c.id, name: `${c.name} (${c.code})` })));
    load
      .then((list) => !cancelled && setCourses(list))
      .catch(() => !cancelled && error("Could not load the course list."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  const courseName = courses.find((c) => c.id === courseId)?.name;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-purple" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Registration forms</h1>
          <p className="font-body text-sm text-gray-text">
            Edit what each form asks. Saved changes go live straight away on the website and the app.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {allowed.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={current === f.key}
            onClick={() => setActive(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 font-body text-sm transition-colors ${
              current === f.key
                ? "bg-purple text-white"
                : "border border-gray-border bg-white text-gray-text hover:text-slate"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="form-course" className="font-body text-sm font-medium text-slate">
            {current === "INTENTIONALITY_CLASS" ? "Phase" : "Course"}
          </label>
          <select
            id="form-course"
            className={selectClass}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">All {current === "INTENTIONALITY_CLASS" ? "phases" : "courses"} (default form)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {current && (
        <FormEditor
          key={`${current}:${courseId}`}
          formKey={current}
          courseId={courseId || undefined}
          courseName={courseName}
        />
      )}
    </div>
  );
}

export default function AdminFormsPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "KISOLAM_ADMIN", "TEMA_ADMIN"]}>
      <AdminFormsContent />
    </ProtectedRoute>
  );
}
