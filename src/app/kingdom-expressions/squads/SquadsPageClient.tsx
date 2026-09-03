'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Shield, Music, BookOpen, Heart, ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionIntro from '@/components/ui/SectionIntro';
import Eyebrow from '@/components/ui/Eyebrow';
import { squads as squadsAPI } from '@/lib/api';
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { SkeletonGroup } from '@/components/ui/Skeleton';

interface Squad {
  id: string;
  name: string;
  description?: string;
  leader?: {
    id: string;
    email: string;
    profile?: { firstName?: string; lastName?: string; photoUrl?: string };
  } | null;
  _count?: { members: number };
  meetingDay?: string;
  meetingTime?: string;
  activities?: string;
}

const squadIconMap: Record<string, React.ReactNode> = {
  worship: <Music className="w-5 h-5" />,
  prayer: <Heart className="w-5 h-5" />,
  teaching: <BookOpen className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
};

/**
 * The fifteen squads, lifted out of what used to be one unbroken wall of
 * prose. Held as data so the page can lay them out as the catalogue they
 * actually are — this list is the whole point of the page.
 */
const KINGDOM_SQUADS = [
  {
    name: 'Aged Kingdom Life Squad',
    desc: 'Caring for individuals advanced in age who need aid at different levels — food items, toiletries, eye glasses, clothes, medical attention.',
  },
  {
    name: 'Blessed People Kingdom Life Squad',
    desc: 'Reaching “area boys”, prostitutes, drug addicts, repentant criminals and those around them; giving a new beginning and restoring self-worth.',
  },
  {
    name: 'Church and Ministry Kingdom Life Squad',
    desc: 'Supporting churches, ministries, NGOs and ministers who are challenged — chairs, furniture, musical and sound equipment, and personal needs.',
  },
  {
    name: 'Community Development Kingdom Life Squad',
    desc: 'Visiting remote and underdeveloped communities lacking good roads, electricity or pipe-borne water, and taking part in meeting those needs.',
  },
  {
    name: 'Enabled Kingdom Life Squad',
    desc: 'Reaching disabled individuals of all sorts — the blind, lame, deaf, dumb and handicapped — wherever they live or gather.',
  },
  {
    name: 'Hospital Kingdom Life Squad',
    desc: 'Caring for the sick in hospitals, health centres and at home; meeting medical needs and praying for healing and perfection of health.',
  },
  {
    name: 'In-Reach Kingdom Life Squad',
    desc: 'Members’ welfare. Doing good to all, especially those of our household of faith (Galatians 6:10) — charity begins at home.',
  },
  {
    name: 'Privileged Kingdom Life Squad',
    desc: 'Meeting the needs of less privileged and poor individuals in our community who do not fall into any other categorised squad.',
  },
  {
    name: 'Market Kingdom Life Squad',
    desc: 'Fellowship with market men and women, cleaning the market environment, providing waste bins and drainage, and supporting projects.',
  },
  {
    name: 'Orphanage Kingdom Life Squad',
    desc: 'Reaching orphans around us and those living in orphanages with basic needs, fellowship and love.',
  },
  {
    name: 'Primary and Secondary Schools Squad',
    desc: 'For those with a passion for children and teenagers — visiting schools, meeting needs, and running life-transforming programmes.',
  },
  {
    name: 'Free and Changed Men Kingdom Life Squad',
    desc: 'Prisoners, their welfare, spiritual life and rehabilitation — including legal aid for those who need the service.',
  },
  {
    name: 'Re-Mind Kingdom Life Squad',
    desc: 'Helping individuals with mental disorders — mood and anxiety disorders, psychotic disorders, depression — regain sanity and order.',
  },
  {
    name: 'Special Children Kingdom Life Squad',
    desc: 'Children with Autism, Down Syndrome, Cerebral Palsy, learning difficulty, ADHD and ADD. Their foremost need is love, given unreservedly.',
  },
  {
    name: 'Jesus’ Bride Kingdom Life Squad',
    desc: 'Reaching widows and single mothers whose children have been abandoned, and meeting genuine need with the means we have.',
  },
];

