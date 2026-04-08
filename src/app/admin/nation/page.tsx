"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { Search, Flag, EyeOff, Trash2, AlertTriangle, MessageCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { nation } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const filterOptions = [
  { value: "", label: "All Flags" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Inappropriate" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "MISINFORMATION", label: "Misinformation" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending Review" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ACTIONED", label: "Action Taken" },
];

const reasonBadge: Record<string, string> = {
  SPAM: "bg-warning/10 text-warning",
  INAPPROPRIATE: "bg-error/10 text-error",
  HARASSMENT: "bg-error/10 text-error",
  MISINFORMATION: "bg-info/10 text-info",
};

function AdminNationContent() {
  const [flaggedPosts, setFlaggedPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ postId: string; action: "hide" | "delete" } | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await nation.getFlaggedPosts();
        setFlaggedPosts(posts);
        setFilteredPosts(posts);
      } catch (err) {
        error("Failed to load flagged posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [error]);

  useEffect(() => {
    const filtered = flaggedPosts.filter((c) => {
      const matchesSearch = !search || c.content.toLowerCase().includes(search.toLowerCase());
      const derivedStatus = c.hidden ? "ACTIONED" : "PENDING";
      const matchesStatus = !statusFilter || derivedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredPosts(filtered);
  }, [search, statusFilter, flaggedPosts]);

  const handleHidePost = async (postId: string) => {
    try {
      await nation.hidePost(postId);
      setFlaggedPosts(flaggedPosts.filter((p) => p.id !== postId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Post hidden successfully");
    } catch (err) {
      error("Failed to hide post");
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await nation.deletePost(postId);
      setFlaggedPosts(flaggedPosts.filter((p) => p.id !== postId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Post deleted successfully");
    } catch (err) {
      error("Failed to delete post");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Ecclesia Nation Moderation</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const pendingCount = flaggedPosts.filter((p) => !p.hidden).length;
  const totalFlags = flaggedPosts.length;

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-1">Ecclesia Nation Moderation</h1>
      <p className="text-body-small mb-6">Review flagged content, manage suspensions, and maintain community standards</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Flag size={16} className="text-warning" />
            <p className="text-[11px] text-gray-text">Pending Review</p>
          </div>
          <p className="font-heading text-xl font-bold text-warning">{pendingCount}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-error" />
            <p className="text-[11px] text-gray-text">Total Flags</p>
          </div>
          <p className="font-heading text-xl font-bold text-error">{totalFlags}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">Content Type</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">Posts</p>
        </div>
      </div>

      {/* Flagged Content Queue */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Flagged Content Queue</h2>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search by content..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-40">
          <Select id="status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {filteredPosts.map((item) => (
          <div key={item.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-heading text-sm font-semibold text-slate">
                    Post by {item.author?.profile?.firstName ? `${item.author.profile.firstName} ${item.author.profile.lastName || ""}`.trim() : item.author?.email || "Unknown"}
                  </span>
                  {item.hidden && (
                    <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-heading font-semibold text-error">Hidden</span>
                  )}
                </div>
                <p className="font-body text-sm text-gray-text mb-1">{item.content.substring(0, 150)}...</p>
                <p className="text-[10px] text-gray-text">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="inline-flex items-center gap-1 rounded-[4px] border border-gray-border bg-off-white px-3 py-1.5 text-[11px] font-heading font-semibold text-slate hover:bg-gray-border/30 transition-colors"
                  onClick={() => { setConfirmAction({ postId: item.id, action: "hide" }); setShowConfirmModal(true); }}
                >
                  <EyeOff size={12} /> Hide
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-[4px] border border-error/30 bg-error/5 px-3 py-1.5 text-[11px] font-heading font-semibold text-error hover:bg-error/10 transition-colors"
                  onClick={() => { setConfirmAction({ postId: item.id, action: "delete" }); setShowConfirmModal(true); }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal && confirmAction !== null} onClose={() => { setShowConfirmModal(false); setConfirmAction(null); }} title="Confirm Action">
        <div className="space-y-4">
          <p className="font-body text-sm text-gray-text">
            Are you sure you want to {confirmAction?.action === "delete" ? "delete" : "hide"} this post? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowConfirmModal(false); setConfirmAction(null); }}>Cancel</Button>
            <Button
              variant="primary"
              className={`flex-1 ${confirmAction?.action === "delete" ? "bg-error hover:bg-error-hover" : ""}`}
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.action === "delete") {
                    handleDeletePost(confirmAction.postId);
                  } else {
                    handleHidePost(confirmAction.postId);
                  }
                }
              }}
            >
              {confirmAction?.action === "delete" ? "Delete Post" : "Hide Post"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminNationPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminNationContent />
    </ProtectedRoute>
  );
}
