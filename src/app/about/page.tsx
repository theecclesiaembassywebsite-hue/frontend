import Link from "next/link";
import { Award, BookOpen, Crown, Heart, Shield, Sparkles, Wrench } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";

const coreValues = [
  {
    icon: Heart,
    title: "God-Interest",
    description:
      "We live with a consciousness of God, prioritising His will and serving humanity from that place.",
  },
  {
    icon: BookOpen,
    title: "Word-Cultured",
    description:
      "The Word of Christ shapes our convictions, conduct, and the way we interpret everyday life.",
  },
  {
    icon: Crown,
    title: "Kingdom-Driven",
    description:
      "Our ambassadorial responsibility in the Kingdom is what drives our influence and service.",
  },
  {
    icon: Sparkles,
    title: "Worship",
    description:
      "We remain devoted to God with reverence, surrender, and a life that honours His presence.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We pursue beauty, order, and quality in our worship, stewardship, and representation of Christ.",
  },
  {
    icon: Wrench,
    title: "Competent",
    description:
      "We build the requisite capacity for every demand that God's call and Kingdom service place on us.",
  },
  {
    icon: Shield,
    title: "Fidelity",
    description:
      "We stay faithful to Christ, to sound conviction, and to the relationships and trust He has given us.",
  },
];

const beliefSystem = [
  "We live with a consciousness of God and service to humanity, staying heavenly conscious and earthly relevant.",
  "We wholly subscribe to the atonement and substitutionary work of Christ Jesus, who paid fully for sin and ended the enmity between God and mankind.",
  "We believe Jesus lived as our example, showing us how to live for His cause on the earth.",
  "We believe in Christ's vision for His Church: a body functioning together in love, oneness, and mutual care.",
  "We keep the right perspective about problems, seeing them as opportunities for growth, endurance, and relevant progress.",
  "We are responsibility-minded, committed both to doing God's will and to building the capacity required for every assignment He gives.",
  "We are Kingdom-minded people, conscious of Christ as King and of our ambassadorial responsibility to influence for His Kingdom.",
];

export default function AboutPage() {
  return (
    <main className="page-bands">
      <PageHero
        eyebrow="About The Ecclesia Embassy"
        title="Called out by Christ, sent as His ambassadors."
        subtitle="The Ecclesia Embassy is the assembly of the called-out ones and the dwelling place of those chosen to showcase His beauty and excellence."
        description="We are committed to raising a people with a thriving relationship with God, operating with Kingdom worldview, for societal relevance."
        backgroundImage="/about-hero.jpg"
        // Bright outdoor daylight, so it needs the heavier wash to keep the
        // eyebrow and body copy legible. Framed below centre to hold the
        // group rather than the buildings behind them.
        backgroundPosition="center 60%"
        wash="deep"
        actions={[
          { href: "/about/leadership", label: "Meet the Lead Brother", variant: "primary" },
          { href: "/about/experience", label: "The Ecclesia Experience", variant: "secondary", onDark: true },
        ]}
        stats={[
          { value: "Word", label: "A people formed by Christ's Word" },
          { value: "Prayer", label: "A house trained in warfare" },
          { value: "Worship", label: "A life poured out before God" },
        ]}
      />

      <SectionWrapper variant="white">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Our Vision"
              title="The domain of the ambassadors of Christ."
              description="The Ecclesia Embassy is the assembly of the called-out ones: a people gathered in Christ to represent Him with clarity, beauty, and conviction."
            />
            <div className="mt-8 space-y-5 text-base leading-8 text-gray-text">
              <p>
                In Matthew 16:18, the word translated as &ldquo;church&rdquo; comes from the Greek
                root <span className="font-semibold text-slate">ekklesia</span>, meaning the
                called-out ones, the special ones, and the chosen ones. That identity is central to
                who we are.
              </p>
              <p>
                An embassy is the residence of ambassadors or representatives of a foreign nation.
                In that sense, The Ecclesia Embassy is the dwelling place of those chosen to
                showcase the beauty and excellence of Christ in the earth.
              </p>
              <p>
                We exist to raise disciples and leaders whose lives are marked by intimacy with God,
                Kingdom consciousness, and visible relevance in society. Our gatherings, systems,
                and stewardship are built to form people who live as Christ&rsquo;s ambassadors in
                every sphere of life.
              </p>
            </div>
          </div>

          <div className="mesh-panel rounded-[32px] p-8 shadow-[0_30px_60px_rgba(14,11,30,0.08)]">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-purple-vivid">
              Mission &amp; Drive
            </p>
            <h3 className="mt-4 font-heading text-3xl font-bold text-slate">
              To raise a people with a thriving relationship with God, operating with Kingdom
              worldview, for societal relevance.
            </h3>
            <div className="mt-8 space-y-4 text-sm leading-7 text-gray-text">
              <p>
                <span className="font-semibold text-slate">Our drive:</span> Intentionality. We
                are intentional in all we do.
              </p>
              <p>
                <span className="font-semibold text-slate">Our philosophy:</span> Living the Words
                of Christ, doing the works of Christ, and loving as He loves.
              </p>
              <p>
                <span className="font-semibold text-slate">What shapes us:</span> Word, Prayer,
                and Worship remain foundational to how we gather, grow, and serve.
              </p>
            </div>
            <Link
              href="/new-here"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 font-heading text-[13px] font-semibold uppercase tracking-[1.5px] leading-4 text-[#0E0B1E] shadow-[0_14px_28px_rgba(201,168,76,0.2)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-[0_16px_32px_rgba(201,168,76,0.28)] active:translate-y-0 active:shadow-[0_8px_18px_rgba(201,168,76,0.18)]"
            >
              Worship With Us
            </Link>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="lavender">
        <SectionHeading
          eyebrow="Belief System"
          title="The convictions that frame our worldview."
          description="These are the beliefs that shape how we think, endure, serve, and represent Christ in the world."
          align="center"
          className="mb-12"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {beliefSystem.map((belief) => (
            <article
              key={belief}
              className="rounded-[24px] border border-[rgba(14,11,30,0.08)] bg-white p-6 shadow-[0_16px_36px_rgba(14,11,30,0.05)]"
            >
              <p className="text-sm leading-7 text-gray-text">{belief}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="lavender">
        <SectionHeading
          eyebrow="Core Values"
          title="The convictions that shape our culture."
          description="These are the values named in The Ecclesia Embassy experience documents and embodied across our worship, discipleship, and stewardship."
          align="center"
          className="mb-12"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {coreValues.map((value) => {
            const Icon = value.icon;

            return (
              <article key={value.title} className="soft-card rounded-[30px] p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-light">
                  <Icon className="h-6 w-6 text-purple-vivid" />
                </div>
                <h3 className="mt-6 font-heading text-xl font-bold text-slate">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-text">{value.description}</p>
              </article>
            );
          })}
        </div>
      </SectionWrapper>
    </main>
  );
}
