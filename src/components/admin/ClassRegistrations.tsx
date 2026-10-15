"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, RefreshCw, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { intentionalityClass } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type Answers = Record<string, { label: string; value: string | boolean }>;

interface Row {
  id: string;
  enrolledAt: string;
  status?: string;
  examScore?: number | null;
  answers?: Answers | null;
  completions?: { moduleId: string }[];
  user: { email: string; profile?: { firstName?: string; lastName?: string; phone?: string | null } | null };
  course: { id: string; title: string };
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety stop: 5,000 registrations

const fullName = (r: Row) =>
  [r.user.profile?.firstName, r.user.profile?.lastName].filter(Boolean).join(" ");

/** Profile phone, falling back to a phone-like answer from the registration form. */
const phoneOf = (r: Row) => {
  if (r.user.profile?.phone) return r.user.profile.phone;
  const a = Object.values(r.answers ?? {}).find((x) => /phone|whatsapp|mobile/i.test(x.label));
  return a ? String(a.value) : "";
};

const answerText = (v: string | boolean) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v);

const statusLabel = (s?: string) => (s ? s.replace(/_/g, " ") : "—");

function csvCell(value: unknown): string {
  let s = String(value ?? "");
  // Neutralise spreadsheet formula injection from user-supplied answers.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Everyone enrolled in the Intentionality Class, with their registration answers. */
export default function ClassRegistrations() {
  const { error } = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all: Row[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const batch: Row[] = await intentionalityClass.adminGetEnrollments(undefined, page, PAGE_SIZE);
        all.push(...batch);
        if (batch.length < PAGE_SIZE) break;
      }
      setRows(all);
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not load registrations.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    (rows ?? []).forEach((r) => map.set(r.course.id, r.course.title));
    return [...map.entries()];
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      if (courseId && r.course.id !== courseId) return false;
      if (!q) return true;
      const haystack = [
        fullName(r),
        r.user.email,
        phoneOf(r),
        ...Object.values(r.answers ?? {}).map((a) => String(a.value)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, courseId]);

  function exportCsv() {
    const labels: string[] = [];
    visible.forEach((r) =>
      Object.values(r.answers ?? {}).forEach((a) => {
        if (!labels.includes(a.label)) labels.push(a.label);
      }),
    );
    const header = ["Name", "Email", "Phone", "Course", "Status", "Enrolled", "Modules completed", "Exam score", ...labels];
    const lines = visible.map((r) => {
      const byLabel = new Map(Object.values(r.answers ?? {}).map((a) => [a.label, answerText(a.value)]));
      return [
        fullName(r),
        r.user.email,
        phoneOf(r),
        r.course.title,
        statusLabel(r.status),
        new Date(r.enrolledAt).toISOString().slice(0, 10),
        r.completions?.length ?? 0,
        r.examScore ?? "",
        ...labels.map((l) => byLabel.get(l) ?? ""),
      ]
        .map(csvCell)
        .join(",");
    });
    const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intentionality-class-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const th = "px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text";

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-slate">
          Registrations{rows ? ` (${visible.length}${visible.length !== rows.length ? ` of ${rows.length}` : ""})` : ""}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="min-w-0 px-4 py-2 text-xs"
            onClick={exportCsv}
            disabled={loading || visible.length === 0}
          >
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
          <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={`mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone or answers..."
            aria-label="Search registrations"
            className="w-full rounded-[4px] border border-gray-border bg-white py-2 pl-9 pr-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15"
          />
        </div>
        {courses.length > 1 && (
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            aria-label="Filter by course"
            className="rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15"
          >
            <option value="">All courses</option>
            {courses.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && !rows && <p className="font-body text-sm text-gray-text">Loading registrations...</p>}

      {rows && visible.length === 0 && (
        <p className="font-body text-sm text-gray-text">
          {rows.length === 0 ? "No registrations yet." : "No registrations match your search."}
        </p>
      )}

      {visible.length > 0 && (
        <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-border bg-off-white">
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Phone</th>
                <th className={th}>Course</th>
                <th className={th}>Status</th>
                <th className={th}>Enrolled</th>
                <th className={th}>
                  <span className="sr-only">Answers</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border">
              {visible.map((r) => {
                const answers = Object.values(r.answers ?? {});
                const isOpen = open === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-off-white/50">
                      <td className="px-4 py-3 font-body text-sm font-medium text-slate">{fullName(r) || "—"}</td>
                      <td className="px-4 py-3 font-body text-sm text-gray-text">{r.user.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-body text-sm text-gray-text">{phoneOf(r) || "—"}</td>
                      <td className="px-4 py-3 font-body text-sm text-gray-text">{r.course.title}</td>
                      <td className="px-4 py-3 font-body text-xs text-slate">
                        {statusLabel(r.status)}
                        {(r.completions?.length ?? 0) > 0 && (
                          <span className="text-gray-text"> · {r.completions!.length} modules</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-body text-sm text-gray-text">
                        {new Date(r.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {answers.length > 0 && (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpen(isOpen ? null : r.id)}
                            className="inline-flex items-center gap-1 font-body text-xs text-purple"
                          >
                            Answers {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={7} className="bg-off-white/50 px-4 py-3">
                          <dl className="grid gap-3 sm:grid-cols-2">
                            {answers.map((a, i) => (
                              <div key={i}>
                                <dt className="font-body text-xs text-gray-text">{a.label}</dt>
                                <dd className="font-body text-sm text-slate">{answerText(a.value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