export default function SquadsPageClient() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        setIsLoading(true);
        const data = await squadsAPI.getSquads();
        setSquads(data || []);
      } catch (error) {
        console.error('Failed to fetch squads:', error);
        setSquads([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquads();
  }, []);

  return (
    <main data-brand="expressions" className="min-h-screen">
      <PageHero
        eyebrow="Kingdom Life Squads"
        title="Find your place. Serve with purpose."
        subtitle="Christ on missions — expressing Christ, reaching the unreached, meeting needs."
        description="An arm of The Ecclesia Embassy committed to demonstrating the Scriptural lifestyle of the Kingdom of God, one need at a time."
        actions={[
          { href: '#squads', label: 'See the 15 Squads', variant: 'primary' },
          { href: '#join', label: 'Join a Squad', variant: 'secondary', onDark: true },
        ]}
        stats={[
          { value: '15', label: 'Kingdom Life Squads' },
          { value: 'James 1:27', label: 'Pure and undefiled religion' },
          { value: 'Acts 1:8', label: 'From Jerusalem outward' },
        ]}
      />

      {/* ── WHY THE SQUADS EXIST ── */}
      <SectionWrapper variant="white">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Eyebrow>Introduction</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.12] text-slate md:text-[38px]">
              Ministry is meeting the needs of people.
            </h2>

            <div className="mt-8 space-y-5 font-body text-[15.5px] leading-[1.8] text-[#3A3740] md:text-[17px]">
              <p>
                The Bible describes an approved religion — the type accepted as pure and undefiled
                before God — to be the one committed to meeting the needs of people (James 1:27).
                Jesus also outlined ministry as an avenue of meeting the needs of people with the
                Gospel in His mission statement (Luke 4:18): to preach the Gospel to the poor,
                healing to the brokenhearted, deliverance to the captives, recovering of sight to the
                blind, and to set at liberty them that are bound.
              </p>
              <p>
                It is clear that ministry involves meeting needs, since all a captive needs is
                deliverance, and recovery of sight is all the blind needs. Jesus also said that
                meeting the needs of people is meeting His own needs, which ultimately improves our
                relationship with God and prepares a place for us in His Kingdom (Matthew 25:31-40).
              </p>
              <p>
                It is on that premise that The Ecclesia Embassy seeks to demonstrate the love of God
                to the world around us — seizing every opportunity at our disposal to meet the needs
                of individuals, communities and organizations.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-[28px] bg-[image:var(--brand-band)] p-8 shadow-[0_28px_70px_rgba(14,10,32,0.22)] md:p-10">
              <div aria-hidden="true" className="brand-orb -right-12 -top-10 h-48 w-48" />
              <p className="relative font-serif text-xl italic leading-9 text-white/92 md:text-2xl">
                &ldquo;Inasmuch as ye have done it unto one of the least of these my brethren, ye
                have done it unto me.&rdquo;
                <span className="mt-4 block font-body text-xs font-semibold uppercase not-italic tracking-widest text-[var(--brand-accent-text)]">
                  Matthew 25:40
                </span>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── THE FIFTEEN SQUADS ─────────────────────────────────────────
          A numbered catalogue. This grid is the page's own motif — no other
          destination on the site carries a list this long, so it earns a
          dense, scannable layout rather than running prose. */}
      <SectionWrapper variant="paper" id="squads">
        <SectionIntro
          align="center"
          eyebrow="The approach"
          title="Fifteen squads, fifteen kinds of need"
          description="The needs of people and organizations around us are too varied to be met through one channel. Each squad carries a different one."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {KINGDOM_SQUADS.map((squad, index) => (
            <div key={squad.name} className="brand-card h-full p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-[13px] font-bold tracking-[0.18em] text-[var(--brand-accent-text)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading text-base font-bold leading-snug text-slate">
                  {squad.name}
                </h3>
              </div>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text">{squad.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── TARGET AND AIM ── */}
      <SectionWrapper variant="brand-band" hairline>
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <Eyebrow>Our target area</Eyebrow>
            <h3 className="mt-5 font-heading text-2xl font-bold text-white md:text-[30px]">
              Jerusalem, then outward.
            </h3>
            <div className="mt-5 space-y-4 font-body text-[15px] leading-8 text-white/66">
              <p>
                In reaching out to people, Jesus gave His disciples a pattern in Acts 1:8 — begin
                from the immediate environment, Jerusalem, to Judea, to Samaria, and then to the
                uttermost part of the earth.
              </p>
              <p>
                In that same light, we begin from the communities immediately around us, extend
                intentionally across cities and nations, and ultimately reach the whole world. No one
                around us who requires genuine aid is left unattended to.
              </p>
            </div>
          </div>

          <div>
            <Eyebrow>Our ultimate aim</Eyebrow>
            <h3 className="mt-5 font-heading text-2xl font-bold text-white md:text-[30px]">
              To demonstrate the love of God to humanity.
            </h3>
            <div className="mt-5 space-y-4 font-body text-[15px] leading-8 text-white/66">
              <p>
                Our drive is to live the true life that Jesus expects from us, according to Matthew
                25:31-46 and James 1:27. These are our Kingdom ministries, where we communicate
                Christ, His love and life to humanity and our society.
              </p>
              <p>
                We are committed to putting smiles on the faces of millions all over the world. Just
                like Job in chapter 29:11-17, we will be eyes to the blind, foot to the lame, and
                fathers to the poor.
              </p>
            </div>
            <p className="mt-7 font-serif text-xl italic text-white/88">
              We are going all out for Jesus. It&rsquo;s time to recommit to the works of Christ.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ── ACTIVE SQUADS ── */}
      <SectionWrapper variant="white" id="join">
        <SectionIntro
          align="center"
          eyebrow="Open to join"
          title="Squads currently gathering"
          description="Pick the squad that matches what you carry, and step in."
        />

        <div className="mt-14">
          {isLoading ? (
            <SkeletonGroup count={6} variant="card" columns={3} />
          ) : squads.length > 0 ? (
            <StaggerContainer>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {squads.map((squad) => {
                  const leaderName = squad.leader?.profile
                    ? `${squad.leader.profile.firstName || ''} ${squad.leader.profile.lastName || ''}`.trim()
                    : '';
                  return (
                    <StaggerItem key={squad.id}>
                      <Link
                        href={`/kingdom-expressions/squads/${squad.id}`}
                        className="group block h-full"
                      >
                        <div className="brand-card flex h-full flex-col p-6">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="flex-1 font-heading text-lg font-bold leading-snug text-slate transition-colors group-hover:text-[var(--brand-accent-text)]">
                              {squad.name}
                            </h3>
                            <div className="brand-tile h-11 w-11 shrink-0">
                              {squadIconMap[squad.name?.toLowerCase()] || (
                                <Users className="h-5 w-5" />
                              )}
                            </div>
                          </div>

                          <p className="mt-4 flex-1 font-body text-sm leading-7 text-gray-text">
                            {squad.description || 'Join this squad to serve and grow with your team.'}
                          </p>

                          <dl className="mt-5 space-y-2 border-t border-slate/8 pt-4">
                            <div className="flex items-center gap-2.5">
                              <Users className="h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
                              <dd className="font-body text-[13px] text-[#3A3740]">
                                Led by {leaderName || 'TBA'}
                              </dd>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Heart className="h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
                              <dd className="font-body text-[13px] text-[#3A3740]">
                                {squad._count?.members || 0} members
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-5 flex items-center justify-between">
                            <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)]">
                              View Details
                            </span>
                            <ArrowRight className="h-4 w-4 text-[var(--brand-accent-text)] transition-transform duration-200 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
          ) : (
            <div className="brand-card brand-card--static mx-auto max-w-md p-12 text-center">
              <div className="brand-tile mx-auto h-14 w-14">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate">
                No squads available
              </h3>
              <p className="mx-auto mt-2 max-w-xs font-body text-sm text-gray-text">
                Check back soon for new Kingdom Life squads.
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>
    </main>
  );
}
