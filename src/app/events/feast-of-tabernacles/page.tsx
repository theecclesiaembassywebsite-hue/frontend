"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Calendar, MapPin, Mic, Check } from "lucide-react";
import { events as eventsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const EVENT_ID = "feast-of-tabernacles";

export default function FeastOfTabernaclesPage() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { success, error } = useToast();

  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark via-purple to-purple-vivid" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-purple-light mb-3">Annual Anniversary</p>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Feast of Tabernacles 2026
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            October 15 — 18, 2026
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-10">
          {[
            { icon: Calendar, title: "4 Days", desc: "October 15-18, 2026" },
            { icon: MapPin, title: "Abuja, Nigeria", desc: "The Ecclesia Embassy" },
            { icon: Mic, title: "Multiple Speakers", desc: "Powerful ministry sessions" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <Icon className="mx-auto h-8 w-8 text-purple mb-2" />
                <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
                <p className="text-body-small">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-[28px] font-bold text-slate text-center mb-4">Event Schedule</h2>
          <div className="space-y-3">
            {[
              { day: "Day 1 — Oct 15", sessions: "Opening Session & Worship Night" },
              { day: "Day 2 — Oct 16", sessions: "Morning Word Session & Afternoon Workshop" },
              { day: "Day 3 — Oct 17", sessions: "Kingdom Advancement Session & Evening Encounter" },
              { day: "Day 4 — Oct 18", sessions: "Grand Finale & Commissioning Service" },
            ].map((d) => (
              <div key={d.day} className="flex gap-4 rounded-[8px] bg-off-white p-4">
                <p className="font-heading text-sm font-bold text-purple shrink-0 w-28">{d.day}</p>
                <p className="font-body text-sm text-gray-text">{d.sessions}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-[28px] font-bold text-white mb-6">Register Now</h2>
          {registered ? (
            <div className="rounded-[8px] bg-white/10 p-8">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-white">Registered!</h3>
              <p className="mt-2 font-body text-sm text-white/70">A confirmation email has been sent.</p>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await eventsAPI.registerForEvent(EVENT_ID, {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                });
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
                {loading ? "Registering..." : "Register for Feast of Tabernacles"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
