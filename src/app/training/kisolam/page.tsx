"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { BookOpen, User, Calendar, ArrowRight, BadgeCheck } from "lucide-react";
import { training } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type Program = {
  id: string;
  name: string;
  shortName?: string;
  duration: string;
  desc: string;
  feeType: "paid" | "variable";
  fee?: number;         // in Naira, only for "paid"
  feeCurrency?: string;
};

const programs: Program[] = [
  {
    id: "DTD",
    name: "Discipleship Training Deluge",
    shortName: "DTD",
    duration: "3 months",
    desc: "An intensive discipleship programme designed to ground believers in the foundations of faith, Kingdom identity, and missional living.",
    feeType: "paid",
    fee: 20000,
    feeCurrency: "₦",
  },
  {
    id: "SENATE",
    name: "Senate of Ambassadorial Army",
    duration: "6 months",
    desc: "Advanced training for those called to ambassadorial ministry—equipping Kingdom ambassadors with strategic, apostolic, and prophetic depth.",
    feeType: "paid",
    fee: 25000,
    feeCurrency: "₦",
  },
  {
    id: "SMIT",
    name: "Six Months Intensive Training",
    shortName: "SMIT",
    duration: "6 months",
    desc: "A comprehensive, immersive curriculum covering doctrine, church planting, leadership, and practical ministry across six months of full engagement.",
    feeType: "paid",
    fee: 30000,
    feeCurrency: "₦",
  },
  {
    id: "SPOUDAZO",
    name: "Summer Spoudazo",
    duration: "4–6 weeks",
    desc: "A seasonal intensive held in the summer months. Open to all ages. Programme fee varies per session—contact us for current pricing.",
    feeType: "variable",
    feeCurrency: "₦",
  },
  {
    id: "WORKSHOP",
    name: "Special Workshop Programme",
    duration: "1–3 days",
    desc: "Topic-specific workshops run throughout the year. Some are free; others carry a registration fee. Check current schedule for details.",
    feeType: "variable",
    feeCurrency: "₦",
  },
];

const formatFee = (p: Program) => {
  if (p.feeType === "variable") return "Variable";
  return `${p.feeCurrency || "₦"}${(p.fee || 0).toLocaleString()}`;
};

