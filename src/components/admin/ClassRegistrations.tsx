"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { intentionalityClass } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type Answers = Record<string, { label: string; value: string | boolean }>;

interface Row {
  id: string;
  enrolledAt: string;
  answers?: Answers | null;
  user: { email: string; profile?: { firstName?: string; lastName?: string } | null };
  course: { title: string };
}

/** Who enrolled in the Intentionality Class, with their answers to the extra questions. */
export default function ClassRegistrations() {
  const { error } = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setRows(await intentionalityClass.adminGetEnrollments());
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not load registrations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-slate">Registrations</h2>
        <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" onClick={load} disabled={loading}>
          {loading ? "Loading..." : rows ? "Refresh" : "Show latest registrations"}
        </Button>
      </div>

      {rows && rows.length === 0 && (
        <p className="font-body text-sm text-gray-text">No registrations yet.</p>
      )}

      {rows && rows.length > 0 && (
        <div className="divide-y divide-gray-border rounded-[8px] border border-gray-border bg-white">
          {rows.map((r) => {
            const name = [r.user.profile?.firstName, r.user.profile?.lastName].filter(Boolean).join(" ");
            const answers = Object.values(r.answers ?? {});
            const isOpen = open === r.id;
            return (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-medium text-slate">{name || r.user.email}</p>
                    <p className="truncate font-body text-xs text-gray-text">
                      {r.user.email} · {r.course.title} · {new Date(r.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  {answers.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : r.id)}
                      className="flex shrink-0 items-center gap-1 font-body text-xs text-purple"
                    >
                      Answers {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
                {isOpen && (
                  <dl className="mt-3 space-y-2 rounded-[4px] bg-off-white p-3">
                    {answers.map((a, i) => (
                      <div key={i}>
                        <dt className="font-body text-xs text-gray-text">{a.label}</dt>
                        <dd className="font-body text-sm text-slate">
                          {typeof a.value === "boolean" ? (a.value ? "Yes" : "No") : a.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
