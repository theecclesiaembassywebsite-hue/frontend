"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testimonies } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

function submitterName(t: any): string {
  const profile = t.user?.profile;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return name || t.user?.email || "Unknown";
}

function ShareNameBadge({ shareName }: { shareName: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-heading font-semibold ${
        shareName
          ? "bg-purple-light text-purple-vivid"
          : "bg-gray-100 text-gray-text"
      }`}
    >
      {shareName ? "Wants to be named" : "Wants to stay anonymous"}
    </span>
  );
}

function AdminTestimoniesContent() {
  const [pendingTestimonies, setPendingTestimonies] = useState<any[]>([]);
  const [approvedTestimonies, setApprovedTestimonies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ testimonyId: string; action: "approve" | "reject" } | null>(null);
  const [visibilityPending, setVisibilityPending] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const [pending, approved] = await Promise.all([
          testimonies.getPendingTestimonies(),
          testimonies.getApprovedTestimonies(),
        ]);
        setPendingTestimonies(pending);
        setApprovedTestimonies(approved);
      } catch (err) {
        error("Failed to load testimonies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonies();
  }, [error]);

  const handleApprove = async (testimonyId: string) => {
    try {
      const updated = await testimonies.updateTestimonyStatus(testimonyId, "APPROVED");
      setPendingTestimonies((prev) => {
        const testimony = prev.find((t) => t.id === testimonyId);
        if (testimony) setApprovedTestimonies((approved) => [{ ...testimony, ...updated }, ...approved]);
        return prev.filter((t) => t.id !== testimonyId);
      });
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Testimony approved. Publish it below when you're ready to share it.");
    } catch (err) {
      error("Failed to approve testimony");
      console.error(err);
    }
  };

  const handleReject = async (testimonyId: string) => {
    try {
      await testimonies.updateTestimonyStatus(testimonyId, "REJECTED");
      setPendingTestimonies((prev) => prev.filter((t) => t.id !== testimonyId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Testimony rejected");
    } catch (err) {
      error("Failed to reject testimony");
      console.error(err);
    }
  };

  const handleToggleVisibility = async (testimonyId: string, nextIsPublic: boolean) => {
    setVisibilityPending(testimonyId);
    try {
      await testimonies.setTestimonyVisibility(testimonyId, nextIsPublic);
      setApprovedTestimonies((prev) =>
        prev.map((t) => (t.id === testimonyId ? { ...t, isPublic: nextIsPublic } : t))
      );
      success(nextIsPublic ? "Testimony published" : "Testimony hidden from the public feed");
    } catch (err) {
      error("Failed to update visibility");
      console.error(err);
    } finally {
      setVisibilityPending(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Testimony Moderation</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-1">Testimony Moderation</h1>
      <p className="text-body-small mb-6">Review pending testimonies, then choose which approved ones go public</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Pending Testimonies</p>
          <p className="font-heading text-xl font-bold text-warning">{pendingTestimonies.length}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Approved, Published</p>
          <p className="font-heading text-xl font-bold text-success">
            {approvedTestimonies.filter((t) => t.isPublic).length}
          </p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Approved, Hidden</p>
          <p className="font-heading text-xl font-bold text-slate">
            {approvedTestimonies.filter((t) => !t.isPublic).length}
          </p>
        </div>
      </div>

      {/* Pending Review */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Pending Review</h2>
      {pendingTestimonies.length === 0 ? (
        <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center mb-8">
          <p className="font-body text-sm text-gray-text">No pending testimonies to review</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {pendingTestimonies.map((t) => (
            <div key={t.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading text-sm font-semibold text-slate">{t.title}</h3>
                    <ShareNameBadge shareName={t.shareName} />
                  </div>
                  <p className="font-body text-sm text-gray-text mb-2">{t.content}</p>
                  {t.photoUrl && (
                    <div className="mb-2">
                      <a href={t.photoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline">
                        View Photo
                      </a>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-text">
                    Submitted by {submitterName(t)} on {new Date(t.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    className="text-[11px] py-1.5 px-3 min-w-0"
                    onClick={() => { setConfirmAction({ testimonyId: t.id, action: "approve" }); setShowConfirmModal(true); }}
                  >
                    <CheckCircle size={12} className="mr-1" /> Approve
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-[11px] py-1.5 px-3 min-w-0 border text-error border-error hover:bg-error/10"
                    onClick={() => { setConfirmAction({ testimonyId: t.id, action: "reject" }); setShowConfirmModal(true); }}
                  >
                    <XCircle size={12} className="mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved — manage publish visibility */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Approved — Manage Visibility</h2>
      {approvedTestimonies.length === 0 ? (
        <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
          <p className="font-body text-sm text-gray-text">No approved testimonies yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvedTestimonies.map((t) => (
            <div key={t.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading text-sm font-semibold text-slate">{t.title}</h3>
                    <ShareNameBadge shareName={t.shareName} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-heading font-semibold ${
                        t.isPublic ? "bg-success/10 text-success" : "bg-gray-100 text-gray-text"
                      }`}
                    >
                      {t.isPublic ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="font-body text-sm text-gray-text mb-2">{t.content}</p>
                  <p className="text-[10px] text-gray-text">
                    Submitted by {submitterName(t)} on {new Date(t.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.isPublic ? (
                    <Button
                      variant="secondary"
                      className="text-[11px] py-1.5 px-3 min-w-0"
                      disabled={visibilityPending === t.id}
                      onClick={() => handleToggleVisibility(t.id, false)}
                    >
                      <EyeOff size={12} className="mr-1" /> Hide
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="text-[11px] py-1.5 px-3 min-w-0"
                      disabled={visibilityPending === t.id}
                      onClick={() => handleToggleVisibility(t.id, true)}
                    >
                      <Eye size={12} className="mr-1" /> Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal && confirmAction !== null} onClose={() => { setShowConfirmModal(false); setConfirmAction(null); }} title="Confirm Action">
        <div className="space-y-4">
          <p className="font-body text-sm text-gray-text">
            Are you sure you want to {confirmAction?.action === "approve" ? "approve" : "reject"} this testimony?
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowConfirmModal(false); setConfirmAction(null); }}>Cancel</Button>
            <Button
              variant="primary"
              className={`flex-1 ${confirmAction?.action === "reject" ? "bg-error hover:bg-error-hover" : ""}`}
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.action === "approve") {
                    handleApprove(confirmAction.testimonyId);
                  } else {
                    handleReject(confirmAction.testimonyId);
                  }
                }
              }}
            >
              {confirmAction?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminTestimoniesPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"]}>
      <AdminTestimoniesContent />
    </ProtectedRoute>
  );
}