export default function KISOLAMPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { success, error } = useToast();

  function openEnroll(program: Program) {
    setSelectedProgram(program);
    setFormData({ name: "", email: "", phone: "" });
    setCustomAmount("");
    setStep("form");
    setShowModal(true);
  }

  async function handleEnrollAndPay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProgram) return;

    const amount = selectedProgram.feeType === "paid"
      ? selectedProgram.fee!
      : Number(customAmount);

    if (selectedProgram.feeType === "variable" && customAmount === "") {
      error("Please enter the programme fee (enter 0 for free programmes).");
      return;
    }

    if (selectedProgram.feeType === "variable" && amount < 0) {
      error("Amount cannot be negative.");
      return;
    }

    setStep("processing");
    try {
      // Step 1: Create enrollment record
      const enrollment = await training.enrollTraining("KISOLAM", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        additionalInfo: {
          program: selectedProgram.name,
          programId: selectedProgram.id,
        },
      });

      if (amount === 0) {
        // Free programme — just confirm
        success("Registration successful! Check your email for details.");
        setShowModal(false);
        window.location.href = `/training/kisolam/enrollment/${enrollment.id}`;
        return;
      }

      // Step 2: Initialize payment
      const payment = await training.initializePayment({
        enrollmentId: enrollment.id,
        amount,
        email: formData.email,
        name: formData.name,
        program: selectedProgram.name,
      });

      // Step 3: Redirect to Paystack
      window.location.href = payment.authorization_url +
        `?callback_url=${encodeURIComponent(
          `${window.location.origin}/training/kisolam/enrollment/${enrollment.id}?ref=${payment.reference}`
        )}`;
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to process. Please try again.");
      setStep("form");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple-vivid" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <BookOpen className="mx-auto h-12 w-12 text-white/80 mb-3" />
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">KISOLAM</h1>
          <h6 className="mt-2 font-serif text-lg font-light text-off-white">
            Kingdom International School of Life and Ministry
          </h6>
          <p className="mt-4 font-body text-sm text-white/60 max-w-xl mx-auto">
            Equipping Kingdom citizens for life, leadership, and ministry through structured training and apostolic impartation.
          </p>
        </div>
      </section>

      {/* Programs */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">Programmes Offered</h2>
          <p className="mt-2 font-body text-sm text-gray-text">More programmes coming soon.</p>
        </div>
        <div className="mx-auto max-w-3xl space-y-5">
          {programs.map((p) => (
            <div key={p.id} className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-heading text-base font-bold text-slate">{p.name}</h3>
                  {p.shortName && (
                    <span className="rounded-full bg-purple-light px-2 py-0.5 text-[10px] font-heading font-bold text-purple">{p.shortName}</span>
                  )}
                </div>
                <p className="font-body text-sm text-gray-text">{p.desc}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-heading font-semibold">
                  <span className="text-gray-text">Duration: {p.duration}</span>
                  <span className={p.feeType === "variable" ? "text-warning" : "text-purple"}>
                    Fee: {formatFee(p)}
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                className="text-sm shrink-0 flex items-center gap-1"
                onClick={() => openEnroll(p)}
              >
                Enroll <ArrowRight size={14} />
              </Button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Faculty */}
      <SectionWrapper variant="off-white">
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl font-bold text-slate">Faculty</h2>
        </div>
        <div className="flex justify-center gap-6">
          {["Lead Faculty", "Associate Faculty", "Guest Faculty"].map((name) => (
            <div key={name} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-light mb-2">
                <User className="h-7 w-7 text-purple/40" />
              </div>
              <p className="font-heading text-xs font-semibold text-slate">{name}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Academic Calendar */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-md text-center">
          <Calendar className="mx-auto h-8 w-8 text-purple mb-3" />
          <h2 className="font-heading text-xl font-bold text-slate mb-4">Academic Calendar</h2>
          <div className="space-y-2 text-sm font-body text-gray-text">
            <p>Session 1: January — June 2026</p>
            <p>Session 2: July — December 2026</p>
            <p>Application deadline: Two weeks before session start</p>
          </div>
        </div>
      </SectionWrapper>

      {/* Enrollment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { if (step !== "processing") setShowModal(false); }}
        title={`Enrol — ${selectedProgram?.name || ""}`}
      >
        {step === "processing" ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple border-t-transparent" />
            <p className="font-body text-sm text-gray-text">Processing your enrolment…</p>
          </div>
        ) : (
          <form onSubmit={handleEnrollAndPay} className="space-y-4">
            {/* Programme summary */}
            <div className="rounded-[6px] bg-purple-light/40 px-4 py-3 text-sm">
              <p className="font-heading font-semibold text-slate">{selectedProgram?.name}</p>
              <p className="font-body text-gray-text text-[12px]">Duration: {selectedProgram?.duration}</p>
              <p className="font-heading text-[13px] font-bold mt-1 text-purple">
                {selectedProgram?.feeType === "paid"
                  ? `Fee: ${selectedProgram?.feeCurrency}${(selectedProgram?.fee || 0).toLocaleString()}`
                  : "Fee: varies per session (enter below)"}
              </p>
            </div>

            <Input
              id="name" label="Full Name" placeholder="Your full name"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
            />
            <Input
              id="email" label="Email Address" type="email" placeholder="your@email.com"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
            />
            <Input
              id="phone" label="Phone Number" type="tel" placeholder="+234..."
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required
            />

            {selectedProgram?.feeType === "variable" && (
              <Input
                id="amount" label="Programme Fee (₦)" type="number" placeholder="Enter 0 for free, or the session fee"
                value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} required
                min="0"
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="giving" className="flex-1 flex items-center justify-center gap-2">
                <BadgeCheck size={15} />
                {selectedProgram?.feeType === "paid" || Number(customAmount) > 0
                  ? "Enrol & Pay"
                  : "Enrol (Free)"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
