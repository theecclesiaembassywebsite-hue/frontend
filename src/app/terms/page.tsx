import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description:
    "The terms that apply when you use The Ecclesia Embassy website and mobile app: your account, giving, what you post, and how disputes are handled.",
  path: "/terms",
});

/**
 * Static server component, publicly reachable without signing in — the app
 * stores links here from its sign-up screen, and app store reviewers follow it.
 */

const LAST_REVIEWED = "19 August 2026";

const accountRules = [
  "Give accurate details when you register, and keep your email address current — it is how we verify a password reset or a deletion request.",
  "Your account is yours. Do not share your password, and tell us promptly if you think someone else has reached it.",
  "You need to be 16 or over to hold an account. Younger children take part through a parent or guardian.",
  "Repeated failed sign-ins lock an account for a short period. This protects you, and waiting it out or resetting your password clears it.",
];

const conduct = [
  "Post nothing unlawful, abusive, hateful, obscene or deliberately misleading.",
  "Do not impersonate another person, a leader, or the church itself.",
  "Do not harvest other members' details, or use the community areas to advertise or solicit.",
  "Do not upload anything you do not hold the rights to, including music, video and images.",
  "Do not attempt to break, probe or overload the platform, or to reach areas your account is not entitled to.",
  "Treat prayer requests and direct messages as confidences. Sharing what someone told you in one is a serious breach of trust as well as of these terms.",
];

const givingTerms = [
  {
    title: "Gifts are voluntary",
    detail:
      "Everything given through this platform is a voluntary gift to the church, not a purchase or a subscription to a service.",
  },
  {
    title: "Payments are handled elsewhere",
    detail:
      "Paystack and PayPal process the transaction on their own pages under their own terms. Your card and bank details never reach our servers.",
  },
  {
    title: "Mistakes get put right",
    detail:
      "If you gave the wrong amount, gave twice, or a payment failed and was still taken, contact us and we will look into it and refund where the error is genuine.",
  },
  {
    title: "Recurring gifts stop when you say",
    detail:
      "A recurring gift continues until you cancel it, which you can do at any time by contacting us. Cancelling stops future gifts and does not reverse past ones.",
  },
  {
    title: "Receipts",
    detail:
      "A receipt is issued for each completed gift to the email on the account, or to the address given if you gave as a guest.",
  },
];

const contentTerms = [
  {
    title: "What we own",
    detail:
      "Sermons, teaching material, written resources, music, photography, the logo and the design of this site belong to The Ecclesia Embassy or to the people who licensed them to us.",
  },
  {
    title: "What you may do with it",
    detail:
      "Read it, listen to it, download it where we offer a download, and share it personally and non-commercially with attribution. Selling it, or republishing it as your own, is not permitted.",
  },
  {
    title: "What you post stays yours",
    detail:
      "You keep ownership of your testimonies, posts and comments. By posting you allow us to display, store and distribute them within the platform — and, for anything you publish publicly, in church communications.",
  },
  {
    title: "Taking things down",
    detail:
      "We may remove content that breaches these terms, and we may suspend an account that repeatedly does. Where it is fair to, we will tell you why.",
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="page-bands">
      <Breadcrumbs items={[{ label: "Terms of Use" }]} />
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle={`Last reviewed ${LAST_REVIEWED}`}
        description="These terms apply when you use The Ecclesia Embassy website or mobile app. Using either means you accept them."
        compact
      />

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          eyebrow="Who we are"
          title="The agreement, in one paragraph"
        />

        <div className="mt-8 space-y-5 font-body text-[15px] leading-8 text-[#3A3740]">
          <p>
            This platform is operated by The Ecclesia Embassy, Guzape Hills, Asokoro Extension,
            Abuja, Nigeria. It exists to serve the life of the church: to carry teaching, to
            let you give, to connect you to a hub or a class, and to let members pray for and
            encourage one another. It is not a general-purpose social network, and we run it
            accordingly.
          </p>
          <p>
            If you do not agree with these terms, please do not use the platform. If you hold
            an account and stop agreeing with them, you can{" "}
            <Link
              className="text-[var(--brand-accent-text)] underline underline-offset-4"
              href="/privacy/delete-account"
            >
              close your account
            </Link>{" "}
            at any time.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro
              eyebrow="Your account"
              title="Holding an account"
              description="An account is optional — most of the site can be read without one — but these apply if you have one."
            />
          </div>

          <ul className="divide-y divide-slate/8 border-y border-slate/8">
            {accountRules.map((rule) => (
              <li key={rule} className="py-4 font-body text-[15px] leading-7 text-[#3A3740]">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="brand-band" hairline>
        <SectionIntro
          tone="dark"
          eyebrow="Conduct"
          title="How we expect people to behave here"
          description="This is a church community. The standard is higher than the law's minimum, and we would rather state it than imply it."
        />

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {conduct.map((rule) => (
            <li key={rule} className="py-4 font-body text-[15px] leading-7 text-white/74">
              {rule}
            </li>
          ))}
        </ul>
      </SectionWrapper>

      <SectionWrapper variant="white">
        <SectionIntro
          eyebrow="Giving"
          title="When you give through the platform"
          description="Giving is the part with money attached, so it gets the plainest wording we can manage."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {givingTerms.map((item) => (
            <div
              key={item.title}
              className="h-full rounded-[26px] border border-slate/8 bg-white p-7"
            >
              <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <SectionIntro
          eyebrow="Content"
          title="Ours, yours, and what each of us may do"
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[26px] border border-slate/8 bg-slate/8 md:grid-cols-2">
          {contentTerms.map((item) => (
            <div key={item.title} className="h-full bg-white p-7">
              <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          eyebrow="The legal tail"
          title="Availability, liability and disputes"
        />

        <div className="mt-10 space-y-6 font-body text-[15px] leading-8 text-[#3A3740]">
          <p>
            <strong className="font-heading text-slate">Availability.</strong> We work to keep
            the platform running, but we do not promise it will be uninterrupted or fault-free.
            Features may change, and parts that depend on third parties — embedded video,
            payment pages, push notifications — can fail for reasons outside our control.
          </p>
          <p>
            <strong className="font-heading text-slate">Third-party services.</strong> Links
            and embedded players take you to services we do not run. Their terms and privacy
            policies apply once you are there, not ours.
          </p>
          <p>
            <strong className="font-heading text-slate">Liability.</strong> Nothing here limits
            liability for death or personal injury caused by negligence, for fraud, or for
            anything else the law does not allow us to limit. Beyond that, the platform is
            provided as it stands, and we are not liable for indirect or consequential loss
            arising from using it.
          </p>
          <p>
            <strong className="font-heading text-slate">Governing law.</strong> These terms are
            governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts
            have jurisdiction over any dispute. We would much rather resolve it by talking
            first — write to us and we will engage properly.
          </p>
          <p>
            <strong className="font-heading text-slate">Changes.</strong> We may update these
            terms. The review date above changes when we do, and for a significant change we
            will tell account holders directly.
          </p>
        </div>

        <div className="mt-12 rounded-[26px] border border-slate/8 bg-white p-8 text-center">
          <h3 className="font-heading text-lg font-bold text-slate">Questions about these terms</h3>
          <div className="mt-7 flex flex-col items-center gap-4">
            <a
              href="mailto:support@theecclesiaembassy.org?subject=Terms%20of%20Use%20enquiry"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
            >
              Email the team
            </a>
            <Link
              href="/privacy"
              className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)] underline underline-offset-4"
            >
              Read the Privacy Policy
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
