import SectionWrapper from "@/components/ui/SectionWrapper";
import { Flame, Calendar, Clock } from "lucide-react";

export default function AsUntoTheLordPage() {
  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <Flame className="mx-auto h-12 w-12 text-warning mb-3" />
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">As Unto The Lord</h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Monthly Consecration — First three days of every month
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate mb-4">About This Program</h2>
          <p className="font-body text-base text-gray-text leading-relaxed">
            As Unto The Lord is a special consecration program held on the first
            three days of every month. It is a time set apart for fasting, prayer,
            worship, and seeking the face of God as we dedicate the new month to
            Him. Both morning and evening sessions are held.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-md">
          <h2 className="font-heading text-xl font-bold text-slate text-center mb-6">Schedule</h2>
          <div className="space-y-4">
            {[
              { day: "Day 1 (1st)", morning: "6:00 AM — Morning Consecration", evening: "6:00 PM — Evening Word Session" },
              { day: "Day 2 (2nd)", morning: "6:00 AM — Morning Prayer", evening: "6:00 PM — Evening Worship & Word" },
              { day: "Day 3 (3rd)", morning: "6:00 AM — Morning Dedication", evening: "6:00 PM — Closing Service & Communion" },
            ].map((d) => (
              <div key={d.day} className="rounded-[8px] border border-gray-border bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-purple" />
                  <h3 className="font-heading text-sm font-bold text-slate">{d.day}</h3>
                </div>
                <div className="space-y-1 ml-6">
                  <div className="flex items-center gap-2 text-sm font-body text-gray-text">
                    <Clock size={12} /> {d.morning}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-body text-gray-text">
                    <Clock size={12} /> {d.evening}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-xl italic text-white/90 leading-relaxed">
            &ldquo;Consecrate yourselves, for tomorrow the Lord will do amazing things among you.&rdquo;
          </p>
          <p className="mt-4 font-heading text-sm font-semibold text-purple-light">— Joshua 3:5</p>
        </div>
      </SectionWrapper>
    </>
  );
}
