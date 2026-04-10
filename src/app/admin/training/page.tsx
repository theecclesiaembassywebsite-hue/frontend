"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Search, GraduationCap, CreditCard, Clock, CheckCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { training } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const programOptions = [
  { value: "", label: "All Programs" },
  { value: "DTD", label: "DTD" },
  { value: "SENATE", label: "SENATE" },
  { value: "SMIT", label: "SMIT" },
  { value: "SPOUDAZO", label: "SPOUDAZO" },
  { value: "WORKSHOP", label: "WORKSHOP" },
];

const paymentStatusBadge: Record<string, string> = {
  SUCCESS: "bg-success/10 text-success",
  PENDING: "bg-warning/10 text-warning",
  FAILED: "bg-error/10 text-error",
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
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrollmentsList = await training.getAdminEnrollments(programFilter || undefined);
        setEnrollments(enrollmentsList || []);
        setFilteredEnrollments(enrollmentsList || []);
      } catch (err) {
        error("Failed to load training enrollments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programFilter, error]);

  useEffect(() => {
    const filtered = enrollments.filter((e) => {
      const matchesSearch = !search ||
        e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
    setFilteredEnrollments(filtered);
  }, [search, enrollments]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">KISOLAM Training Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const totalEnrollments = enrollments.length;
  const paidEnrollments = enrollments.filter((e) => e.paymentStatus === "SUCCESS").length;
  const pendingPayments = enrollments.filter((e) => e.paymentStatus === "PENDING").length;
  const totalRevenue = enrollments
    .filter((e) => e.paymentStatus === "SUCCESS")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate">KISOLAM Training Management</h1>
        <p className="text-body-small mt-1">Training enrollments and payment management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={16} className="text-purple" />
            <p className="text-[11px] text-gray-text">Total Enrollments</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{totalEnrollments}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-success" />
            <p className="text-[11px] text-gray-text">Paid</p>
          </div>
          <p className="font-heading text-xl font-bold text-success">{paidEnrollments}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-warning" />
            <p className="text-[11px] text-gray-text">Pending Payment</p>
          </div>
          <p className="font-heading text-xl font-bold text-warning">{pendingPayments}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">Total Revenue</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            }).format(totalRevenue)}
          </p>
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
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Student Name</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Email</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Phone</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Programme</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Payment Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Payment Ref</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((e) => {
                const StatusIcon = paymentStatusIcon[e.paymentStatus] || (() => null);
                return (
                  <tr key={e.id} className="hover:bg-off-white/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-heading text-sm font-semibold text-slate">{e.studentName || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">{e.email || "N/A"}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">{e.phone || "N/A"}</td>
                    <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{e.program || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${paymentStatusBadge[e.paymentStatus] || "bg-gray-text/10 text-gray-text"}`}>
                        {e.paymentStatus && StatusIcon && <StatusIcon size={10} />}
                        {e.paymentStatus || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">{e.paymentReference || "-"}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "N/A"}
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
