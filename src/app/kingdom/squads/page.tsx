'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Shield, Music, BookOpen, Heart, ArrowRight } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Button from '@/components/ui/Button';
import { squads as squadsAPI } from '@/lib/api';
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from '@/components/ui/Motion';
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

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

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

  const handleJoinSquad = async (squadId: string) => {
    setJoining(squadId);
    try {
      await squadsAPI.joinSquad(squadId);
    } catch (err) {
      console.error('Failed to join squad:', err);
    } finally {
      setJoining(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section
        className="relative h-screen min-h-96 flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <FadeIn>
          <div className="relative z-10 text-center px-4 max-w-3xl">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
              Kingdom Life Squads
            </h1>
            <p className="font-body text-xl md:text-2xl text-[#F5F5F5]">
              Find your place. Serve with purpose.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Squads List Section */}
      <SectionWrapper variant="white">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <SkeletonGroup count={4} variant="card" />
          ) : squads.length > 0 ? (
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {squads.map(squad => (
                  <StaggerItem key={squad.id}>
                    <HoverLift>
                      <div className="bg-white rounded-xl border border-[#E4E0EF] shadow-sm p-6 h-full flex flex-col hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-heading text-lg font-bold text-[#241A42] flex-1">
                            {squad.name}
                          </h3>
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-[#E4E0EF] text-[#771996]">
                            {squadIconMap[squad.name?.toLowerCase()] || <Users className="w-5 h-5" />}
                          </div>
                        </div>

                        <p className="font-body text-sm text-[#8A8A8E] mb-4 flex-grow">
                          {squad.description || 'Join this squad to serve and grow with your team.'}
                        </p>

                        <div className="space-y-2 mb-6 border-t border-[#E4E0EF] pt-4">
                          <div className="flex items-center gap-2 text-[#31333B] text-sm">
                            <Users className="w-4 h-4 text-[#771996]" />
                            <span>Led by {squad.leader?.profile ? `${squad.leader.profile.firstName || ''} ${squad.leader.profile.lastName || ''}`.trim() : 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#31333B] text-sm">
                            <Users className="w-4 h-4 text-[#771996]" />
                            <span>{squad._count?.members || 0} members</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/kingdom/squads/${squad.id}`} className="flex-1">
                            <Button
                              variant="primary"
                              className="w-full bg-[#771996] hover:bg-[#4A1D6E] flex items-center justify-center gap-2"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </HoverLift>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-[#E4E0EF] mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-[#241A42] mb-2">
                No squads available
              </h3>
              <p className="text-[#8A8A8E]">
                Check back soon for new Kingdom Life squads.
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>
    </main>
  );
}
