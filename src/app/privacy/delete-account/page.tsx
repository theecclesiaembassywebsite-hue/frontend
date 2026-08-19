import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";

export const metadata: Metadata = {
  title: "Delete Your Account | The Ecclesia Embassy",
  description:
    "How to ask The Ecclesia Embassy to close your account and erase your data, exactly what is removed, what has to be kept, and how long it takes.",
};

/**
 * This is the URL given to Google Play as the account deletion link, which is a
 * separate Play requirement from the privacy policy for any app offering account
 * creation. Apple asks for the equivalent.
 *
 * It must stay publicly reachable without signing in — a reviewer checks it while
 * signed out, and a page behind the auth gate reads as no deletion route at all.
 * Static, no client JavaScript, for the same reason as the privacy policy.
 *
 * The request is handled by hand today: the backend has an admin deletion that
 * cascades a member's records, but no self-service endpoint. If a "delete my
 * account" button is added in-app later, this page should describe that route
 * first and keep the email route as the fallback.
 */

const LAST_REVIEWED = "19 August 2026";

const steps = [
  {
    step: "1",
    title: "Email us from your account address",
    detail:
      "Send a message to support@theecclesiaembassy.org from the email address on the account, with the subject \"Delete my account\". Sending it from that address is how we confirm the request is really yours.",
  },
  {
    step: "2",
    title: "We confirm it is you",
    detail:
      "If anything about the request is unclear, we will reply to that same address to check before touching anything. We will never ask you for your password.",
  },
  {
    step: "3",
    title: "We delete it and tell you it is done",
    detail:
      "Deletion is completed within 30 days of us confirming the request, and usually much sooner. You will get a message confirming it, after which the account is gone and cannot be restored.",
  },
];

const removed = [
  "Your account, your email address and your password.",
  "Your profile: name, phone number, date of birth, address, occupation, marital status, photo and ministry involvement.",
  "Your prayer requests and any testimonies you have not published publicly.",
  "Your posts, comments, likes and direct messages.",
  "Your hub, squad, group and event registrations.",
  "Your course enrolments, module progress and exam submissions.",
  "Your watch streak, badges and sermon feedback.",
  "The push notification tokens for your devices, so notifications stop.",
];

const retained = [
  {
    area: "Records of giving",
    detail:
      "Kept for seven years because financial and tax law requires it. They are held as accounting records — the amount, date and reference — and are not used to contact you or build a profile once your account is gone.",
  },
  {
    area: "Testimonies you published",
    detail:
      "Anything you deliberately made public stays up by default, because taking it down removes part of a conversation others joined. Ask us to remove it as well and we will, either with the whole account or on its own.",
  },
  {
    area: "Anonymous counts",
    detail:
      "Attendance and participation totals that no longer identify anyone. Your individual record is removed from them; the aggregate figure remains.",
  },
];

export default function DeleteAccountPage() {
  return (
    <div className="page-bands">
      <PageHero
        eyebrow="Your data"
        title="Delete your account"
        subtitle={`Last reviewed ${LAST_REVIEWED}`}
        description="You can ask us to close your Ecclesia Embassy account and erase the personal information attached to it, at any time and without giving a reason."
        compact
      />

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          eyebrow="How to ask"
          title="Three steps, and no forms to hunt for"
          description="This applies to both the website and the mobile app — one account covers each."
        />

        <div className="mt-12 space-y-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex gap-5 rounded-[26px] border border-slate/8 bg-white p-7"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] font-heading text-sm font-bold text-[var(--brand-on-accent)]">
                {item.step}
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
                <p className="mt-2 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="mailto:support@theecclesiaembassy.org?subject=Delete%20my%20account"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
          >
            Request account deletion
          </a>
          <p className="mt-4 font-body text-xs leading-6 text-gray-text">
            Opens your email app with the request ready to send.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro
              eyebrow="What goes"
              title="Deleted permanently"
              description="All of this is erased rather than hidden or deactivated, and it cannot be recovered afterwards."
            />
          </div>

          <ul className="divide-y divide-slate/8 border-y border-slate/8">
            {removed.map((item) => (
              <li key={item} className="py-4 font-body text-[15px] leading-7 text-[#3A3740]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="brand-band" hairline>
        <SectionIntro
          tone="dark"
          eyebrow="What stays"
          title="The three things we cannot simply erase"
          description="Said plainly here rather than left for you to discover. Everything outside these three is gone."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {retained.map((item) => (
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
          eyebrow="Not sure"
          title="If deleting is more than you wanted"
          description="Deletion is permanent, so it is worth knowing the smaller options exist."
        />

        <div className="mx-auto mt-10 max-w-2xl space-y-5 font-body text-[15px] leading-8 text-[#3A3740]">
          <p>
            If notifications are the problem, turn them off in the app and the account stays as
            it is. If one post or testimony is the problem, ask us to remove just that. If you
            want to see what we hold before deciding, ask for a copy and we will send it to
            your verified email address.
          </p>
          <p>
            Any of these can be requested at the same address, and choosing one does not
            commit you to the others.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/privacy"
            className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)] underline underline-offset-4"
          >
            Read the Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)] underline underline-offset-4"
          >
            Or use the contact form
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
