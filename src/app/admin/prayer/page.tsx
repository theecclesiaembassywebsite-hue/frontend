"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, HandHeart, Clock, CheckCircle, MessageSquare, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { prayer } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "RECEIVED", label: "New" },
  { value: "BEING_PRAYED_FOR", label: "Being Prayed For" },
  { value: "ANSWERED", label: "Answered" },
];

const statusBadge: Record<string, string> = {
  RECEIVED: "bg-info/10 text-info",
  BEING_PRAYED_FOR: "bg-purple/10 text-purple",
  ANSWERED: "bg-success/10 text-success",
};

function AdminPrayerContent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await prayer.getAdminPrayers();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        error("Failed to load prayer requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [error]);

  useEffect(() => {
    const filtered = requests.filter((r) => {
      const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredRequests(filtered);
  }, [search, statusFilter, requests]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      await prayer.updatePrayerStatus(requestId, newStatus);
      setRequests(requests.map((r) => r.id === requestId ? { ...r, status: newStatus } : r));
      success("Prayer status updated");
    } catch (err) {
      error("Failed to update prayer status");
      console.error(err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Prayer Request Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const newCount = requests.filter((r) => r.status === "RECEIVED").length;
  const prayingCount = requests.filter((r) => r.status === "BEING_PRAYED_FOR").length;
  const answeredCount = requests.filter((r) => r.status === "ANSWERED").length;

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-1">Prayer Request Management</h1>
      <p className="text-body-small mb-6">Review, track, and follow up on prayer requests</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <HandHeart size={16} className="text-purple" />
            <p className="text-[11px] text-gray-text">Total Requests</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{requests.length}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">New / Unreviewed</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">{newCount}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <HandHeart size={16} className="text-purple-vivid" />
            <p className="text-[11px] text-gray-text">Being Prayed For</p>
          </div>
          <p className="font-heading text-xl font-bold text-purple-vivid">{prayingCount}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-success" />
            <p className="text-[11px] text-gray-text">Answered</p>
          </div>
          <p className="font-heading text-xl font-bold text-success">{answeredCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-44">
          <Select id="status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </div>

      {/* Request Cards */}
      <div className="space-y-3">
        {filteredRequests.map((r) => (
          <div key={r.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-heading text-sm font-semibold text-slate">{r.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-heading font-semibold ${statusBadge[r.status]}`}>
                    {statusOptions.find((s) => s.value === r.status)?.label || r.status}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-text mb-1">{r.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-text">
                  <span>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <select
                  className="rounded-[4px] border border-gray-border bg-off-white px-2 py-1.5 text-[11px] font-heading font-semibold text-slate disabled:opacity-50"
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  disabled={updatingStatus === r.id}
                >
                  <option value="RECEIVED">New</option>
                  <option value="BEING_PRAYED_FOR">Praying</option>
                  <option value="ANSWERED">Answered</option>
                </select>
                <button className="inline-flex items-center gap-1 rounded-[4px] border border-gray-border bg-off-white px-3 py-1.5 text-[11px] font-heading font-semibold text-slate hover:bg-gray-border/30 transition-colors">
                  <Eye size={12} /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-body-small">{filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function AdminPrayerPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminPrayerContent />
    </ProtectedRoute>
  );
}
