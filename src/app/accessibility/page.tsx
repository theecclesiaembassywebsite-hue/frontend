import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Accessibility Statement",
  description:
    "How The Ecclesia Embassy website approaches accessibility, what standard it aims for, the areas we know still fall short, and how to report a barrier.",
  path: "/accessibility",
});

/**
 * A deliberately plain, honest statement. It is a static server component —
 * no client JavaScript — so it stays reachable even if the rest of the app
 * fails to hydrate, which is exactly when someone is most likely to need it.
 *
 * Keep the "known limitations" list truthful. A statement that claims full
 * conformance it cannot demonstrate is worse than none.
 */

const conformance = [
  {
    title: "Standard we work to",
    detail:
      "Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. This is the level most commonly referenced in law and procurement, and the one we test against.",
  },
  {
    title: "How we test",
    detail:
      "Automated checks with axe-core run against representative pages, alongside manual keyboard-only walkthroughs. Automated tools catch roughly a third of issues, so manual checking carries the rest.",
  },
  {
    title: "Where we stand",
    detail:
      "Partially conformant. The site meets most Level AA criteria, and the exceptions we are aware of are listed below rather than left unsaid.",
  },
];

const measures = [
  "Text and background colours are checked against the 4.5:1 contrast minimum for body text.",
  "Every interactive control is reachable and operable with a keyboard alone.",
  "A skip link lets keyboard users bypass the navigation on every page.",
  "Dialogs trap focus while open and return it to whatever opened them on close.",
  "Images carry alternative text, and decorative images are hidden from assistive technology.",
  "Animation is reduced automatically when your system asks for reduced motion.",
  "Forms use real labels, and errors are announced rather than shown by colour alone.",
];

const limitations = [
  {
    area: "Embedded video and audio",
    detail:
      "Sermons and adverts hosted on YouTube and Spotify are played through their own embedded players, whose controls and captions we do not govern. Where captions are missing, they are missing at the source.",
  },
  {
    area: "Uploaded media",
    detail:
      "Images and documents added through the admin area depend on the alternative text and structure supplied at upload time. We are working through older material.",
  },
  {
    area: "Third-party checkout",
    detail:
      "Payments hand off to Paystack and PayPal. Those pages are outside our control and we cannot guarantee their conformance.",
  },
];

export default function AccessibilityPage() {
  return (
    <div data-brand="embassy">
      <Breadcrumbs items={[{ label: "Accessibility" }]} />
      <PageHero
        eyebrow="Accessibility"
        title="Everyone should be able to use this site."
        subtitle="Our commitment, our standard, and what still needs work."
        description="This statement covers theecclesiaembassy.org and the services run from it. We would rather name the gaps than claim a conformance we cannot demonstrate."
        compact
      />

      <SectionWrapper variant="white">
        <SectionIntro
          eyebrow="Conformance"
          title="What we measure against"
          description="Accessibility is a standard we test for, not a claim we make once."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[26px] border border-slate/8 bg-slate/8 md:grid-cols-3">
          {conformance.map((item) => (
            <div key={item.title} className="h-full bg-white p-7">
              <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro
              eyebrow="Measures in place"
              title="What we have done"
              description="These apply across the site rather than to single pages."
            />
          </div>

          <ul className="divide-y divide-slate/8 border-y border-slate/8">
            {measures.map((measure) => (
              <li key={measure} className="py-4 font-body text-[15px] leading-7 text-[#3A3740]">
                {measure}
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="brand-band" hairline>
        <SectionIntro
          tone="dark"
          eyebrow="Known limitations"
          title="Where the site still falls short"
          description="We would rather tell you now than have you discover it mid-task."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {limitations.map((item) => (
            <div key={item.area} className="brand-card-dark h-full p-7">
              <h3 className="font-heading text-lg font-bold text-white">{item.area}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-white/68">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          align="center"
          eyebrow="Tell us"
          title="Report a barrier"
          description="If something on this site blocks you, we want to hear about it — including which page you were on and what you were trying to do. We aim to respond within five working days."
        />

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href="mailto:support@theecclesiaembassy.org?subject=Accessibility%20feedback"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
          >
            Email the team
          </a>
          <Link
            href="/contact"
            className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)] underline underline-offset-4"
          >
            Or use the contact form
          </Link>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center font-body text-xs leading-6 text-gray-text">
          This statement was last reviewed on 9 August 2026. It is updated whenever we change
          something material about how the site works.
        </p>
      </SectionWrapper>
    </div>
  );
}
