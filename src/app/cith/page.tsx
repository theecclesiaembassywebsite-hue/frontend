'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, Globe, Calendar } from 'lucide-react';
import Input from '@/components/ui/Input';
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
  { label: 'Knowledge', icon: '📖' },
  { label: 'Transformation', icon: '✦' },
  { label: 'Government', icon: '⚖' },
  { label: 'Authority', icon: '🔑' },
  { label: 'Discipleship', icon: '🤝' },
];

export default function CITHPage() {
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
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#0B0914]">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.18),_transparent_32%),radial-gradient(circle_at_80%_15%,_rgba(91,45,142,0.24),_transparent_30%),linear-gradient(135deg,_#13101F_0%,_#0E0B1E_55%,_#09071A_100%)]" />

        <div className="relative mx-auto grid min-h-[700px] max-w-[1320px] gap-10 px-4 py-16 sm:px-6 md:px-8 lg:grid-cols-2 lg:items-center lg:py-24">

          {/* Left: copy */}
          <div className="max-w-xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DFC070] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
              Selected Saturdays · Every Month
            </span>

            {/* Headline — Anton display font */}
            <h1
              className="mt-6 uppercase text-white"
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

            <p className="mt-7 font-body text-[16px] leading-[1.75] text-white/72 md:text-[17px]">
              On Selected Saturdays each month, believers gather across the city to share
              the Word, break bread, and grow together in smaller, intentional
              expressions of church. When a home hub isn&apos;t close by, the
              e-Hub keeps you connected.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={scrollToHubs}
                className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-[#0E0B1E] transition-all hover:bg-[#DFC070] hover:-translate-y-0.5"
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

          {/* Right: image card */}
          <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
            {/* Gold glow */}
            <div className="absolute -inset-6 rounded-[44px] bg-[radial-gradient(circle,_rgba(201,168,76,0.18),_transparent_70%)] blur-3xl pointer-events-none" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/4 p-3 shadow-[0_24px_72px_rgba(0,0,0,0.4)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#14111F]">
                <Image
                  src="/cith-advert-design.jpg"
                  alt="Church in the House gathering"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                {/* Subtle bottom fade */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(9,7,26,0.5)_100%)]" />
                {/* Tag */}
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/36 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                  <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/78">
                    CITH
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <FadeIn>
          <div className="max-w-6xl mx-auto">

            {/* Two-column layout on desktop */}
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:items-start">

              {/* Left: title + scripture anchor */}
              <div className="lg:sticky lg:top-24">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9A84C] mb-4">
                  About CITH
                </p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0E0B1E] leading-tight mb-6">
                  The Church<br className="hidden lg:block" /> in The House
                </h2>
                {/* Scripture pull */}
                <blockquote className="border-l-[3px] border-[#C9A84C] pl-5 mt-8">
                  <p className="font-serif italic text-[17px] leading-[1.7] text-[#3A3740]">
                    &ldquo;I will build My Church and the gates of hell shall not prevail against it.&rdquo;
                  </p>
                  <footer className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">
                    Matthew 16:18
                  </footer>
                </blockquote>

                {/* Purpose pillars */}
                <div className="mt-10 space-y-2">
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A8A90] mb-3">
                    Purposes
                  </p>
                  {purposes.map((p, i) => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAFAF8] border border-[#E8E6F0] font-heading text-[11px] font-bold text-[#C9A84C]">
                        {i + 1}
                      </span>
                      <span className="font-body text-sm font-semibold text-[#0E0B1E]">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: prose */}
              <div className="space-y-5 font-body text-[15.5px] md:text-[17px] leading-[1.8] text-[#3A3740]">
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
                  <span className="font-semibold text-[#0E0B1E]">
                    Knowledge, Transformation, Government, Authority and Discipleship
                  </span>{' '}
                  — while its operations are expressed through{' '}
                  <span className="font-semibold text-[#0E0B1E]">
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
                  <span className="font-semibold text-[#0E0B1E]">e-Hub</span> provides an online
                  expression of that same fellowship for believers who do not have a CITH hub
                  close to them or are unable to make their home one.
                </p>

                {/* Operations chips */}
                <div className="pt-4 flex flex-wrap gap-2">
                  {['Evangelism', 'Training', 'Fellowship', 'Worship', 'Works'].map(op => (
                    <span
                      key={op}
                      className="inline-flex items-center rounded-full bg-[#FAFAF8] border border-[#E8E6F0] px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-[#3A3740]"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── HUB DIRECTORY ────────────────────────────────────────────── */}
      <section
        id="find-hub"
        ref={hubSectionRef}
        className="bg-[#FAFAF8] py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            {/* Section header */}
            <div className="text-center mb-10">
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9A84C] mb-3">
                Hub Directory
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0E0B1E]">
                Find Your Hub
              </h2>
              <p className="mt-3 font-body text-[15px] text-[#8A8A90]">
                Search by location, area, or hub leader
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-14">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A90] w-4 h-4 pointer-events-none" />
              <Input
                placeholder="Search hubs…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-11 w-full !rounded-full !bg-white"
              />
            </div>
          </FadeIn>

          {/* Grid */}
          {isLoading ? (
            <SkeletonGroup count={6} variant="card" />
          ) : filteredHubs.length > 0 ? (
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHubs.map(hub => (
                  <StaggerItem key={hub.id}>
                    <Link href={`/cith/${hub.id}`} className="block group h-full">
                      <div className="relative bg-white rounded-2xl border border-[#E8E6F0] overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
                        {/* Gold top accent bar */}
                        <div className="h-[3px] w-full bg-gradient-to-r from-[#C9A84C] to-[#DFC070] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        <div className="p-6 flex flex-col flex-1">
                          {/* Hub name */}
                          <div className="mb-5">
                            <h3 className="font-heading text-[17px] font-bold text-[#0E0B1E] group-hover:text-[#C9A84C] transition-colors leading-snug">
                              {hub.name}
                            </h3>
                          </div>

                          {/* Meta */}
                          <div className="space-y-2.5 flex-1 mb-6">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-[14px] h-[14px] text-[#C9A84C] mt-[3px] shrink-0" />
                              <span className="font-body text-[13px] text-[#3A3740] leading-snug">
                                {getHubLocation(hub)}
                              </span>
                            </div>
                            {hub.meetingDay && (
                              <div className="flex items-center gap-2.5">
                                <Calendar className="w-[14px] h-[14px] text-[#C9A84C] shrink-0" />
                                <span className="font-body text-[13px] text-[#3A3740]">
                                  {hub.meetingDay}
                                  {hub.meetingTime ? ` · ${hub.meetingTime}` : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer CTA */}
                          <div className="pt-4 border-t border-[#F0EEF8] flex items-center justify-between">
                            <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[#C9A84C] group-hover:tracking-[0.2em] transition-all duration-200">
                              View Hub
                            </span>
                            <span className="text-[#C9A84C] text-sm font-bold translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#E8E6F0] flex items-center justify-center mx-auto mb-5">
                <Globe className="w-6 h-6 text-[#8A8A90]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#0E0B1E] mb-2">
                No hubs found
              </h3>
              <p className="font-body text-sm text-[#8A8A90] max-w-xs mx-auto">
                Try a different search, or join the e-Hub to stay connected online.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#09071A] py-24 px-6">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.1),_transparent_65%)]" />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9A84C] mb-4">
              Can&apos;t find a hub near you?
            </p>
            <h2 className="font-heading text-3xl md:text-[2.6rem] font-bold text-white leading-tight mb-5">
              Stay Connected,<br className="hidden sm:block" /> Wherever You Are
            </h2>

            {/* Divider line */}
            <div className="mx-auto w-12 h-[2px] bg-[#C9A84C] rounded-full mb-7 opacity-60" />

            <p className="font-body text-[15.5px] text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
              Join our e-Hub if there is no CITH hub close to you, or register your home
              to lead a fellowship group in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cith/ehub"
                className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-[#0E0B1E] hover:bg-[#DFC070] transition-colors"
              >
                Join e-Hub
              </Link>
              <Link
                href="/cith/register"
                className="inline-flex items-center justify-center rounded-full border border-white/18 px-8 py-[14px] font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-white hover:bg-white/6 transition-colors"
              >
                Register a Hub
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
