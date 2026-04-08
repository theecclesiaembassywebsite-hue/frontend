"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, CreditCard, BookOpen } from "lucide-react";
import { training } from "@/lib/api";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Enrollment {
  id: string;
  program: string;
  name: string;
  email: string;
  phone: string;
  paymentStatus?: string;
  paymentRef?: string;
  additionalInfo?: { program?: string; programId?: string };
  createdAt: string;
}

export default function EnrollmentStatusPage({ params }: { params: { id: string } }) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const ref = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ref")
      : null;

    const load = async () => {
      try {
        const data = await training.getEnrollment(params.id);
        setEnrollment(data);

        // If ref is present in URL and payment is still pending, verify it
        if (ref && data.paymentStatus === "PENDING") {
          setVerifying(true);
          try {
            await training.verifyPayment(ref);
            const updated = await training.getEnrollment(params.id);
            setEnrollment(updated);
            success("Payment verified! Your enrolment is confirmed.");
          } catch {
            // silently ignore verify errors — status stays PENDING
          } finally {
            setVerifying(false);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  const handlePayNow = async () => {
    if (!enrollment) return;
    try {
      const additionalInfo = enrollment.additionalInfo as any;
      const programName = additionalInfo?.program || enrollment.program;
      // Re-initialize payment (amount stored in additionalInfo or ask user — we'll redirect to page)
      const payment = await training.initializePayment({
        enrollmentId: enrollment.id,
        amount: 0, // Will be set by backend from stored amount or needs re-entry
        email: enrollment.email,
        name: enrollment.name,
        program: programName,
      });
      window.location.href = payment.authorization_url +
        `?callback_url=${encodeURIComponent(
          `${window.location.origin}/training/kisolam/enrollment/${enrollment.id}?ref=${payment.reference}`
        )}`;
    } catch (err) {
      error("Could not initialize payment. Please go back and re-enrol.");
    }
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple border-t-transparent mx-auto mb-4" />
          <p className="font-body text-sm text-gray-text">
            {verifying ? "Verifying your payment…" : "Loading enrolment…"}
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
        <div className="rounded-[8px] border border-gray-border bg-white p-10 text-center max-w-md shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-error mb-4" />
          <h1 className="font-heading text-xl font-bold text-slate mb-2">Enrolment Not Found</h1>
          <p className="font-body text-sm text-gray-text mb-6">
            We could not find this enrolment. Please check the link or re-enrol.
          </p>
          <Link href="/training/kisolam">
            <Button variant="primary">Back to KISOLAM</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!enrollment) return null;

  const additionalInfo = enrollment.additionalInfo as any;
  const programName = additionalInfo?.program || enrollment.program;
  const isPaid = enrollment.paymentStatus === "SUCCESS";
  const isPending = !enrollment.paymentStatus || enrollment.paymentStatus === "PENDING";

  return (
    <div className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-[600px] px-4 py-10 sm:px-6">
        {/* Back */}
        <Link href="/training/kisolam" className="flex items-center gap-2 font-body text-sm text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={16} /> Back to KISOLAM
        </Link>

        {/* Status card */}
        <div className="rounded-[8px] border border-gray-border bg-white p-8 shadow-sm text-center mb-6">
          {isPaid ? (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-success mb-4" />
              <h1 className="font-heading text-2xl font-bold text-slate mb-1">Enrolment Confirmed!</h1>
              <p className="font-body text-sm text-gray-text">Your registration and payment have been received.</p>
            </>
          ) : (
            <>
              <Clock className="mx-auto h-14 w-14 text-warning mb-4" />
              <h1 className="font-heading text-2xl font-bold text-slate mb-1">Enrolment Pending Payment</h1>
              <p className="font-body text-sm text-gray-text">Complete your payment to confirm your spot.</p>
            </>
          )}
        </div>

        {/* Enrolment details */}
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-purple" />
            <h2 className="font-heading text-sm font-bold text-slate">Enrolment Details</h2>
          </div>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-gray-text">Programme</span>
              <span className="font-semibold text-slate">{programName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Name</span>
              <span className="text-slate">{enrollment.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Email</span>
              <span className="text-slate">{enrollment.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Phone</span>
              <span className="text-slate">{enrollment.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Date Applied</span>
              <span className="text-slate">{new Date(enrollment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-text">Payment Status</span>
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-heading font-bold ${isPaid ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {isPaid ? "Paid" : "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Enrolment ID</span>
              <span className="font-mono text-xs text-gray-text">{enrollment.id}</span>
            </div>
          </div>
        </div>

        {/* Pay Now (if pending) */}
        {isPending && enrollment.paymentRef && (
          <div className="rounded-[8px] border border-warning/30 bg-warning/5 p-5 mb-5">
            <p className="font-body text-sm text-slate mb-3">
              Your enrolment is reserved but your spot is not confirmed until payment is received.
            </p>
            <Button variant="giving" className="w-full flex items-center justify-center gap-2" onClick={handlePayNow}>
              <CreditCard size={16} /> Complete Payment
            </Button>
          </div>
        )}

        {isPaid && (
          <div className="rounded-[8px] border border-success/20 bg-success/5 p-5 text-center">
            <p className="font-body text-sm text-gray-text">
              A confirmation has been sent to <strong>{enrollment.email}</strong>. Our team will be in touch with next steps and session details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
