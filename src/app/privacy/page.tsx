import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";

export const metadata: Metadata = {
  title: "Privacy Policy | The Ecclesia Embassy",
  description:
    "What personal information The Ecclesia Embassy website and mobile app collect, why, who processes it, how long it is kept, and the rights you have over it.",
};

/**
 * Static server component with no client JavaScript and no auth gate.
 *
 * That is a requirement, not a preference: the Google Play Console fetches this
 * URL to satisfy Policy → App content, and Apple does the same at review. A page
 * that needs to hydrate, or that redirects a signed-out visitor, fails those
 * checks even though it looks fine in a browser.
 *
 * Keep this truthful and keep it in step with the schema. Every category below
 * was written from the Prisma models and the third parties actually called in
 * the backend, so when a model gains a field that describes a person, this page
 * is part of that change.
 */

const LAST_REVIEWED = "19 August 2026";

const collected = [
  {
    area: "Your account",
    detail:
      "Your email address, and either a password (stored only as a irreversible hash, never as text we can read) or the identifier your Google account returns if you sign in that way. We also record whether your email has been verified and, if sign-in attempts fail repeatedly, a temporary lock.",
  },
  {
    area: "Your profile",
    detail:
      "Whatever you choose to fill in: first and last name, phone number, date of birth, address, city, state, country, occupation, marital status, a photo, and the ministry areas you are involved in. Only your name is required; the rest of the form works perfectly well left blank.",
  },
  {
    area: "Giving",
    detail:
      "The amount, currency, category and a payment reference for each gift, plus a receipt. If you give without an account we keep the name and email you supply so the receipt can reach you. Card and bank details never reach our servers — they are entered on Paystack's or PayPal's own pages.",
  },
  {
    area: "Prayer requests and testimonies",
    detail:
      "The request or testimony itself, with your name, email and phone number. Each prayer request is private unless you mark it as public; private requests are seen only by the pastoral team who respond to them.",
  },
  {
    area: "First contact forms",
    detail:
      "If you plan a visit, register as a first timer or record a decision, we keep the name, email, phone number and how you heard about us, so someone can follow up.",
  },
  {
    area: "Community activity",
    detail:
      "Posts, comments, likes, direct messages, and which hubs, squads and groups you belong to. Direct messages are stored so they can be delivered; treat them as private between you and the recipient rather than as encrypted end to end.",
  },
  {
    area: "Learning and engagement",
    detail:
      "Course enrolments, modules completed, exam submissions, event and class registrations, sermon feedback, watch streaks and badges earned.",
  },
  {
    area: "On the mobile app",
    detail:
      "A push notification token identifying your device, and the platform it runs on, so reminders can reach you. That is the whole of it — the app has no access to your camera, photo library, contacts, calendar or location, and asks for none of them.",
  },
  {
    area: "Your profile photo",
    detail:
      "If you add one, it is uploaded from the website and stored with your profile. Only you and the church team can change it. It is optional, and an account without one works exactly the same.",
  },
  {
    area: "Technical records",
    detail:
      "Server logs carrying a correlation id for each request, and automated error reports when something breaks. Error reports are stripped of passwords, tokens, cookies, email addresses, phone numbers and query strings before they leave our servers — an account id is kept so a fault can be traced back to a session.",
  },
];

const uses = [
  "Running the things you asked for: your account, your giving receipts, your registrations and the services you signed up to.",
  "Pastoral follow-up — responding to a prayer request, welcoming a first-time visitor, or contacting you about a hub or class you joined.",
  "Sending service reminders and notifications you have turned on, and the transactional email that account security depends on: verification and password reset.",
  "Keeping the platform safe and working: rate limiting, locking an account after repeated failed sign-ins, and diagnosing errors.",
  "Understanding attendance and participation in aggregate, to plan services and programmes. This uses counts and totals, not profiles of individuals.",
];

const notDone = [
  "We do not sell your personal information, and we never have.",
  "We do not share it with advertisers, data brokers or analytics networks.",
  "There are no advertising or tracking cookies on this site, and no third-party analytics script.",
  "We do not use your giving history to decide what you see, or make it visible to anyone outside the finance team.",
  "We do not record your screen. Session replay is deliberately switched off in our error reporting, because these screens show giving amounts and prayer requests.",
];

