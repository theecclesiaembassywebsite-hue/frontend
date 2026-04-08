"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Mountain, Check } from "lucide-react";
import { events as eventsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const EVENT_ID = "gilgal";

export default function GilgalPage() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { success, error } = useToast();

  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-near-black" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-purple-light mb-3">Tri-annual Retreat</p>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">Gilgal Camp Meeting</h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">June 5 — 8, 2026</h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-2xl text-center">
          <Mountain className="mx-auto h-12 w-12 text-purple mb-4" />
          <h2 className="font-heading text-[28px] font-bold text-slate">About Gilgal</h2>
          <p className="mt-4 font-body text-base text-gray-text leading-relaxed">
            Gilgal Camp Meetings are tri-annual retreats designed for deep spiritual
            refreshing, encounter, and repositioning. Step away from the routine and
            enter into an intensive time of Word, worship, prayer, and fellowship.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-[28px] font-bold text-white mb-2">Register</h2>
          <p className="font-body text-sm text-white/60 mb-6">Registration is free and includes accommodation and meals.</p>
          {registered ? (
            <div className="rounded-[8px] bg-white/10 p-8">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-white">Registration Complete!</h3>
              <p className="mt-2 font-body text-sm text-white/70">Check your email for confirmation and details.</p>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await eventsAPI.registerForEvent(EVENT_ID, formData);
                setRegistered(true);
                success("Registration successful!");
              } catch (err) {
                error(err instanceof Error ? err.message : "Registration failed");
              } finally {
                setLoading(false);
              }
            }} className="flex flex-col gap-4">
              <Input
                id="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                id="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Button type="submit" variant="giving" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register for Gilgal"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
