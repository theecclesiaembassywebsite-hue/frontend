import SectionWrapper from "@/components/ui/SectionWrapper";
import { Calendar, MapPin, Mic } from "lucide-react";

export default function FeastOfTabernaclesPage() {

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
          <h2 className="font-heading text-[28px] font-bold text-white mb-4">Join Us</h2>
          <p className="font-body text-sm text-white/70 mb-4">
            The Feast of Tabernacles is open to all. No registration required — simply come and be part of this glorious celebration.
          </p>
          <p className="font-body text-sm text-white/70">
            For more information, contact us at <a href="/contact" className="text-purple-light hover:underline">our contact page</a>.
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
