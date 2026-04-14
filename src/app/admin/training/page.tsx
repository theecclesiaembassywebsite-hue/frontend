"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Search, GraduationCap, CreditCard, Clock, CheckCircle, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { training } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const programOptions = [
  { value: "", label: "All Programs" },
  { value: "KISOLAM", label: "KISOLAM" },
  { value: "TEMA", label: "TEMA Academy" },
  { value: "EIS", label: "EIS" },
];

const trackingOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ATTENDING", label: "Attending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

const paymentStatusBadge: Record<string, string> = {
  SUCCESS: "bg-success/10 text-success",
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

function AdminTrainingContent() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [trackingFilter, setTrackingFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingEnrollment, setViewingEnrollment] = useState<any>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [editForm, setEditForm] = useState({ trackingStatus: "NEW", notes: "" });
  const { success, error } = useToast();

  const reload = async (program?: string) => {
    try {
      const list = await training.getAdminEnrollments(program || undefined);
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
    });
  };

  const saveEdit = async () => {
    if (!editingEnrollment) return;
    try {
      const updated = await training.adminUpdateEnrollment(editingEnrollment.id, editForm);
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
      "Payment Status": e.paymentStatus || "",
      "Payment Ref": e.paymentRef || e.paymentReference || "",
      "Tracking Status": e.trackingStatus || "NEW",
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
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Training Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Training Management</h1>
          <p className="text-body-small mt-1">KISOLAM, TEMA Academy and EIS enrollments</p>
        </div>
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
            options={programOptions}
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
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${paymentStatusBadge[e.paymentStatus] || "bg-gray-text/10 text-gray-text"}`}>
                        {e.paymentStatus && StatusIcon && <StatusIcon size={10} />}
                        {e.paymentStatus || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${trackingBadge[tracking] || "bg-gray-text/10 text-gray-text"}`}>
                        {tracking}
                      </span>
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
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-gray-text">
                  No enrollments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}</p>

      {/* View Enrollment Modal */}
      <Modal isOpen={!!viewingEnrollment} onClose={() => setViewingEnrollment(null)} title="Enrollment Details">
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
            {viewingEnrollment.additionalInfo && (
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Additional Info</p>
                <pre className="font-body text-xs text-slate bg-off-white rounded-[4px] p-3 overflow-x-auto">
                  {JSON.stringify(viewingEnrollment.additionalInfo, null, 2)}
                </pre>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Payment Status</p>
                <p className="font-body text-sm text-slate">{viewingEnrollment.paymentStatus || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Payment Ref</p>
                <p className="font-body text-sm text-slate break-all">{viewingEnrollment.paymentRef || "-"}</p>
              </div>
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

export default function AdminTrainingPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminTrainingContent />
    </ProtectedRoute>
  );
}
