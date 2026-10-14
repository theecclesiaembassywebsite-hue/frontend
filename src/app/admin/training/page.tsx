"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  Search, GraduationCap, CreditCard, Clock, CheckCircle, Download, Eye, Pencil, Trash2, Plus, BookOpen, Link2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { training, TrainingCourse, TrainingCourseInput } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { SubmittedViaBadge } from "@/components/admin/SubmittedViaBadge";

// KISOLAM_ADMIN and TEMA_ADMIN manage only their own programme; ADMIN and
// SUPER_ADMIN manage both. The backend enforces this too - this only keeps the
// screen from offering what the API would refuse.
function useProgramScope(): "KISOLAM" | "TEMA" | "" {
  const { user } = useAuth();
  if (user?.role === "KISOLAM_ADMIN") return "KISOLAM";
  if (user?.role === "TEMA_ADMIN") return "TEMA";
  return "";
}

const scopedOptions = (
  options: { value: string; label: string }[],
  scope: string
) => (scope ? options.filter((o) => o.value === scope) : options);

const programOptions = [
  { value: "", label: "All Programs" },
  { value: "KISOLAM", label: "KISOLAM" },
  { value: "TEMA", label: "TEMA Academy" },
];

const managedProgramOptions = [
  { value: "", label: "All Programs" },
  { value: "KISOLAM", label: "KISOLAM" },
  { value: "TEMA", label: "TEMA Academy" },
];

const trackingOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ATTENDING", label: "Attending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

const paymentOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Paid (transfer received)" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const paymentStatusBadge: Record<string, string> = {
  SUCCESS: "bg-success/10 text-success",
  FREE: "bg-info/10 text-info",
  PENDING: "bg-warning/10 text-warning",
  FAILED: "bg-error/10 text-error",
};

const trackingBadge: Record<string, string> = {
  NEW: "bg-info/10 text-info",
  CONTACTED: "bg-purple/10 text-purple-vivid",
  ATTENDING: "bg-success/10 text-success",
  COMPLETED: "bg-slate/10 text-slate",
  DROPPED: "bg-error/10 text-error",
};

const paymentStatusIcon: Record<string, any> = {
  SUCCESS: CheckCircle,
  PENDING: Clock,
  FAILED: () => null,
};

const courseStatusBadge: Record<TrainingCourse["status"], string> = {
  UPCOMING: "bg-info/10 text-info",
  IN_SESSION: "bg-success/10 text-success",
  ENDED: "bg-gray-text/10 text-gray-text",
};

const courseStatusLabel: Record<TrainingCourse["status"], string> = {
  UPCOMING: "Upcoming",
  IN_SESSION: "In Session",
  ENDED: "Ended",
};

