import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

// ── Update these each year ──────────────────────────────────────────────────
const YEAR = "2026";
const DATE_RANGE = "September 27 — October 3, 2026";
const SCHEDULE: { day: string; date: string; sessions: string }[] = [
  { day: "Day 1", date: "Sep 27", sessions: "Opening Session & Worship Night" },
  { day: "Day 2", date: "Sep 28", sessions: "Morning Word Session & Afternoon Workshop" },
  { day: "Day 3", date: "Sep 29", sessions: "Kingdom Advancement Session & Evening Encounter" },
  { day: "Day 4", date: "Sep 30", sessions: "Worship & Prayer Night" },
  { day: "Day 5", date: "Oct 1", sessions: "Morning Word Session & Afternoon Workshop" },
  { day: "Day 6", date: "Oct 2", sessions: "Kingdom Advancement Session & Evening Encounter" },
  { day: "Day 7", date: "Oct 3", sessions: "Grand Finale & Commissioning Service" },
];
// ────────────────────────────────────────────────────────────────────────────

const facts = [
  { icon: Calendar, label: "Seven days", detail: "Sep 27 – Oct 3" },
  { icon: MapPin, label: "Hosted in Abuja", detail: "Ecclesians and guests from around the world" },
  { icon: Users, label: "Open to all", detail: "No registration required — simply come" },
];

export default function FeastOfTabernaclesPage() {
  return (
    <div data-brand="events">
      <PageHero
        eyebrow="Annual Anniversary"
        title={`Feast of Tabernacles ${YEAR}`}
        subtitle={DATE_RANGE}
        description="Seven days of joy, community, and reflection — celebrating Christ, His harvest, and His guidance over a people He is building for Himself."
        actions={[
          { href: "#schedule", label: "See the Schedule", variant: "primary" },
          { href: "/contact", label: "Ask a Question", variant: "secondary", onDark: true },
        ]}
      />

      {/* ── AT A GLANCE ── */}
      <SectionWrapper variant="white" density="compact">
        <div className="grid gap-px overflow-hidden rounded-[26px] border border-slate/8 bg-slate/8 md:grid-cols-3">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div key={fact.label} className="flex h-full items-start gap-4 bg-white p-6 md:p-7">
                <div className="brand-tile h-11 w-11 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate">{fact.label}</h3>
                  <p className="mt-1.5 font-body text-sm leading-6 text-gray-text">{fact.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ── THE WORD BEHIND IT ─────────────────────────────────────────
          A long first-person account. It is set as a reading column with a
          standing pull-quote, rather than broken into cards, because the
          whole point is that it is one continuous word. */}
      <SectionWrapper variant="paper">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>Why we keep it</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.12] text-slate md:text-[38px]">
              The Ecclesia Embassy is a strange movement.
            </h2>
            <blockquote className="mt-8 border-l-[3px] border-[var(--brand-accent)] pl-5">
              <p className="font-serif text-[17px] italic leading-[1.7] text-[#3A3740]">
                &ldquo;So why do you call me &lsquo;Lord&rsquo; when you won&rsquo;t obey me?&rdquo;
              </p>
              <footer className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent-text)]">
                Luke 6:46 TLB
              </footer>
            </blockquote>
          </div>

          <div className="space-y-5 font-body text-[15.5px] leading-[1.8] text-[#3A3740] md:text-[17px]">
            <p>
              The Lord began talking to me, saying,{" "}
              <span className="font-semibold text-slate">
                THE ECCLESIA EMBASSY IS A STRANGE MOVEMENT!
              </span>
            </p>
            <p>
              And He said, &ldquo;The Feast of Tabernacles was to be celebrated in the seventh month
              of the year, which is between September and October because the Hebrews lived in tents
              on their journey from Egypt to Canaan and also celebrated God&rsquo;s goodness in
              bringing them into the promised land!&rdquo;
            </p>
            <p>
              He went ahead and said to me, &ldquo;Be committed to obeying My Word! Desire to please
              Me and live with My blessing instead of My judgement.&rdquo;
            </p>
            <p>
              Then He brought me to the Book of Nehemiah and began to teach me deep things about the
              Feast of Tabernacles from Chapter 8:13–18 TLB. He brought me into the reality of His
              command to His people about this special time of celebration. Moses was commanded to
              announce it far and wide among the population that no one is exempt from this crucial
              moment. Even Christ, in the New Testament, identified with and celebrated the Feast of
              Tabernacles.
            </p>
            <p>
              As a people dedicated to obedience, it is a time of joy, community, and reflection,
              emphasizing gratitude for the harvest, His guidance, and the importance of faith and
              reliance on God — and most importantly, the place of Christ in our overall experience.
            </p>
            <p>
              Celebrating Jesus Christ is significant for us because of the profound impact He has
              had on our history, our culture as a Church, and our personal faith. Spiritually,
              Christ is the central figure of our faith. His teachings of love, forgiveness,
              compassion, and humility have imparted impeccable values into the various expressions
              of our lives. We have been profoundly influenced as individuals and as a nation that He
              is building for Himself.
            </p>
            <p>
              This celebration brings us into a time of hope and renewal for many years and seasons
              to come. We enter into the possibility of new beginnings and the promise of His
              numerous blessings that lie ahead. We rejoice in the love of Christ that gave us a
              community, a communality and a common unity. Through Him, we have a sense of belonging.
            </p>
            <p>
              Everyone is specially invited to join in this celebration of the One who gives grace,
              beauty, peace, safety, joy, love and life. Let us celebrate Christ together at the
              Feast of Tabernacles!
            </p>
            <p className="pt-2 text-right font-heading text-sm font-semibold text-slate">
              — Victor Oluwadamilare
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SCHEDULE ───────────────────────────────────────────────────
          Seven numbered days on a single spine — the shape that belongs
          to this page and to no other event. */}
      <SectionWrapper variant="brand-ink" id="schedule" hairline>
        <SectionIntro
          align="center"
          tone="dark"
          eyebrow="Seven days"
          title="Event schedule"
          description="Each day carries its own weight. Come for one, or walk the whole week."
        />

        <ol className="mx-auto mt-16 max-w-3xl">
          {SCHEDULE.map((entry, index) => (
            <li key={entry.day} className="relative flex gap-6 pb-8 last:pb-0 md:gap-8">
              {index < SCHEDULE.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[23px] top-12 bottom-0 w-px bg-white/12 md:left-[27px]"
                />
              )}
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-tile)] font-heading text-sm font-bold text-white md:h-14 md:w-14">
                {index + 1}
              </span>
              <div className="flex-1 rounded-[22px] border border-white/10 bg-white/[0.05] px-6 py-5 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-heading text-base font-bold text-white">{entry.day}</p>
                  <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-accent-text)]">
                    {entry.date}
                  </p>
                </div>
                <p className="mt-2 font-body text-sm leading-7 text-white/68">{entry.sessions}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionWrapper>

      {/* ── JOIN US ── */}
      <SectionWrapper variant="brand-band" hairline width="narrow">
        <div className="text-center">
          <Eyebrow align="center">Join us</Eyebrow>
          <h2 className="mt-6 font-heading text-3xl font-bold leading-tight text-white md:text-[42px]">
            Everyone is specially invited.
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-body text-[15px] leading-8 text-white/64">
            The Feast of Tabernacles is open to all. No registration required — simply come and be
            part of this glorious celebration.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
          >
            Contact Us
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
