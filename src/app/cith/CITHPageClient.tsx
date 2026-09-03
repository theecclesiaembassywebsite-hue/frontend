'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, Globe, Calendar, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Eyebrow from '@/components/ui/Eyebrow';
import SectionIntro from '@/components/ui/SectionIntro';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { cith } from '@/lib/api';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { SkeletonGroup } from '@/components/ui/Skeleton';

interface Hub {
  id: string;
  name: string;
  leader?: { profile?: { firstName?: string; lastName?: string } } | string;
  location?: string;
  area?: string;
  city?: string;
  meetingDay?: string;
  meetingTime?: string;
}

function getLeaderName(hub: Hub): string {
  if (!hub.leader) return 'Unassigned';
  if (typeof hub.leader === 'string') return hub.leader;
  const profile = hub.leader.profile;
  return [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unassigned';
}

function getHubLocation(hub: Hub): string {
  if (hub.location) return hub.location;
  return [hub.area, hub.city].filter(Boolean).join(', ') || 'Location TBD';
}

const purposes = [
  { label: 'Knowledge', detail: 'The Word taught close enough to be asked questions of.' },
  { label: 'Transformation', detail: 'Lives reshaped in the company of people who notice.' },
  { label: 'Government', detail: 'Heaven’s order practised in an ordinary living room.' },
  { label: 'Authority', detail: 'Believers who know what they carry, and use it.' },
  { label: 'Discipleship', detail: 'Growth passed hand to hand, not broadcast from a stage.' },
];

const operations = ['Evangelism', 'Training', 'Fellowship', 'Worship', 'Works'];

export default function CITHPageClient() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<Hub[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const hubSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        setIsLoading(true);
        const data = await cith.getHubs();
        setHubs(data || []);
        setFilteredHubs(data || []);
      } catch (error) {
        console.error('Failed to fetch hubs:', error);
        setHubs([]);
        setFilteredHubs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHubs();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredHubs(hubs);
    } else {
      const q = query.toLowerCase();
      setFilteredHubs(
        hubs.filter(
          hub =>
            hub.name.toLowerCase().includes(q) ||
            getHubLocation(hub).toLowerCase().includes(q) ||
            hub.area?.toLowerCase().includes(q) ||
            hub.city?.toLowerCase().includes(q) ||
            getLeaderName(hub).toLowerCase().includes(q),
        ),
      );
    }
  };

  const scrollToHubs = () => {
    hubSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div data-brand="cith" className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────
          The Anton display headline is CITH's own signature and stays —
          it is the one destination on the site that shouts rather than
          speaks. Everything around it now draws from the shared field. */}
      <section className="relative isolate overflow-hidden bg-[image:var(--brand-hero)]">
        <div aria-hidden="true" className="brand-orb -left-32 top-0 h-80 w-80" />
        <div aria-hidden="true" className="brand-orb -right-24 bottom-0 h-72 w-72 opacity-70" />

        <div className="relative mx-auto grid min-h-[680px] max-w-[1320px] gap-12 px-4 py-16 sm:px-6 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/6 px-4 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--brand-accent)' }}
              />
              Selected Saturdays · Every Month
            </span>

            <h1
              className="mt-7 uppercase text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(48px, 6.5vw, 96px)',
                lineHeight: 0.9,
                letterSpacing: '0.01em',
              }}
            >
              Church<br />in the<br />House
            </h1>

            <p className="mt-7 font-body text-[16px] leading-[1.75] text-white/70 md:text-[17px]">
              On selected Saturdays each month, believers gather across the city to share
              the Word, break bread, and grow together in smaller, intentional
              expressions of church. When a home hub isn&apos;t close by, the
              e-Hub keeps you connected.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={scrollToHubs}
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
              >
                Find a hub near you
              </button>
              <Link
                href="/cith/ehub"
                className="inline-flex items-center justify-center rounded-full border border-white/18 px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/8"
              >
                Join e-Hub
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
            <div aria-hidden="true" className="brand-orb -inset-8 h-auto w-auto rounded-[52px]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/4 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#14111F]">
                <Image
                  src="/cith-advert-design.jpg"
                  alt="Church in the House gathering"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(9,7,26,0.55)_100%)]"
                />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--brand-accent)' }}
                  />
                  <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/78">
                    CITH
                  </span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────
          A long-form editorial column. CITH is the one page on the site
          that asks to be read rather than scanned. */}
      <SectionWrapper variant="white" density="roomy">
        <FadeIn>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-20">

            <div className="lg:sticky lg:top-24">
              <Eyebrow>About CITH</Eyebrow>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-slate md:text-[42px]">
                The Church<br className="hidden lg:block" /> in The House
              </h2>

              <blockquote className="mt-8 border-l-[3px] border-[var(--brand-accent)] pl-5">
                <p className="font-serif text-[17px] italic leading-[1.7] text-[#3A3740]">
                  &ldquo;I will build My Church and the gates of hell shall not prevail against it.&rdquo;
                </p>
                <footer className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent-text)]">
                  Matthew 16:18
                </footer>
              </blockquote>

            </div>

            <div>
              <div className="space-y-5 font-body text-[15.5px] leading-[1.8] text-[#3A3740] md:text-[17px]">
                <p>
                  The Church in The House (CITH) is the arm of The Ecclesia Embassy commissioned
                  for the gathering together of God&apos;s people to serve Christ in the home. Jesus
                  said in Matthew 16:18 that He would build His Church — not a Church limited by
                  a temple building, but one that would replicate heaven on earth across every
                  home, neighbourhood, and city.
                </p>
                <p>
                  The CITH is mandated to operate with the template of the revelation we have in
                  The Ecclesia Embassy concerning the Church. Its purposes are for{' '}
                  <span className="font-semibold text-slate">
                    Knowledge, Transformation, Government, Authority and Discipleship
                  </span>{' '}
                  — while its operations are expressed through{' '}
                  <span className="font-semibold text-slate">
                    Evangelism, Training, Fellowship, Worship and Works
                  </span>
                  .
                </p>
                <p>
                  CITH brings the life of the Church closer to the grassroots of daily life. In
                  smaller fellowship settings, believers are known, cared for, and encouraged to
                  grow actively rather than remain spectators. It creates space for deeper study,
                  spiritual accountability, genuine care, and natural opportunities for witnessing
                  in homes and neighbourhoods.
                </p>
                <p>
                  Where a physical hub is not accessible, the{' '}
                  <span className="font-semibold text-slate">e-Hub</span> provides an online
                  expression of that same fellowship for believers who do not have a CITH hub
                  close to them or are unable to make their home one.
                </p>
              </div>

              {/* Purposes as a numbered rail — CITH's own structural motif. */}
              <div className="mt-12">
                <Eyebrow>The five purposes</Eyebrow>
                <ol className="mt-6 divide-y divide-slate/8 border-y border-slate/8">
                  {purposes.map((purpose, i) => (
                    <li key={purpose.label} className="flex items-baseline gap-5 py-4">
                      <span className="font-heading text-[13px] font-bold tracking-[0.18em] text-[var(--brand-accent-text)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-heading text-base font-bold text-slate">
                          {purpose.label}
                        </p>
                        <p className="mt-1 font-body text-sm leading-6 text-gray-text">
                          {purpose.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-10">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-gray-text">
                  Expressed through
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {operations.map(op => (
                    <span
                      key={op}
                      className="inline-flex items-center rounded-full border border-[var(--brand-accent-line)] bg-[var(--brand-accent-soft)] px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-slate"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* ── HUB DIRECTORY ── */}
      <section
        id="find-hub"
        ref={hubSectionRef}
        className="relative isolate overflow-hidden bg-[linear-gradient(180deg,_#FFFDF8_0%,_#F5F1E8_100%)] py-18 md:py-24"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 md:px-8">
          <FadeIn>
            <SectionIntro
              align="center"
              eyebrow="Hub Directory"
              title="Find your hub"
              description="Search by location, area, or hub leader — then open a hub to see when and where it meets."
            />

            <div className="relative mx-auto mb-14 mt-10 max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
              <Input
                placeholder="Search hubs…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-11 !rounded-full !bg-white"
              />
            </div>
          </FadeIn>

          {isLoading ? (
            <SkeletonGroup count={6} variant="card" columns={3} />
          ) : filteredHubs.length > 0 ? (
            <StaggerContainer>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredHubs.map(hub => (
                  <StaggerItem key={hub.id}>
                    <Link href={`/cith/${hub.id}`} className="group block h-full">
                      <div className="brand-card flex h-full flex-col overflow-hidden">
                        <span
                          aria-hidden="true"
                          className="h-[3px] w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ background: 'var(--brand-tile)' }}
                        />

                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="font-heading text-[17px] font-bold leading-snug text-slate transition-colors group-hover:text-[var(--brand-accent-text)]">
                            {hub.name}
                          </h3>

                          <div className="mb-6 mt-5 flex-1 space-y-2.5">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="mt-[3px] h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
                              <span className="font-body text-[13px] leading-snug text-[#3A3740]">
                                {getHubLocation(hub)}
                              </span>
                            </div>
                            {hub.meetingDay && (
                              <div className="flex items-center gap-2.5">
                                <Calendar className="h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
                                <span className="font-body text-[13px] text-[#3A3740]">
                                  {hub.meetingDay}
                                  {hub.meetingTime ? ` · ${hub.meetingTime}` : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate/8 pt-4">
                            <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)]">
                              View Hub
                            </span>
                            <ArrowRight className="h-4 w-4 text-[var(--brand-accent-text)] transition-transform duration-200 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <div className="brand-card brand-card--static mx-auto max-w-md p-12 text-center">
              <div className="brand-tile mx-auto h-14 w-14">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate">No hubs found</h3>
              <p className="mx-auto mt-2 max-w-xs font-body text-sm text-gray-text">
                Try a different search, or join the e-Hub to stay connected online.
              </p>
              <Link
                href="/cith/ehub"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-7 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--brand-on-accent)] transition-colors hover:bg-[var(--brand-accent-strong)]"
              >
                Join e-Hub
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <SectionWrapper
        variant="brand-ink"
        hairline
        density="roomy"
        width="narrow"
      >
        <FadeIn>
          <div className="text-center">
            <Eyebrow align="center">Can&apos;t find a hub near you?</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-tight text-white md:text-[44px]">
              Stay connected,<br className="hidden sm:block" /> wherever you are
            </h2>
            <p className="mx-auto mt-6 max-w-lg font-body text-[15.5px] leading-8 text-white/64">
              Join our e-Hub if there is no CITH hub close to you, or register your home
              to lead a fellowship group in your area.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/cith/ehub"
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
              >
                Join e-Hub
              </Link>
              <Link
                href="/cith/register"
                className="inline-flex items-center justify-center rounded-full border border-white/18 px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/8"
              >
                Register a Hub
              </Link>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

    </div>
  );
}