const emptyCourseForm = {
  program: "KISOLAM" as "KISOLAM" | "TEMA",
  code: "",
  name: "",
  description: "",
  duration: "",
  feeType: "FIXED" as "FIXED" | "FREE",
  fee: "",
  discountPercent: "",
  discountStartsAt: "",
  discountEndsAt: "",
  feeCurrency: "NGN",
  streams: "",
  startDate: "",
  endDate: "",
  registrationOpen: true,
  isActive: true,
  displayOrder: 0,
};

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function CoursesTab() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const scope = useProgramScope();
  const [programFilter, setProgramFilter] = useState<string>(scope);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const [form, setForm] = useState(emptyCourseForm);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const reload = async (program?: string) => {
    try {
      setCourses(await training.getAdminCourses(program || undefined));
    } catch (err) {
      error("Failed to load courses");
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload(programFilter);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFilter]);

  function openCreate() {
    setEditingCourse(null);
    setForm(scope ? { ...emptyCourseForm, program: scope } : emptyCourseForm);
    setShowFormModal(true);
  }

  function openEdit(course: TrainingCourse) {
    setEditingCourse(course);
    setForm({
      program: course.program,
      code: course.code,
      name: course.name,
      description: course.description,
      duration: course.duration,
      feeType: course.feeType,
      fee: course.fee != null ? String(course.fee) : "",
      discountPercent: course.discountPercent != null ? String(course.discountPercent) : "",
      discountStartsAt: toDateInputValue(course.discountStartsAt),
      discountEndsAt: toDateInputValue(course.discountEndsAt),
      feeCurrency: course.feeCurrency,
      streams: course.streams.join(", "),
      startDate: toDateInputValue(course.startDate),
      endDate: toDateInputValue(course.endDate),
      registrationOpen: course.registrationOpen,
      isActive: course.isActive,
      displayOrder: course.displayOrder,
    });
    setShowFormModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const isFree = form.feeType === "FREE";

    if (!isFree && form.fee.trim() === "") {
      error("Enter a fee amount, or set the fee type to Free.");
      return;
    }

    const discountPercent = form.discountPercent.trim()
      ? Number(form.discountPercent)
      : null;

    if (discountPercent !== null && (discountPercent < 1 || discountPercent > 100)) {
      error("Discount must be between 1% and 100%.");
      return;
    }

    if (discountPercent === null && (form.discountStartsAt || form.discountEndsAt)) {
      error("Enter a discount percentage, or clear the discount dates.");
      return;
    }

    if (
      form.discountStartsAt &&
      form.discountEndsAt &&
      new Date(form.discountEndsAt) < new Date(form.discountStartsAt)
    ) {
      error("The discount end date must be after the start date.");
      return;
    }

    const payload: TrainingCourseInput = {
      program: form.program,
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      feeType: form.feeType,
      // A free course carries no price and no offer. Sending null rather than
      // undefined so switching an existing course to Free actually clears them.
      fee: isFree ? undefined : Number(form.fee),
      discountPercent: isFree ? null : discountPercent,
      discountStartsAt: isFree || !form.discountStartsAt
        ? null
        : new Date(form.discountStartsAt).toISOString(),
      discountEndsAt: isFree || !form.discountEndsAt
        ? null
        : new Date(form.discountEndsAt).toISOString(),
      feeCurrency: form.feeCurrency.trim() || "NGN",
      streams: form.streams.split(",").map((s) => s.trim()).filter(Boolean),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      registrationOpen: form.registrationOpen,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder) || 0,
    };

    setSaving(true);
    try {
      if (editingCourse) {
        const updated = await training.updateCourse(editingCourse.id, payload);
        setCourses(courses.map((c) => (c.id === editingCourse.id ? updated : c)));
        success("Course updated");
      } else {
        const created = await training.createCourse(payload);
        setCourses([...courses, created]);
        success("Course created");
      }
      setShowFormModal(false);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(course: TrainingCourse, field: "registrationOpen" | "isActive") {
    try {
      const updated = await training.updateCourse(course.id, { [field]: !course[field] });
      setCourses(courses.map((c) => (c.id === course.id ? updated : c)));
    } catch (err) {
      error("Failed to update course");
      console.error(err);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await training.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
      success("Course deleted");
    } catch (err) {
      error("Failed to delete course");
      console.error(err);
    }
  }

  // Shows the admin what the enrollee will actually pay, while they type.
  // Deliberately a preview only — the amount charged is recomputed on the
  // server from the saved row, so this can never be the number that bills.
  const discountPreview = (() => {
    if (form.feeType === "FREE") return null;
    const base = Number(form.fee);
    const percent = Number(form.discountPercent);
    if (!form.fee.trim() || !Number.isFinite(base) || base <= 0) return null;
    if (!form.discountPercent.trim() || !Number.isFinite(percent) || percent <= 0) return null;

    const effective = Math.max(0, Math.round((base * (100 - Math.min(percent, 100))) / 100));
    const currency = form.feeCurrency.trim() || "NGN";
    const window =
      form.discountStartsAt || form.discountEndsAt
        ? ` between ${form.discountStartsAt || "now"} and ${form.discountEndsAt || "no end date"}`
        : " immediately, with no end date";

    return effective === 0
      ? `Enrollees pay nothing${window}.`
      : `Enrollees pay ${currency}${effective.toLocaleString()} instead of ${currency}${base.toLocaleString()}${window}.`;
  })();

  // Reads the backend's computed pricing rather than re-deriving it, so this
  // column always matches what an enrollee is actually charged.
  const formatFee = (course: TrainingCourse) => {
    const p = course.pricing;
    if (p.isFree) return "Free";
    const amount = `${course.feeCurrency}${p.effectiveFee.toLocaleString()}`;
    if (!p.isDiscountActive) return amount;
    return `${amount} (${p.activeDiscountPercent}% off ${course.feeCurrency}${(p.baseFee ?? 0).toLocaleString()})`;
  };

  const formatSchedule = (course: TrainingCourse) => {
    const start = course.startDate ? new Date(course.startDate).toLocaleDateString() : null;
    const end = course.endDate ? new Date(course.endDate).toLocaleDateString() : null;
    if (!start && !end) return "No schedule set";
    return `${start || "—"} – ${end || "—"}`;
  };

  if (loading) {
    return <SkeletonGroup count={5} />;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
        <div className="w-full md:w-56">
          <Select
            id="course-program"
            options={scopedOptions(managedProgramOptions, scope)}
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          />
        </div>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={openCreate}>
          <Plus size={14} className="mr-1" /> New Course
        </Button>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-4">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Program</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Course</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Duration</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Fee</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Schedule</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Registration</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Visible</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-off-white/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-purple-vivid">{course.program}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-heading text-sm font-semibold text-slate">{course.code}</span>
                    <span className="block font-body text-[11px] text-gray-text">{course.name}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-slate">{course.duration}</td>
                  <td className="px-4 py-3 font-body text-sm text-slate">{formatFee(course)}</td>
                  <td className="px-4 py-3 font-body text-xs text-gray-text">{formatSchedule(course)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${courseStatusBadge[course.status]}`}>
                      {courseStatusLabel[course.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleField(course, "registrationOpen")}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold transition-colors",
                        course.registrationOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      )}
                    >
                      {course.registrationOpen ? "Open" : "Closed"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleField(course, "isActive")}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold transition-colors",
                        course.isActive ? "bg-success/10 text-success" : "bg-gray-text/10 text-gray-text"
                      )}
                    >
                      {course.isActive ? "Shown" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-[4px] p-1.5 text-purple-vivid hover:bg-purple/10 transition-colors"
                        title="Edit"
                        onClick={() => openEdit(course)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="rounded-[4px] p-1.5 text-error hover:bg-error/10 transition-colors"
                        title="Delete"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center font-body text-sm text-gray-text">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-body-small">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>

      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCourse ? "Edit Course" : "New Course"}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Program</label>
              <Select
                id="form-program"
                options={scopedOptions([{ value: "KISOLAM", label: "KISOLAM" }, { value: "TEMA", label: "TEMA Academy" }], scope)}
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value as "KISOLAM" | "TEMA" })}
              />
            </div>
            <Input
              id="form-code"
              label="Code"
              placeholder="e.g. DTD"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <Input
            id="form-name"
            label="Course Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="form-duration"
              label="Duration"
              placeholder="e.g. 3 months"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Fee Type</label>
              <Select
                id="form-feetype"
                options={[{ value: "FIXED", label: "Fixed" }, { value: "FREE", label: "Free" }]}
                value={form.feeType}
                onChange={(e) => setForm({ ...form, feeType: e.target.value as "FIXED" | "FREE" })}
              />
            </div>
          </div>

          {form.feeType === "FREE" ? (
            <p className="rounded-[6px] border border-gray-border bg-off-white px-4 py-3 font-body text-sm text-gray-text">
              This course is free. Enrollees will not be asked for payment, and no
              fee or discount is stored for it.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="form-fee"
                  label="Fee Amount"
                  type="number"
                  min="0"
                  placeholder="e.g. 20000"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                />
                <Input
                  id="form-currency"
                  label="Currency"
                  value={form.feeCurrency}
                  onChange={(e) => setForm({ ...form, feeCurrency: e.target.value })}
                />
              </div>

              <fieldset className="rounded-[6px] border border-gray-border p-4">
                <legend className="px-1 font-heading text-sm font-semibold text-slate">
                  Discount (optional)
                </legend>
                <p className="mb-3 font-body text-xs text-gray-text">
                  A percentage off the fee while the window below is open. Leave
                  the dates blank for a discount that starts now and does not
                  expire. Enrollees are charged the discounted amount
                  automatically.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    id="form-discount-percent"
                    label="Percent off"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 25"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  />
                  <Input
                    id="form-discount-start"
                    label="Starts (optional)"
                    type="date"
                    value={form.discountStartsAt}
                    onChange={(e) => setForm({ ...form, discountStartsAt: e.target.value })}
                  />
                  <Input
                    id="form-discount-end"
                    label="Ends (optional)"
                    type="date"
                    value={form.discountEndsAt}
                    onChange={(e) => setForm({ ...form, discountEndsAt: e.target.value })}
                  />
                </div>
                {discountPreview && (
                  <p className="mt-3 font-body text-sm text-slate">
                    {discountPreview}
                  </p>
                )}
              </fieldset>
            </>
          )}

          <Input
            id="form-streams"
            label="Streams / tags (comma-separated, optional)"
            placeholder="e.g. Classical, Contemporary, Percussion"
            value={form.streams}
            onChange={(e) => setForm({ ...form, streams: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="form-start"
              label="Start Date (optional)"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              id="form-end"
              label="End Date (optional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <p className="text-[11px] text-gray-text -mt-2">
            Leaving both dates blank keeps the course always "In Session". Set an end date to have it
            automatically switch to "Not in Session" once it passes.
          </p>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 font-body text-sm text-slate">
              <input
                type="checkbox"
                checked={form.registrationOpen}
                onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
              />
              Registration open
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-slate">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Visible on public site
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const scope = useProgramScope();
  const [programFilter, setProgramFilter] = useState<string>(scope);
  const [trackingFilter, setTrackingFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingEnrollment, setViewingEnrollment] = useState<any>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [editForm, setEditForm] = useState({ trackingStatus: "NEW", notes: "", paymentStatus: "" });
  const [freeCourseIds, setFreeCourseIds] = useState<Set<string>>(new Set());
  const { success, error } = useToast();

  // Free enrolments are stored with no payment status, which the table used to
  // show as "UNKNOWN". The list only carries a courseId, so look free courses up.
  const paymentLabel = (e: any): string =>
    e.paymentStatus || (e.courseId && freeCourseIds.has(e.courseId) ? "FREE" : "");

  const reload = async (program?: string) => {
    try {
      const [list, courseList] = await Promise.all([
        training.getAdminEnrollments(program || undefined),
        training.getAdminCourses(program || undefined).catch(() => [] as TrainingCourse[]),
      ]);
      setFreeCourseIds(new Set(courseList.filter((c) => c.pricing?.isFree).map((c) => c.id)));
      setEnrollments(list || []);
    } catch (err) {
      error("Failed to load training enrollments");
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload(programFilter);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFilter]);

  useEffect(() => {
    const filtered = enrollments.filter((e) => {
      const name = (e.name || e.studentName || "").toLowerCase();
      const matchesSearch =
        !search || name.includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
      const matchesTracking = !trackingFilter || (e.trackingStatus || "NEW") === trackingFilter;
      return matchesSearch && matchesTracking;
    });
    setFilteredEnrollments(filtered);
  }, [search, trackingFilter, enrollments]);

  const openEdit = (e: any) => {
    setEditingEnrollment(e);
    setEditForm({
      trackingStatus: e.trackingStatus || "NEW",
      notes: e.notes || "",
      paymentStatus: e.paymentStatus || "",
    });
  };

  const saveEdit = async () => {
    if (!editingEnrollment) return;
    try {
      const updated = await training.adminUpdateEnrollment(editingEnrollment.id, {
        trackingStatus: editForm.trackingStatus,
        notes: editForm.notes,
        // Only sent when set, so saving notes never rewrites a payment status.
        ...(editForm.paymentStatus ? { paymentStatus: editForm.paymentStatus } : {}),
      });
      setEnrollments(enrollments.map((e) => (e.id === editingEnrollment.id ? { ...e, ...updated } : e)));
      setEditingEnrollment(null);
      success("Enrollment updated");
    } catch (err) {
      error("Failed to update enrollment");
      console.error(err);
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (!confirm("Delete this enrollment? This cannot be undone.")) return;
    try {
      await training.adminDeleteEnrollment(id);
      setEnrollments(enrollments.filter((e) => e.id !== id));
      success("Enrollment deleted");
    } catch (err) {
      error("Failed to delete enrollment");
      console.error(err);
    }
  };

  const exportCSV = () => {
    const rows = filteredEnrollments.map((e) => ({
      Name: e.name || e.studentName || "",
      Email: e.email || "",
      Phone: e.phone || "",
      Program: e.program || "",
      "Sub-Program": e.additionalInfo?.program || "",
      "Payment Status": paymentLabel(e),
      "Payment Ref": e.paymentRef || e.paymentReference || "",
      "Receipt": e.receiptUrl || "",
      "Tracking Status": e.trackingStatus || "NEW",
      "Submitted Via": e.clientSource || "UNKNOWN",
      Notes: e.notes || "",
      "Date Applied": e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
    }));
    if (rows.length === 0) {
      error("No enrollments to export");
      return;
    }
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-enrollments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success(`Exported ${rows.length} enrollment${rows.length !== 1 ? "s" : ""}`);
  };

  const stats = useMemo(() => {
    const total = enrollments.length;
    const paid = enrollments.filter((e) => e.paymentStatus === "SUCCESS").length;
    const pending = enrollments.filter((e) => e.paymentStatus === "PENDING").length;
    const attending = enrollments.filter((e) => e.trackingStatus === "ATTENDING").length;
    const completed = enrollments.filter((e) => e.trackingStatus === "COMPLETED").length;
    return { total, paid, pending, attending, completed };
  }, [enrollments]);

  if (loading) {
    return <SkeletonGroup count={5} />;
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Button variant="secondary" className="text-xs py-2 px-4 min-w-0" onClick={exportCSV}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={16} className="text-purple" />
            <p className="text-[11px] text-gray-text">Total</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{stats.total}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-success" />
            <p className="text-[11px] text-gray-text">Paid</p>
          </div>
          <p className="font-heading text-xl font-bold text-success">{stats.paid}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-warning" />
            <p className="text-[11px] text-gray-text">Pending</p>
          </div>
          <p className="font-heading text-xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">Attending</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">{stats.attending}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-slate" />
            <p className="text-[11px] text-gray-text">Completed</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{stats.completed}</p>
        </div>
      </div>

      {/* Enrollments List */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">All Enrollments</h2>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1 relative">
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-44">
          <Select
            id="program"
            options={scopedOptions(programOptions, scope)}
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44">
          <Select
            id="tracking"
            options={[{ value: "", label: "All Statuses" }, ...trackingOptions]}
            value={trackingFilter}
            onChange={(e) => setTrackingFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Student</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Contact</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Programme</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Payment</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Tracking</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Submitted via</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((e) => {
                const StatusIcon = paymentStatusIcon[e.paymentStatus] || (() => null);
                const tracking = e.trackingStatus || "NEW";
                return (
                  <tr key={e.id} className="hover:bg-off-white/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-heading text-sm font-semibold text-slate">{e.name || e.studentName || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-slate">{e.email || "N/A"}</p>
                      <p className="font-body text-[11px] text-gray-text">{e.phone || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-heading text-sm font-semibold text-slate">{e.program || "N/A"}</span>
                      {e.additionalInfo?.program && (
                        <span className="block font-body text-[11px] text-gray-text">{e.additionalInfo.program}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${paymentStatusBadge[paymentLabel(e)] || "bg-gray-text/10 text-gray-text"}`}>
                        {e.paymentStatus && StatusIcon && <StatusIcon size={10} />}
                        {paymentLabel(e) || "UNKNOWN"}
                      </span>
                      {e.receiptUrl && (
                        <span className="mt-1 block font-body text-[10px] text-success">Receipt uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${trackingBadge[tracking] || "bg-gray-text/10 text-gray-text"}`}>
                        {tracking}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SubmittedViaBadge source={e.clientSource} />
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-[4px] p-1.5 text-purple-vivid hover:bg-purple/10 transition-colors"
                          title="View"
                          onClick={() => setViewingEnrollment(e)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="rounded-[4px] p-1.5 text-purple-vivid hover:bg-purple/10 transition-colors"
                          title="Edit"
                          onClick={() => openEdit(e)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="rounded-[4px] p-1.5 text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                          onClick={() => deleteEnrollment(e.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-gray-text">
                  No enrollments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}</p>

      {/* View Enrollment Modal */}
      <Modal isOpen={!!viewingEnrollment} onClose={() => setViewingEnrollment(null)} title="Enrollment Details" size="lg">
        {viewingEnrollment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Name</p>
                <p className="font-body text-sm text-slate">{viewingEnrollment.name || viewingEnrollment.studentName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Programme</p>
                <p className="font-body text-sm text-slate">{viewingEnrollment.program}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Email</p>
                <p className="font-body text-sm text-slate break-all">{viewingEnrollment.email}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Phone</p>
                <p className="font-body text-sm text-slate">{viewingEnrollment.phone}</p>
              </div>
            </div>
            {viewingEnrollment.additionalInfo?.custom &&
              Object.keys(viewingEnrollment.additionalInfo.custom).length > 0 && (
                <div>
                  <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Extra Questions</p>
                  <dl className="space-y-2 rounded-[4px] bg-off-white p-3">
                    {Object.entries(viewingEnrollment.additionalInfo.custom as Record<string, { label: string; value: string | boolean }>).map(
                      ([id, a]) => (
                        <div key={id}>
                          <dt className="font-body text-xs text-gray-text">{a.label}</dt>
                          <dd className="font-body text-sm text-slate">
                            {typeof a.value === "boolean" ? (a.value ? "Yes" : "No") : a.value}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              )}
            {viewingEnrollment.additionalInfo && (
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Additional Info</p>
                <pre className="font-body text-xs text-slate bg-off-white rounded-[4px] p-3 overflow-x-auto">
                  {JSON.stringify(
                    Object.fromEntries(Object.entries(viewingEnrollment.additionalInfo).filter(([k]) => k !== "custom")),
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Payment Status</p>
                <p className="font-body text-sm text-slate">{paymentLabel(viewingEnrollment) || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Payment Ref</p>
                <p className="font-body text-sm text-slate break-all">{viewingEnrollment.transferRef || viewingEnrollment.paymentRef || "-"}</p>
              </div>
              {viewingEnrollment.receiptUrl && (
                <div className="col-span-2">
                  <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Payment Receipt</p>
                  <a
                    href={viewingEnrollment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-purple-vivid underline"
                  >
                    Open receipt in Drive
                  </a>
                  {viewingEnrollment.receiptUploadedAt && (
                    <span className="ml-2 font-body text-[11px] text-gray-text">
                      uploaded {new Date(viewingEnrollment.receiptUploadedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Tracking Status</p>
              <p className="font-body text-sm text-slate">{viewingEnrollment.trackingStatus || "NEW"}</p>
            </div>
            {viewingEnrollment.notes && (
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Notes</p>
                <p className="font-body text-sm text-slate whitespace-pre-wrap">{viewingEnrollment.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Date Applied</p>
              <p className="font-body text-sm text-slate">{viewingEnrollment.createdAt ? new Date(viewingEnrollment.createdAt).toLocaleString() : "N/A"}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" className="flex-1" onClick={() => { const e = viewingEnrollment; setViewingEnrollment(null); openEdit(e); }}>Edit</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setViewingEnrollment(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Enrollment Modal */}
      <Modal isOpen={!!editingEnrollment} onClose={() => setEditingEnrollment(null)} title="Update Tracking">
        {editingEnrollment && (
          <div className="space-y-4">
            <div className="rounded-[4px] bg-off-white p-3">
              <p className="font-heading text-sm font-semibold text-slate">{editingEnrollment.name || editingEnrollment.studentName}</p>
              <p className="font-body text-xs text-gray-text">{editingEnrollment.email}</p>
              <p className="font-body text-xs text-gray-text mt-1">
                {editingEnrollment.program}
                {editingEnrollment.additionalInfo?.program ? ` — ${editingEnrollment.additionalInfo.program}` : ""}
              </p>
            </div>
            {editingEnrollment.program === "KISOLAM" && (
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">
                  Payment Status
                </label>
                <Select
                  id="edit-payment"
                  options={paymentOptions}
                  value={editForm.paymentStatus || "PENDING"}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                />
                <p className="mt-1 font-body text-xs text-gray-text">
                  KISOLAM is paid by bank transfer. Set to Paid once the transfer
                  {editingEnrollment.transferRef ? " with narration " + editingEnrollment.transferRef : ""} shows in the
                  Ecobank account.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Tracking Status</label>
              <Select
                id="edit-status"
                options={trackingOptions}
                value={editForm.trackingStatus}
                onChange={(e) => setEditForm({ ...editForm, trackingStatus: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Notes</label>
              <textarea
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Notes about follow-up, attendance, etc."
                rows={4}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" className="flex-1" onClick={saveEdit}>Save</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setEditingEnrollment(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DrivePanel() {
  const scope = useProgramScope();
  const [program, setProgram] = useState<string>(scope || "KISOLAM");
  const [status, setStatus] = useState<Awaited<ReturnType<typeof training.getDriveStatus>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { success, error } = useToast();

  const load = async (p: string) => {
    setLoading(true);
    try {
      setStatus(await training.getDriveStatus(p));
    } catch {
      error("Failed to load Drive status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(program);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  // Google sends the admin back here with ?drive=connected|failed|cancelled.
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("drive");
    if (!result) return;
    if (result === "connected") success("Google Drive connected.");
    else if (result === "cancelled") error("Google Drive connection was cancelled.");
    else error("Could not connect Google Drive. Please try again.");
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setBusy(true);
    try {
      const { url } = await training.connectDrive(program);
      window.location.href = url;
    } catch (err) {
      error(err instanceof Error ? err.message : "Could not start the connection");
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await training.disconnectDrive(program);
      success("Google Drive disconnected. Your existing files stay in your Drive.");
      await load(program);
    } catch {
      error("Could not disconnect");
    } finally {
      setBusy(false);
    }
  }

  const label = program === "TEMA" ? "TEMA" : "KISOLAM";

  return (
    <div className="max-w-2xl space-y-5">
      {!scope && (
        <div className="w-full md:w-56">
          <Select
            id="drive-program"
            options={[{ value: "KISOLAM", label: "KISOLAM" }, { value: "TEMA", label: "TEMA Academy" }]}
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <SkeletonGroup count={2} />
      ) : status?.connected ? (
        <div className="space-y-3 rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
          <p className="font-heading text-sm font-bold text-slate">Connected to Google Drive</p>
          <p className="font-body text-sm text-gray-text">
            New registrations are saved to the Drive of <strong>{status.googleEmail}</strong>.
          </p>
          <div className="flex flex-wrap gap-3 font-body text-sm">
            <a href={status.sheetUrl} target="_blank" rel="noopener noreferrer" className="text-purple underline">
              Open registrations Sheet
            </a>
            <a href={status.folderUrl} target="_blank" rel="noopener noreferrer" className="text-purple underline">
              Open folder
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={connect}>
              Reconnect
            </Button>
            <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
          <p className="font-heading text-sm font-bold text-slate">Not connected</p>
          <p className="font-body text-sm text-gray-text">
            Connect your own Google account and we will create a &quot;{label} Registrations&quot; folder and Sheet in
            your Drive. Each new registration is added there, with uploaded photographs. We can only see files we
            create, never the rest of your Drive.
            {program === "KISOLAM" && " Until this is connected, DTD registrants cannot upload their passport photograph."}
          </p>
          <Button variant="primary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={connect}>
            Connect Google Drive
          </Button>
        </div>
      )}
    </div>
  );
}

function AdminTrainingContent() {
  const [tab, setTab] = useState<"courses" | "enrollments" | "drive">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("drive") ? "drive" : "courses"
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate">Training Management</h1>
        <p className="text-body-small mt-1">KISOLAM and TEMA Academy courses, pricing, and enrollments</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-border">
        <button
          onClick={() => setTab("courses")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading text-sm font-semibold border-b-2 -mb-px transition-colors",
            tab === "courses" ? "border-purple text-purple" : "border-transparent text-gray-text hover:text-slate"
          )}
        >
          <BookOpen size={15} /> Courses
        </button>
        <button
          onClick={() => setTab("enrollments")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading text-sm font-semibold border-b-2 -mb-px transition-colors",
            tab === "enrollments" ? "border-purple text-purple" : "border-transparent text-gray-text hover:text-slate"
          )}
        >
          <GraduationCap size={15} /> Enrollments
        </button>
        <button
          onClick={() => setTab("drive")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading text-sm font-semibold border-b-2 -mb-px transition-colors",
            tab === "drive" ? "border-purple text-purple" : "border-transparent text-gray-text hover:text-slate"
          )}
        >
          <Link2 size={15} /> Google Drive
        </button>
      </div>

      {tab === "courses" ? <CoursesTab /> : tab === "enrollments" ? <EnrollmentsTab /> : <DrivePanel />}
    </div>
  );
}

export default function AdminTrainingPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "KISOLAM_ADMIN", "TEMA_ADMIN"]}>
      <AdminTrainingContent />
    </ProtectedRoute>
  );
}
