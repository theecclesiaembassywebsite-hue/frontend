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
            A Word from the Lead Brother
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
                The Ecclesia Embassy is a gospel church committed to nurturing
                Word-cultured ambassadors who represent the Kingdom of God with
                excellence, character, and power.
              </p>
              <p>
                We believe that the Church is not just a gathering — it is a
                living, functioning Ecclesia: the called-out assembly of God,
                raised to govern, influence, and transform every sphere of
                society. Our mandate is rooted in the Great Commission, and our
                approach is both apostolic and prophetic — building believers
                who are spiritually sound, scripturally grounded, and practically
                equipped for life and service.
              </p>
              <p>
                At The Ecclesia Embassy, every gathering is designed to build
                you up in faith and purpose. Our weekly meetings include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="font-semibold text-white">Tuesdays</span> — Warfare &amp; Intercession: We come together to pray, wage spiritual warfare, and intercede for nations, families, and futures.</li>
                <li><span className="font-semibold text-white">Fridays</span> — Worship: A powerful time of encounter and intimacy with the Holy Spirit.</li>
                <li><span className="font-semibold text-white">Sundays</span> — The Word: A deep dive into the Scriptures — teaching, training, and equipping for life in the Kingdom.</li>
              </ul>
              <p>
                Whether you are new to the faith or a seasoned believer, there
                is a place for you here. Come and be part of a community that is
                passionate about God, serious about His Word, and intentional
                about kingdom advancement.
              </p>
              <p className="font-semibold text-white italic">
                Welcome to The Ecclesia Embassy — where we are raising
                ambassadors for the Kingdom.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Join Us
          </h2>
          <p className="mt-4 font-body text-base text-gray-text leading-relaxed">
            Whether you are in Abuja or connecting from anywhere around the world,
            The Ecclesia Embassy welcomes you. Come experience powerful worship,
            deep teaching, and a community committed to raising kingdom ambassadors.
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
