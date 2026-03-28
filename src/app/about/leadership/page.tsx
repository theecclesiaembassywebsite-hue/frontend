import SectionWrapper from "@/components/ui/SectionWrapper";
import { User } from "lucide-react";

export default function LeadershipPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Leadership
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Meet the Lead Brother
          </h6>
        </div>
      </section>

      {/* Lead Brother Profile */}
      <SectionWrapper variant="dark-purple">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="flex justify-center">
            <div className="h-72 w-72 overflow-hidden rounded-full bg-purple-light flex items-center justify-center shadow-lg md:h-80 md:w-80">
              <User className="h-32 w-32 text-purple/40" />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[28px] font-bold text-white">
              Brother Victor Oluwadamilare
            </h2>
            <p className="mt-1 font-serif text-lg italic text-purple-light">
              The Lead Brother
            </p>

            <div className="mt-6 space-y-4 font-body text-base text-white/80 leading-relaxed">
              <p>
                Brother Victor Oluwadamilare is the Lead Brother of The Ecclesia
                Embassy, an apostolic and prophetic ministry based in Abuja,
                Nigeria. He carries a mandate for the Word, worship, and the
                building of the Ecclesia — the called-out assembly of God.
              </p>
              <p>
                With a deep commitment to raising Word-cultured ambassadors,
                Brother Victor has devoted his life and ministry to equipping
                believers for the work of the kingdom. His teachings are
                rooted in scripture, practical for daily living, and prophetic
                in their reach.
              </p>
              <p>
                Under his leadership, The Ecclesia Embassy has grown into a
                vibrant community of believers who are passionate about God,
                grounded in the Word, and committed to kingdom influence across
                every sphere of life.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Ministry Leadership
          </h2>
          <p className="mt-4 font-body text-base text-gray-text leading-relaxed">
            The Ecclesia Embassy is led by a team of dedicated leaders across
            various ministry departments, squads, and hubs. More leadership
            profiles will be added as the platform grows.
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
