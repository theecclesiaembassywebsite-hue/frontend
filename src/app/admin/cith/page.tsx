"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cith } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "INACTIVE", label: "Inactive" },
];

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  PENDING: "bg-warning/10 text-warning",
  INACTIVE: "bg-gray-text/10 text-gray-text",
};

const statusIcon: Record<string, any> = {
  ACTIVE: CheckCircle,
  PENDING: Clock,
  INACTIVE: XCircle,
};

function AdminCITHContent() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingApp, setRejectingApp] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubsList, appsList] = await Promise.all([
          cith.getAdminHubs(),
          cith.getAdminApplications(),
        ]);
        setHubs(hubsList);
        setFilteredHubs(hubsList);
        setApplications(appsList);
      } catch (err) {
        error("Failed to load CITH data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  useEffect(() => {
    const filtered = hubs.filter((h) => {
      const matchesSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || (h.leader?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || h.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredHubs(filtered);
  }, [search, statusFilter, hubs]);

  const handleApproveApplication = async (appId: string) => {
    try {
      await cith.processApplication(appId, true);
      setApplications(applications.filter((a) => a.id !== appId));
      success("Application approved");
    } catch (err) {
      error("Failed to approve application");
      console.error(err);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    if (!rejectionReason.trim()) {
      error("Please provide a rejection reason");
      return;
    }

    try {
      await cith.processApplication(appId, false, rejectionReason);
      setApplications(applications.filter((a) => a.id !== appId));
      setShowRejectModal(false);
      setRejectingApp(null);
      setRejectionReason("");
      success("Application rejected");
    } catch (err) {
      error("Failed to reject application");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">CITH Hub Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const totalMembers = hubs.reduce((sum, h) => sum + (h.memberCount || 0), 0);

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-1">CITH Hub Management</h1>
      <p className="text-body-small mb-6">Church In The Home hub oversight and applications</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Total Hubs</p>
          <p className="font-heading text-xl font-bold text-slate">{hubs.length}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Active Hubs</p>
          <p className="font-heading text-xl font-bold text-success">{hubs.filter((h) => h.status === "ACTIVE").length}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Total Hub Members</p>
          <p className="font-heading text-xl font-bold text-purple">{totalMembers}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Pending Applications</p>
          <p className="font-heading text-xl font-bold text-warning">{applications.length}</p>
        </div>
      </div>

      {/* Hub List */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">All Hubs</h2>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search hubs or leaders..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-44">
          <Select id="status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Hub</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Leader</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Members</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Location</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredHubs.map((h) => {
              const StatusIcon = statusIcon[h.status] || MapPin;
              return (
                <tr key={h.id} className="hover:bg-off-white/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-purple/50" />
                      <span className="font-heading text-sm font-semibold text-slate">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-text">{h.leader?.name || h.leader || "Unassigned"}</td>
                  <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{h.memberCount || 0}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-text">{h.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[h.status]}`}>
                      <StatusIcon size={10} /> {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-heading font-semibold text-purple-vivid hover:underline">Manage</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending Applications */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Pending Hub Applications</h2>
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-heading text-sm font-semibold text-slate">{app.name}</span>
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-heading font-semibold text-warning">Pending</span>
                </div>
                <p className="font-body text-sm text-gray-text mb-1">
                  <MapPin size={12} className="inline mr-1" />{app.location} &middot; Applied {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p className="font-body text-sm text-slate">{app.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  className="text-[11px] py-1.5 px-3 min-w-0"
                  onClick={() => handleApproveApplication(app.id)}
                >
                  <CheckCircle size={12} className="mr-1" /> Approve
                </Button>
                <Button
                  variant="secondary"
                  className="text-[11px] py-1.5 px-3 min-w-0 border text-error border-error hover:bg-error/10"
                  onClick={() => { setRejectingApp(app.id); setShowRejectModal(true); }}
                >
                  <XCircle size={12} className="mr-1" /> Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal && rejectingApp !== null} onClose={() => { setShowRejectModal(false); setRejectingApp(null); setRejectionReason(""); }} title="Reject Application">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Rejection Reason</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Explain why this application is being rejected..."
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowRejectModal(false); setRejectingApp(null); setRejectionReason(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-error hover:bg-error-hover"
              onClick={() => rejectingApp && handleRejectApplication(rejectingApp)}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminCITHPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminCITHContent />
    </ProtectedRoute>
  );
}
