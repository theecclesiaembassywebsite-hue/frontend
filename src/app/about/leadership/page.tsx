import Image from "next/image";
import { BookOpen, CalendarDays, Heart, Music, Quote, Sparkles, Users } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function LeadershipPage() {
  return (
    <main className="page-bands">
      {/* Hero */}
      <section className="relative isolate overflow-hidden py-24 sm:py-28 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.18),_transparent_28%),linear-gradient(135deg,_#1B1730_0%,_#0E0B1E_52%,_#130E24_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,30,0.3)_0%,rgba(14,11,30,0.7)_100%)]" />

        {/* Worship photo – desktop only, fades left so text stays readable */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] overflow-hidden lg:block"
          aria-hidden="true"
        >
          <Image
            src="/worship-prayer.jpg"
            alt=""
            fill
            className="object-cover object-[center_20%] opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0B1E] via-[#0E0B1E]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0E0B1E]/75" />
        </div>

        <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Leadership
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.02]">
              A word from the Lead Brother.
            </h1>
            <p className="mt-5 max-w-2xl font-serif text-xl italic leading-8 text-white/84 md:text-2xl">
              Victor Oluwadamilare shares the heartbeat and vision behind the
              movement.
            </p>
          </div>
        </div>
      </section>

      <SectionWrapper variant="dark-purple" className="py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          {/* Photo card */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-4 rounded-[40px] bg-[radial-gradient(circle,_rgba(201,168,76,0.24),_transparent_65%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/8 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#120F20]">
                <Image
                  src="/lead-brother.jpg"
                  alt="Victor Oluwadamilare, the Lead Brother"
                  fill
                  priority
                  className="object-cover object-top scale-[1.02]"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
                <div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                    Lead Brother
                  </p>
                  <p className="mt-1 font-serif text-lg italic text-white/76">
                    Victor Oluwadamilare
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.26em] text-white/76">
                    Shepherding with vision
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-white/80">
              <Quote className="h-4 w-4 text-gold" />
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.24em]">
                Word, Prayer, Worship
              </span>
            </div>

            <div className="mt-6 rounded-[32px] border border-white/12 bg-white/8 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur md:p-8">
              <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-white md:text-[44px] md:leading-[1.05]">
                Welcome to The Ecclesia Embassy, where intentionality shapes
                ambassadors for Christ.
              </h2>

              <div className="mt-6 space-y-5 font-body text-base leading-8 text-white/82 md:text-lg">
                <p>
                  It is with great joy that I welcome you to The Ecclesia Embassy,
                  the assembly of the called-out ones. I strongly believe the Lord
                  has handpicked you for something crucial in His end-time agenda
                  on the earth.
                </p>
                <p>
                  By divine privilege, we are on a mission to raise Word-cultured
                  ambassadors capable of bearing God&apos;s burden and
                  superimposing Heaven&apos;s culture here on earth. It is a huge
                  task, and because of that, we are a people sold out to His cause,
                  surrendered to His will, and committed to His bidding for all the
                  days of our lives.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  {
                    icon: CalendarDays,
                    title: "Tuesdays",
                    time: "5:30 PM",
                    text: "Warfare, heartfelt prayer, and intercession.",
                  },
                  {
                    icon: Sparkles,
                    title: "Fridays",
                    time: "5:30 PM",
                    text: "Passionate worship and supernatural encounters.",
                  },
                  {
                    icon: Quote,
                    title: "Sundays",
                    time: "8:00 AM",
                    text: "A formative moment in the Word that renews us.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/14">
                          <Icon className="h-4 w-4 text-gold" />
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold uppercase tracking-[0.22em] text-white/92">
                            {item.title}
                          </p>
                          <p className="font-serif text-base italic text-white/68">
                            {item.time}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/72">
                        {item.text}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-8 space-y-5 font-body text-base leading-8 text-white/82 md:text-lg">
                <p>
                  A wise man said that in five years you will largely be the same
                  person you are now except for two things: the books you read and
                  the company you keep. That is why I urge you to be part of this
                  loving church family.
                </p>
                <p>
                  Whether you are new to the faith or a seasoned believer, there is
                  a place for you here. Come and be part of a community that is
                  passionate about God, serious about His Word, and intentional
                  about Kingdom advancement.
                </p>

                {/* Pull quote */}
                <div className="relative rounded-[24px] border border-gold/20 bg-gold/10 px-7 pb-6 pt-8 md:px-8">
                  <span
                    className="pointer-events-none absolute left-5 top-1 select-none font-serif text-[68px] leading-none text-gold/38"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="relative font-serif text-xl italic leading-relaxed text-white md:text-2xl">
                    Your best days are not behind you. They are here, because God has
                    much more in mind concerning you.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-6 flex items-center gap-5">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-right">
                  <p className="font-serif text-base italic text-white/90">
                    Victor Oluwadamilare
                  </p>
                  <p className="mt-0.5 font-heading text-[11px] font-semibold uppercase tracking-[0.26em] text-gold">
                    Lead Brother
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

<SectionWrapper variant="off-white" className="py-20 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.32em] text-purple-vivid">
              Join Us
            </p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold tracking-tight text-slate md:text-5xl">
              Find your place in a house that is serious about Christ.
            </h2>
            <p className="mt-5 max-w-2xl font-body text-base leading-8 text-gray-text md:text-lg">
              Whether you are joining us onsite or connecting from another city
              or nation, The Ecclesia Embassy welcomes you. Come experience
              powerful worship, deep teaching, and a community committed to
              raising ambassadors for Christ.
            </p>
          </div>

          <div className="mesh-panel rounded-[32px] p-8 shadow-[0_30px_60px_rgba(14,11,30,0.08)]">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-purple-vivid">
              What to expect
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Music,
                  text: "A room shaped by sincere worship and spiritual depth.",
                },
                {
                  icon: BookOpen,
                  text: "Teaching that is practical, clear, and Word-rooted.",
                },
                {
                  icon: Users,
                  text: "A family atmosphere with room to grow at your pace.",
                },
                {
                  icon: Heart,
                  text: "A consistent rhythm of prayer, discipleship, and care.",
                },
              ].map(({ icon: Icon, text }) => (
                <article
                  key={text}
                  className="relative overflow-hidden rounded-[24px] border border-[rgba(14,11,30,0.08)] bg-white/80 p-5"
                >
                  <div className="absolute bottom-4 left-0 top-4 w-[3px] rounded-full bg-gold/50" />
                  <div className="pl-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-vivid/8">
                      <Icon className="h-[15px] w-[15px] text-purple-vivid" />
                    </div>
                    <p className="text-sm leading-7 text-gray-text">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
