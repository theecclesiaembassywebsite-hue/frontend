"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, CreditCard, BookOpen, Copy } from "lucide-react";
import { training } from "@/lib/api";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// Mirrors GET /training/enrollment/:id, which is deliberately unauthenticated
// and therefore deliberately thin. The enrollment id reaches this page through
// a Paystack callback URL, so it lives in browser history and in any shared
// link — the endpoint no longer returns the registrant's email, phone,
// payment reference or free-form additionalInfo, and `name` arrives as a first
// name only. See TrainingService.getEnrollmentStatus.
interface Enrollment {
  id: string;
  program: string;
  courseName?: string | null;
  name: string;
  paymentStatus?: string;
  createdAt: string;
  // Present for a KISOLAM fee that has not been confirmed yet. KISOLAM is paid
  // by bank transfer, never through Paystack.
  bankTransfer?: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    amount: number;
    currency: string;
    reference: string;
  } | null;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="ml-2 inline-flex items-center gap-1 rounded-[4px] border border-gray-border px-2 py-0.5 font-body text-[11px] text-purple-vivid hover:bg-lavender"
    >
      <Copy size={11} /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function EnrollmentStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: enrollmentParamId } = use(params);
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
        const data = await training.getEnrollment(enrollmentParamId);
        setEnrollment(data);

        // If ref is present in URL and payment is still pending, verify it
        if (ref && data.paymentStatus === "PENDING") {
          setVerifying(true);
          try {
            await training.verifyPayment(ref);
            const updated = await training.getEnrollment(enrollmentParamId);
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
  }, [enrollmentParamId, success]);

  const handlePayNow = async () => {
    if (!enrollment) return;
    try {
      // Only the enrollment id is sent. The backend reads the payer's email,
      // name and programme from the enrollment row and bills the course's own
      // fee, so there is nothing here worth this page knowing — which is what
      // lets the status endpoint withhold it. A variable-fee course has no
      // stored price and answers with a message telling the user to re-enrol,
      // rather than the silent 0-naira charge this used to send.
      const payment = await training.initializePayment({
        enrollmentId: enrollment.id,
      });
      window.location.href = payment.authorization_url +
        `?callback_url=${encodeURIComponent(
          `${window.location.origin}/training/kisolam/enrollment/${enrollment.id}?ref=${payment.reference}`
        )}`;
    } catch (err) {
      // Surface the backend's reason when it gave one — "this enrolment has no
      // fixed fee" is actionable, "could not initialize" is not.
      error(
        err instanceof Error && err.message
          ? err.message
          : "Could not initialize payment. Please go back and re-enrol."
      );
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

  const programName = enrollment.courseName || enrollment.program;
  const isPaid = enrollment.paymentStatus === "SUCCESS";
  // A free KISOLAM course is stored with no payment status and gets no bank
  // details; a paid one is always PENDING (with bankTransfer) until it
  // settles. So "no status and nothing to pay" means there is no payment step.
  const isFree =
    enrollment.program === "KISOLAM" && !enrollment.paymentStatus && !enrollment.bankTransfer;
  const isConfirmed = isPaid || isFree;
  const isPending = !isFree && (!enrollment.paymentStatus || enrollment.paymentStatus === "PENDING");

  return (
    <div className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-[600px] px-4 py-10 sm:px-6">
        {/* Back */}
        <Link href="/training/kisolam" className="flex items-center gap-2 font-body text-sm text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={16} /> Back to KISOLAM
        </Link>

        {/* Status card */}
        <div className="rounded-[8px] border border-gray-border bg-white p-8 shadow-sm text-center mb-6">
          {isConfirmed ? (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-success mb-4" />
              <h1 className="font-heading text-2xl font-bold text-slate mb-1">Enrolment Confirmed!</h1>
              <p className="font-body text-sm text-gray-text">
                {isFree ? "Your registration has been received. No payment is required." : "Your registration and payment have been received."}
              </p>
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
            {/* First name only. Anyone with the link can open this page, so it
                shows just enough for the registrant to recognise their own
                enrolment without publishing their contact details to whoever
                the link reaches. */}
            <div className="flex justify-between">
              <span className="text-gray-text">Name</span>
              <span className="text-slate">{enrollment.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Date Applied</span>
              <span className="text-slate">{new Date(enrollment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-text">Payment Status</span>
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-heading font-bold ${isConfirmed ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {isPaid ? "Paid" : isFree ? "Free" : "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-text">Enrolment ID</span>
              <span className="font-mono text-xs text-gray-text">{enrollment.id}</span>
            </div>
          </div>
        </div>

        {/* KISOLAM: pay by bank transfer into the school's own account */}
        {!isPaid && enrollment.bankTransfer && (
          <div className="rounded-[8px] border border-warning/30 bg-warning/5 p-5 mb-5">
            <p className="font-heading text-sm font-bold text-slate mb-1">Pay by bank transfer</p>
            <p className="font-body text-sm text-slate mb-4">
              Your enrolment is reserved. Transfer the fee below to confirm your spot.
            </p>
            <dl className="space-y-3 font-body text-sm">
              <div>
                <dt className="text-gray-text">Account name</dt>
                <dd className="font-semibold text-slate">
                  {enrollment.bankTransfer.accountName}
                  <CopyButton value={enrollment.bankTransfer.accountName} label="account name" />
                </dd>
              </div>
              <div>
                <dt className="text-gray-text">Bank</dt>
                <dd className="font-semibold text-slate">{enrollment.bankTransfer.bankName}</dd>
              </div>
              <div>
                <dt className="text-gray-text">Account number</dt>
                <dd className="font-mono text-base font-bold text-slate">
                  {enrollment.bankTransfer.accountNumber}
                  <CopyButton value={enrollment.bankTransfer.accountNumber} label="account number" />
                </dd>
              </div>
              <div>
                <dt className="text-gray-text">Amount</dt>
                <dd className="font-semibold text-slate">
                  {enrollment.bankTransfer.currency}
                  {enrollment.bankTransfer.amount.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-text">Use this as your transfer narration / description</dt>
                <dd className="font-mono text-base font-bold text-slate">
                  {enrollment.bankTransfer.reference}
                  <CopyButton value={enrollment.bankTransfer.reference} label="reference" />
                </dd>
              </div>
            </dl>
            <p className="mt-4 font-body text-xs text-gray-text">
              Your status changes to Paid once our team sees the transfer. Questions? WhatsApp (only)
              09167641473 or email kisolam@theecclesiaembassy.org.
            </p>
          </div>
        )}

        {/* Pay Now (if pending) - programmes still on Paystack */}
        {isPending && !enrollment.bankTransfer && enrollment.program !== "KISOLAM" && (
          <div className="rounded-[8px] border border-warning/30 bg-warning/5 p-5 mb-5">
            <p className="font-body text-sm text-slate mb-3">
              Your enrolment is reserved but your spot is not confirmed until payment is received.
            </p>
            <Button variant="giving" className="w-full flex items-center justify-center gap-2" onClick={handlePayNow}>
              <CreditCard size={16} /> Complete Payment
            </Button>
          </div>
        )}

        {isConfirmed && (
          <div className="rounded-[8px] border border-success/20 bg-success/5 p-5 text-center">
            <p className="font-body text-sm text-gray-text">
              A confirmation has been sent to the email address you enrolled with. Our team will be in touch with next steps and session details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