const processors = [
  {
    name: "Paystack and PayPal",
    role: "Take payments. They receive your card or bank details directly and give us back only a reference, an amount and a status.",
  },
  {
    name: "Resend",
    role: "Delivers transactional email — verification, password reset, receipts and reminders. It handles the address the message is sent to.",
  },
  {
    name: "Expo, with Apple and Google",
    role: "Deliver push notifications to your device using the token described above.",
  },
  {
    name: "Google",
    role: "Provides Sign in with Google, if you choose it. Google confirms your identity to us; we do not receive your Google password.",
  },
  {
    name: "Sentry",
    role: "Receives automated error reports, scrubbed as described above. Our project is hosted in Sentry's European region.",
  },
  {
    name: "Railway, Render, Vercel and our database host",
    role: "Run the servers, the website and the database itself. They hold data on our behalf and act on our instructions.",
  },
  {
    name: "YouTube and Spotify",
    role: "Serve embedded sermon players. They set their own cookies once you press play, under their own privacy policies rather than ours.",
  },
];

const rights = [
  {
    title: "See what we hold",
    detail:
      "Ask for a copy of the personal information attached to your account, and we will send it to the verified email on the account.",
  },
  {
    title: "Correct it",
    detail:
      "Most of it you can edit yourself from your profile. Anything you cannot reach, we will correct on request.",
  },
  {
    title: "Delete it",
    detail:
      "Ask us to close your account and erase the personal data attached to it. There is a dedicated page explaining exactly what this removes and what has to be kept.",
  },
  {
    title: "Withdraw consent",
    detail:
      "Turn off notifications in the app, unsubscribe from a mailing, or ask us to stop contacting you, without losing access to your account.",
  },
  {
    title: "Object or restrict",
    detail:
      "Ask us to stop a particular use of your information while a question about it is being resolved.",
  },
  {
    title: "Complain",
    detail:
      "If we have not put something right, you can raise it with the Nigeria Data Protection Commission, or with your local supervisory authority if you are in the UK or EU.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="page-bands">
      <PageHero
        eyebrow="Privacy"
        title="Privacy Policy"
        subtitle={`Last reviewed ${LAST_REVIEWED}`}
        description="This policy covers The Ecclesia Embassy website and mobile app, wherever they are hosted. It is written to be read, not to be survived — if anything here is unclear, ask us and we will fix the wording."
        compact
      />

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          eyebrow="In short"
          title="The short version"
          description="The detail below matters, but this is the substance of it."
        />

        <ul className="mt-10 divide-y divide-slate/8 border-y border-slate/8">
          {notDone.map((item) => (
            <li key={item} className="py-4 font-body text-[15px] leading-7 text-[#3A3740]">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 font-body text-[15px] leading-8 text-[#3A3740]">
          The Ecclesia Embassy, at Guzape Hills, Asokoro Extension, Abuja, Nigeria, is the
          data controller for the information described here — meaning we decide why it is
          collected and what happens to it. You can reach us at{" "}
          <a
            className="text-[var(--brand-accent-text)] underline underline-offset-4"
            href="mailto:support@theecclesiaembassy.org"
          >
            support@theecclesiaembassy.org
          </a>
          .
        </p>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <SectionIntro
          eyebrow="What we collect"
          title="The information we hold, and why you gave it to us"
          description="Grouped by the part of the app that asks for it. Nothing here is gathered silently in the background — each category comes from something you filled in, or something the app needs to function."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collected.map((item) => (
            <div
              key={item.area}
              className="h-full rounded-[26px] border border-slate/8 bg-white p-7"
            >
              <h3 className="font-heading text-lg font-bold text-slate">{item.area}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro
              eyebrow="How it is used"
              title="What we do with it"
              description="Our lawful bases are performing the service you asked for, our legitimate interest in running a church and keeping it secure, and your consent where we ask for it."
            />
          </div>

          <ul className="divide-y divide-slate/8 border-y border-slate/8">
            {uses.map((use) => (
              <li key={use} className="py-4 font-body text-[15px] leading-7 text-[#3A3740]">
                {use}
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="brand-band" hairline>
        <SectionIntro
          tone="dark"
          eyebrow="Who else sees it"
          title="The companies that process data for us"
          description="We use other services to do things we cannot do ourselves. Each one receives only what it needs for its job, and none of them may use it for their own purposes."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processors.map((item) => (
            <div key={item.name} className="brand-card-dark h-full p-7">
              <h3 className="font-heading text-base font-bold text-white">{item.name}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-white/68">{item.role}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 font-body text-sm leading-7 text-white/60">
          Some of these operate outside Nigeria, so your information may be processed abroad.
          We only use providers that commit to protecting it to a comparable standard. We will
          also disclose information where the law requires it, or to protect someone from harm.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="white">
        <SectionIntro
          eyebrow="Keeping and removing"
          title="How long we keep it"
          description="We keep personal information for as long as your account is open and you are in touch with the church."
        />

        <div className="mt-10 max-w-3xl space-y-5 font-body text-[15px] leading-8 text-[#3A3740]">
          <p>
            Close your account and we erase the personal data attached to it. Two things
            survive that, and it is fairer to say so plainly than to bury it. Records of
            giving are kept for seven years, because financial and tax law requires it — they
            are retained as accounting records, not as a profile of you. And anything you
            posted publicly, such as a testimony you chose to publish, stays up unless you ask
            us to take it down, since removing it would tear a hole in a conversation other
            people took part in.
          </p>
          <p>
            Error reports are deleted after 90 days. Server logs are kept for 30 days. Prayer
            requests are retained while they are being prayed for and reviewed periodically
            afterwards.
          </p>
        </div>

        <div className="mt-10">
          <Link
            href="/privacy/delete-account"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
          >
            Delete your account and data
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="paper">
        <SectionIntro
          eyebrow="Your rights"
          title="What you can ask us to do"
          description="Under the Nigeria Data Protection Act 2023, and under the UK and EU GDPR if you are covered by them. We answer within 30 days and do not charge for it."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[26px] border border-slate/8 bg-slate/8 md:grid-cols-2 lg:grid-cols-3">
          {rights.map((item) => (
            <div key={item.title} className="h-full bg-white p-7">
              <h3 className="font-heading text-lg font-bold text-slate">{item.title}</h3>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white" width="narrow">
        <SectionIntro
          eyebrow="Security, children and changes"
          title="Three last things"
        />

        <div className="mt-10 space-y-6 font-body text-[15px] leading-8 text-[#3A3740]">
          <p>
            <strong className="font-heading text-slate">Security.</strong> Passwords are
            hashed rather than stored. Sessions use a cookie that JavaScript cannot read.
            Traffic is encrypted in transit, access to the admin area is restricted by role,
            and sensitive values are stripped from logs and error reports. No system is
            perfect, and we would rather tell you about a breach than manage the news of one —
            if one affects you, we will say so.
          </p>
          <p>
            <strong className="font-heading text-slate">Children.</strong> Accounts are
            intended for people aged 16 and over. Younger children take part in our ministries
            through a parent or guardian, and we collect their information from that adult
            rather than from the child. If you believe a child has created an account, tell us
            and we will remove it.
          </p>
          <p>
            <strong className="font-heading text-slate">Changes.</strong> When we change
            something material here we update the review date above, and for a significant
            change we will tell account holders directly rather than relying on you to notice.
          </p>
        </div>

        <div className="mt-12 rounded-[26px] border border-slate/8 bg-white p-8 text-center">
          <h3 className="font-heading text-lg font-bold text-slate">Questions about your data</h3>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-7 text-gray-text">
            Ask us anything about this policy, or make any of the requests above.
          </p>
          <div className="mt-7 flex flex-col items-center gap-4">
            <a
              href="mailto:support@theecclesiaembassy.org?subject=Privacy%20enquiry"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
            >
              Email the team
            </a>
            <Link
              href="/terms"
              className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)] underline underline-offset-4"
            >
              Read the Terms of Use
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
