'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Search, Users, Globe, Calendar } from 'lucide-react';
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
  _count?: { members: number };
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

function getMemberCount(hub: Hub): number {
  return hub._count?.members ?? 0;
}

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
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 680,
          background: '#1A1612',
        }}
      >
        {/* Photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: '65% center',
          }}
        />
        {/* Gradient — dark left, reveals photo right */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(26,22,18,0.96) 0%, rgba(26,22,18,0.82) 38%, rgba(26,22,18,0.28) 66%, rgba(26,22,18,0.06) 100%)',
          }}
        />

        {/* Content column */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 680,
            maxWidth: 1320,
            margin: '0 auto',
            padding: '0 clamp(24px, 4vw, 52px)',
          }}
        >
          <div
            style={{
              marginTop: 'auto',
              paddingBottom: 72,
              paddingTop: 48,
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              maxWidth: 760,
            }}
          >
            {/* Badge pill */}
            <span
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                background: '#C9A84C',
                color: '#1A1612',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '8px 16px',
                borderRadius: 9999,
              }}
            >
              Selected Saturdays · Every Month
            </span>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(54px, 8vw, 112px)',
                lineHeight: 0.88,
                letterSpacing: '0.01em',
                margin: 0,
                textTransform: 'uppercase',
                color: '#F6F1E6',
              }}
            >
              Church in<br />the House
            </h1>

            {/* Sub-copy */}
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 18,
                lineHeight: 1.6,
                color: 'rgba(246,241,230,0.82)',
                maxWidth: '46ch',
              }}
            >
              One Saturday each month, homes across the city become sanctuaries.
              Come worship, pray and break bread with family.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                marginTop: 6,
              }}
            >
              <button
                onClick={scrollToHubs}
                style={{
                  cursor: 'pointer',
                  background: '#F6F1E6',
                  color: '#1A1612',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 800,
                  fontSize: 15,
                  padding: '14px 30px',
                  borderRadius: 9999,
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Find a hub near you
              </button>
              <Link
                href="/cith/ehub"
                style={{
                  textDecoration: 'none',
                  border: '1.5px solid rgba(246,241,230,0.38)',
                  color: '#F6F1E6',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '13px 26px',
                  borderRadius: 9999,
                  whiteSpace: 'nowrap',
                }}
              >
                Join e-Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <FadeIn>
          <div className="max-w-5xl mx-auto">

            {/* Section heading */}
            <div className="text-center mb-14">
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[#C9A84C] mb-3">
                About CITH
              </p>
              <h2 className="font-heading text-3xl md:text-[2.6rem] font-bold text-[#0E0B1E] leading-tight">
                The Church in The House
              </h2>
            </div>

            {/* Prose */}
            <div className="space-y-5 font-body text-[15.5px] md:text-[17px] leading-[1.75] text-[#3A3740] max-w-3xl mx-auto">
              <p>
                The Church in The House (CITH) is the Arm of The Ecclesia Embassy commissioned
                for the gathering together of God&apos;s people (believers) to serve Christ in the
                Home. Jesus said in Matthew 16:18 that &ldquo;I will build My Church&rdquo;. He was
                aware of other Churches operating in the Roman Empire at that time, but He had a
                desire to build a model Church that would replicate heaven on earth.
              </p>
              <p>
                The CITH operates with the template of the revelation in The Ecclesia Embassy
                concerning the Church. As seen from scriptures, the purposes of the CITH are for{' '}
                <span className="font-semibold text-[#0E0B1E]">
                  Knowledge, Transformation, Government, Authority and Discipleship
                </span>{' '}
                while its operations are{' '}
                <span className="font-semibold text-[#0E0B1E]">
                  Evangelism, Training, Fellowship, Worship and Works
                </span>
                . Where a physical hub is not accessible, the e-Hub provides an online expression
                of that same fellowship.
              </p>
              <p>
                CITH brings the life of the Church closer to the grassroots of daily life. In
                smaller fellowship settings, believers are known, cared for, and encouraged to
                grow actively rather than remain spectators. It creates room for stronger study,
                spiritual accountability, genuine care, and more natural opportunities for
                witnessing in homes and neighbourhoods.
              </p>
            </div>

            {/* Purpose pillars */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['Knowledge', 'Transformation', 'Government', 'Authority', 'Discipleship'].map(
                pillar => (
                  <div
                    key={pillar}
                    className="text-center py-3 px-2 rounded-xl bg-[#FAFAF8] border border-[#E8E6F0]"
                  >
                    <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#C9A84C]">
                      {pillar}
                    </span>
                  </div>
                ),
              )}
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
            {/* Heading */}
            <div className="text-center mb-10">
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[#C9A84C] mb-3">
                Hub Directory
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0E0B1E]">
                Find Your Hub
              </h2>
              <p className="mt-3 font-body text-base text-[#8A8A90]">
                Search by location, area, or hub leader
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-lg mx-auto mb-14">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A90] w-4 h-4" />
              <Input
                placeholder="Search by location, hub name, or leader…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-11 w-full !rounded-full"
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
                      <div className="bg-white rounded-2xl border border-[#E8E6F0] p-6 h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:border-[#C9A84C]/50">

                        {/* Hub name + leader */}
                        <div className="mb-5">
                          <h3 className="font-heading text-[17px] font-bold text-[#0E0B1E] group-hover:text-[#C9A84C] transition-colors leading-snug">
                            {hub.name}
                          </h3>
                          <p className="font-body text-sm text-[#8A8A90] mt-0.5">
                            Led by {getLeaderName(hub)}
                          </p>
                        </div>

                        {/* Meta rows */}
                        <div className="space-y-2.5 flex-1 mb-6">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-[15px] h-[15px] text-[#C9A84C] mt-0.5 shrink-0" />
                            <span className="font-body text-[13.5px] text-[#3A3740] leading-snug">
                              {getHubLocation(hub)}
                            </span>
                          </div>
                          {hub.meetingDay && (
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-[15px] h-[15px] text-[#C9A84C] shrink-0" />
                              <span className="font-body text-[13.5px] text-[#3A3740]">
                                {hub.meetingDay}
                                {hub.meetingTime ? ` · ${hub.meetingTime}` : ''}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5">
                            <Users className="w-[15px] h-[15px] text-[#C9A84C] shrink-0" />
                            <span className="font-body text-[13.5px] text-[#3A3740]">
                              {getMemberCount(hub)} members
                            </span>
                          </div>
                        </div>

                        {/* Arrow CTA */}
                        <span className="font-body text-sm font-bold text-[#C9A84C] flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Hub
                          <span aria-hidden>→</span>
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#E8E6F0] flex items-center justify-center mx-auto mb-5">
                <Globe className="w-7 h-7 text-[#8A8A90]" />
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
      <section className="bg-[#0E0B1E] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[#C9A84C] mb-4">
              Can&apos;t find a hub near you?
            </p>
            <h2 className="font-heading text-3xl md:text-[2.6rem] font-bold text-white mb-5 leading-tight">
              Stay Connected,<br className="hidden sm:block" /> Wherever You Are
            </h2>
            <p className="font-body text-[15.5px] text-[#B8B4C8] mb-10 max-w-xl mx-auto leading-relaxed">
              Join our e-Hub if there is no CITH hub close to you, or if you are unable to make
              your home one. You can also register your home as a hub and lead a fellowship group
              in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cith/ehub"
                className="font-body font-bold text-[15px] px-8 py-4 rounded-full bg-[#C9A84C] text-[#0E0B1E] hover:bg-[#DFC070] transition-colors text-center"
              >
                Join e-Hub
              </Link>
              <Link
                href="/cith/register"
                className="font-body font-bold text-[15px] px-8 py-4 rounded-full border border-white/25 text-white hover:bg-white/8 transition-colors text-center"
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
