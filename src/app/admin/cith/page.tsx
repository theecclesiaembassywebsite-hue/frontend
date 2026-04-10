"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, MapPin, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingHub, setManagingHub] = useState<any>(null);
  const [savingLeader, setSavingLeader] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [hubFormData, setHubFormData] = useState({
    name: "",
    leaderId: "",
    area: "",
    city: "",
    state: "",
    country: "Nigeria",
    meetingDay: "",
    meetingTime: "",
    capacity: "",
  });
  // Leader search state for Create Modal
  const [leaderSearch, setLeaderSearch] = useState("");
  const [leaderResults, setLeaderResults] = useState<any[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  // Leader search state for Manage Modal
  const [reassignSearch, setReassignSearch] = useState("");
  const [reassignResults, setReassignResults] = useState<any[]>([]);
  const [selectedReassignLeader, setSelectedReassignLeader] = useState<any | null>(null);
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  // Manage Modal editing state
  const [editingHub, setEditingHub] = useState(false);
  const [hubEditData, setHubEditData] = useState<any>(null);
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
      const leaderName = [h.leader?.profile?.firstName, h.leader?.profile?.lastName].filter(Boolean).join(' ');
      const matchesSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || leaderName.toLowerCase().includes(search.toLowerCase());
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

  // Search leaders for Create Modal
  const handleLeaderSearch = async (query: string) => {
    setLeaderSearch(query);
    if (!query.trim()) {
      setLeaderResults([]);
      return;
    }
    try {
      const results = await cith.searchMembers(query);
      setLeaderResults(results);
    } catch (err) {
      console.error("Failed to search members:", err);
    }
  };

  // Search leaders for Manage Modal
  const handleReassignSearch = async (query: string) => {
    setReassignSearch(query);
    if (!query.trim()) {
      setReassignResults([]);
      return;
    }
    try {
      const results = await cith.searchMembers(query);
      setReassignResults(results);
    } catch (err) {
      console.error("Failed to search members:", err);
    }
  };

  const handleCreateHub = async () => {
    if (!hubFormData.name || !hubFormData.area || !hubFormData.city || !hubFormData.state) {
      error("Please fill in hub name, area, city, and state");
      return;
    }
    try {
      setCreating(true);
      const payload = {
        name: hubFormData.name,
        ...(selectedLeader ? { leaderId: selectedLeader.id } : {}),
        area: hubFormData.area,
        city: hubFormData.city,
        state: hubFormData.state,
        country: hubFormData.country,
        meetingDay: hubFormData.meetingDay || "Wednesday",
        meetingTime: hubFormData.meetingTime || "6:00 PM",
        capacity: hubFormData.capacity ? Number(hubFormData.capacity) : undefined,
      };
      const newHub = await cith.createHub(payload as any);
      setHubs([newHub, ...hubs]);
      success("Hub created successfully");
      setShowCreateModal(false);
      setHubFormData({
        name: "",
        leaderId: "",
        area: "",
        city: "",
        state: "",
        country: "Nigeria",
        meetingDay: "",
        meetingTime: "",
        capacity: "",
      });
      setLeaderSearch("");
      setSelectedLeader(null);
      setLeaderResults([]);
    } catch (err) {
      error("Failed to create hub");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateHub = async () => {
    if (!hubEditData || !managingHub) return;
    if (!hubEditData.name || !hubEditData.area || !hubEditData.city || !hubEditData.state) {
      error("Please fill in hub name, area, city, and state");
      return;
    }
    try {
      setSavingChanges(true);
      const payload = {
        name: hubEditData.name,
        area: hubEditData.area,
        city: hubEditData.city,
        state: hubEditData.state,
        country: hubEditData.country,
        meetingDay: hubEditData.meetingDay,
        meetingTime: hubEditData.meetingTime,
        capacity: hubEditData.capacity ? Number(hubEditData.capacity) : undefined,
      };
      await cith.updateHub(managingHub.id, payload);
      const hubsList = await cith.getAdminHubs();
      setHubs(hubsList);
      setManagingHub(hubsList.find((h: any) => h.id === managingHub.id) || null);
      success("Hub updated successfully");
      setEditingHub(false);
    } catch (err) {
      error("Failed to update hub");
      console.error(err);
    } finally {
      setSavingChanges(false);
    }
  };

  const handleUpdateHubStatus = async (newStatus: string) => {
    if (!managingHub) return;
    try {
      await cith.updateHub(managingHub.id, { status: newStatus });
      const hubsList = await cith.getAdminHubs();
      setHubs(hubsList);
      setManagingHub(hubsList.find((h: any) => h.id === managingHub.id) || null);
      success("Hub status updated successfully");
    } catch (err) {
      error("Failed to update hub status");
      console.error(err);
    }
  };

  const handleReassignLeader = async () => {
    if (!managingHub || !selectedReassignLeader) return;
    try {
      setSavingLeader(true);
      await cith.reassignLeader(managingHub.id, selectedReassignLeader.id);
      const hubsList = await cith.getAdminHubs();
      setHubs(hubsList);
      setManagingHub(hubsList.find((h: any) => h.id === managingHub.id) || null);
      success("Hub leader reassigned successfully");
      setReassignSearch("");
      setSelectedReassignLeader(null);
      setReassignResults([]);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to reassign leader");
      console.error(err);
    } finally {
      setSavingLeader(false);
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

  const totalMembers = hubs.reduce((sum, h) => sum + (h._count?.members || 0), 0);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl font-bold text-slate">CITH Hub Management</h1>
        <Button variant="primary" className="text-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-1" /> Create Hub
        </Button>
      </div>
      <p className="text-body-small mb-6">Church In The House hub oversight and applications</p>

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
                  <td className="px-4 py-3 font-body text-sm text-gray-text">{h.leader ? [h.leader.profile?.firstName, h.leader.profile?.lastName].filter(Boolean).join(' ') : "Unassigned"}</td>
                  <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{h._count?.members || 0}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-text">{[h.area, h.city].filter(Boolean).join(', ')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[h.status]}`}>
                      <StatusIcon size={10} /> {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-heading font-semibold text-purple-vivid hover:underline"
                      onClick={() => { setManagingHub(h); setReassignSearch(""); setReassignResults([]); setSelectedReassignLeader(null); setEditingHub(false); setHubEditData(null); setShowManageModal(true); }}
                    >
                      Manage
                    </button>
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
                  <span className="font-heading text-sm font-semibold text-slate">{[app.applicant?.profile?.firstName, app.applicant?.profile?.lastName].filter(Boolean).join(' ') || app.applicant?.email || "Unknown"}</span>
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-heading font-semibold text-warning">Pending</span>
                </div>
                <p className="font-body text-sm text-gray-text mb-1">
                  <MapPin size={12} className="inline mr-1" />{app.hub?.name || "Unknown Hub"} &middot; Applied {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p className="font-body text-sm text-slate">{app.applicant?.email}</p>
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

      {/* Manage Hub Modal */}
      <Modal isOpen={showManageModal && managingHub !== null} onClose={() => { setShowManageModal(false); setManagingHub(null); setEditingHub(false); setHubEditData(null); setReassignSearch(""); setSelectedReassignLeader(null); setReassignResults([]); }} title={`Manage: ${managingHub?.name || "Hub"}`}>
        <div className="space-y-4">
          {!editingHub ? (
            <>
              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-2">Status</label>
                <div className="flex gap-2">
                  {["ACTIVE", "PENDING", "INACTIVE"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateHubStatus(status)}
                      className={`flex-1 px-3 py-2 rounded-[4px] text-sm font-heading font-semibold transition-colors ${
                        managingHub?.status === status
                          ? statusBadge[status]
                          : "bg-gray-border/50 text-gray-text hover:bg-gray-border"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read-only Hub Info */}
              <div className="rounded-[4px] bg-off-white p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Hub Name</span>
                  <span className="text-slate font-body">{managingHub?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Location</span>
                  <span className="text-slate font-body">{[managingHub?.area, managingHub?.city, managingHub?.state, managingHub?.country].filter(Boolean).join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Meeting</span>
                  <span className="text-slate font-body">{managingHub?.meetingDay} at {managingHub?.meetingTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Capacity</span>
                  <span className="text-slate font-body">{managingHub?.capacity || "No limit"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Members</span>
                  <span className="text-slate font-body">{managingHub?._count?.members || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text font-heading">Current Leader</span>
                  <span className="text-slate font-body">{managingHub?.leader ? [managingHub.leader.profile?.firstName, managingHub.leader.profile?.lastName].filter(Boolean).join(' ') : "Unassigned"}</span>
                </div>
              </div>

              {/* Reassign Leader Section */}
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">Reassign Leader</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    placeholder="Search members by name or email..."
                    value={selectedReassignLeader ? `${selectedReassignLeader.profile?.firstName || ''} ${selectedReassignLeader.profile?.lastName || ''} (${selectedReassignLeader.email})` : reassignSearch}
                    onChange={(e) => handleReassignSearch(e.target.value)}
                    onFocus={() => setShowReassignDropdown(true)}
                  />
                  {showReassignDropdown && reassignResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-border rounded-[4px] shadow-lg z-10">
                      {reassignResults.map((member: any) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setSelectedReassignLeader(member);
                            setReassignSearch("");
                            setShowReassignDropdown(false);
                            setReassignResults([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-off-white border-b border-gray-border last:border-b-0 transition-colors"
                        >
                          <div className="text-sm font-semibold text-slate">{member.profile?.firstName} {member.profile?.lastName}</div>
                          <div className="text-xs text-gray-text">{member.email} • {member.role}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedReassignLeader && (
                  <button
                    onClick={() => {
                      setSelectedReassignLeader(null);
                      setReassignSearch("");
                    }}
                    className="mt-2 text-xs text-error hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowManageModal(false);
                    setManagingHub(null);
                    setEditingHub(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditingHub(true);
                    setHubEditData({
                      name: managingHub?.name,
                      area: managingHub?.area,
                      city: managingHub?.city,
                      state: managingHub?.state,
                      country: managingHub?.country,
                      meetingDay: managingHub?.meetingDay,
                      meetingTime: managingHub?.meetingTime,
                      capacity: managingHub?.capacity || "",
                    });
                  }}
                >
                  Edit Hub
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={savingLeader || !selectedReassignLeader}
                  onClick={handleReassignLeader}
                >
                  {savingLeader ? "Saving..." : "Update Leader"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">Hub Name</label>
                <input
                  type="text"
                  className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                  value={hubEditData?.name || ""}
                  onChange={(e) => setHubEditData({ ...hubEditData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">Area</label>
                <input
                  type="text"
                  className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                  value={hubEditData?.area || ""}
                  onChange={(e) => setHubEditData({ ...hubEditData, area: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">City</label>
                  <input
                    type="text"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    value={hubEditData?.city || ""}
                    onChange={(e) => setHubEditData({ ...hubEditData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">State</label>
                  <input
                    type="text"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    value={hubEditData?.state || ""}
                    onChange={(e) => setHubEditData({ ...hubEditData, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">Country</label>
                <input
                  type="text"
                  className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                  value={hubEditData?.country || ""}
                  onChange={(e) => setHubEditData({ ...hubEditData, country: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">Meeting Day</label>
                  <select
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    value={hubEditData?.meetingDay || ""}
                    onChange={(e) => setHubEditData({ ...hubEditData, meetingDay: e.target.value })}
                  >
                    <option value="">Select day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">Meeting Time</label>
                  <input
                    type="text"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    placeholder="e.g. 6:00 PM"
                    value={hubEditData?.meetingTime || ""}
                    onChange={(e) => setHubEditData({ ...hubEditData, meetingTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-heading font-semibold text-slate mb-1">Capacity <span className="text-gray-text font-normal">(optional)</span></label>
                <input
                  type="number"
                  className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                  placeholder="Max members"
                  value={hubEditData?.capacity || ""}
                  onChange={(e) => setHubEditData({ ...hubEditData, capacity: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditingHub(false);
                    setHubEditData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={savingChanges}
                  onClick={handleUpdateHub}
                >
                  {savingChanges ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create Hub Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setHubFormData({ name: "", leaderId: "", area: "", city: "", state: "", country: "Nigeria", meetingDay: "", meetingTime: "", capacity: "" }); setLeaderSearch(""); setSelectedLeader(null); setLeaderResults([]); }} title="Create Hub">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Hub Name</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Hub name"
              value={hubFormData.name}
              onChange={(e) => setHubFormData({ ...hubFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Leader <span className="text-gray-text font-normal">(optional)</span></label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Search members by name or email..."
                value={selectedLeader ? `${selectedLeader.profile?.firstName || ''} ${selectedLeader.profile?.lastName || ''} (${selectedLeader.email})` : leaderSearch}
                onChange={(e) => handleLeaderSearch(e.target.value)}
                onFocus={() => setShowLeaderDropdown(true)}
              />
              {showLeaderDropdown && leaderResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-border rounded-[4px] shadow-lg z-10">
                  {leaderResults.map((member: any) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedLeader(member);
                        setLeaderSearch("");
                        setShowLeaderDropdown(false);
                        setLeaderResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-off-white border-b border-gray-border last:border-b-0 transition-colors"
                    >
                      <div className="text-sm font-semibold text-slate">{member.profile?.firstName} {member.profile?.lastName}</div>
                      <div className="text-xs text-gray-text">{member.email} • {member.role}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedLeader && (
              <button
                onClick={() => {
                  setSelectedLeader(null);
                  setLeaderSearch("");
                }}
                className="mt-2 text-xs text-error hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Area</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Area"
              value={hubFormData.area}
              onChange={(e) => setHubFormData({ ...hubFormData, area: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">City</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="City"
                value={hubFormData.city}
                onChange={(e) => setHubFormData({ ...hubFormData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">State</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="State"
                value={hubFormData.state}
                onChange={(e) => setHubFormData({ ...hubFormData, state: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Country</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Country"
              value={hubFormData.country}
              onChange={(e) => setHubFormData({ ...hubFormData, country: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Meeting Day</label>
              <select
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                value={hubFormData.meetingDay}
                onChange={(e) => setHubFormData({ ...hubFormData, meetingDay: e.target.value })}
              >
                <option value="">Select day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Meeting Time</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="e.g. 6:00 PM"
                value={hubFormData.meetingTime}
                onChange={(e) => setHubFormData({ ...hubFormData, meetingTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Capacity <span className="text-gray-text font-normal">(optional)</span></label>
            <input
              type="number"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Max members"
              value={hubFormData.capacity}
              onChange={(e) => setHubFormData({ ...hubFormData, capacity: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowCreateModal(false); setHubFormData({ name: "", leaderId: "", area: "", city: "", state: "", country: "Nigeria", meetingDay: "", meetingTime: "", capacity: "" }); setLeaderSearch(""); setSelectedLeader(null); setLeaderResults([]); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateHub}
              disabled={creating || !hubFormData.name}
            >
              {creating ? "Creating..." : "Create Hub"}
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
