"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testimonies } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

function AdminTestimoniesContent() {
  const [pendingTestimonies, setPendingTestimonies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ testimonyId: string; action: "approve" | "reject" } | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const data = await testimonies.getPendingTestimonies();
        setPendingTestimonies(data);
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
      await testimonies.updateTestimonyStatus(testimonyId, "APPROVED");
      setPendingTestimonies(pendingTestimonies.filter((t) => t.id !== testimonyId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Testimony approved");
    } catch (err) {
      error("Failed to approve testimony");
      console.error(err);
    }
  };

  const handleReject = async (testimonyId: string) => {
    try {
      await testimonies.updateTestimonyStatus(testimonyId, "REJECTED");
      setPendingTestimonies(pendingTestimonies.filter((t) => t.id !== testimonyId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      success("Testimony rejected");
    } catch (err) {
      error("Failed to reject testimony");
      console.error(err);
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
      <p className="text-body-small mb-6">Review and approve pending testimonies</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Pending Testimonies</p>
          <p className="font-heading text-xl font-bold text-warning">{pendingTestimonies.length}</p>
        </div>
      </div>

      {/* Testimonies List */}
      {pendingTestimonies.length === 0 ? (
        <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
          <p className="font-body text-sm text-gray-text">No pending testimonies to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTestimonies.map((t) => (
            <div key={t.id} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-slate mb-1">{t.title}</h3>
                  <p className="font-body text-sm text-gray-text mb-2">{t.content}</p>
                  {t.photoUrl && (
                    <div className="mb-2">
                      <a href={t.photoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline">
                        View Photo
                      </a>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-text">
                    Submitted on {new Date(t.createdAt || Date.now()).toLocaleDateString()}
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
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminTestimoniesContent />
    </ProtectedRoute>
  );
}
