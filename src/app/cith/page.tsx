'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Search, Users, Globe } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cith } from '@/lib/api';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';

interface Hub {
  id: string;
  name: string;
  leader: string;
  location: string;
  area?: string;
  city?: string;
  day?: string;
  time?: string;
  members?: number;
}

export default function CITHPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<Hub[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      const lowerQuery = query.toLowerCase();
      const filtered = hubs.filter(
        hub =>
          hub.name.toLowerCase().includes(lowerQuery) ||
          hub.location?.toLowerCase().includes(lowerQuery) ||
          hub.area?.toLowerCase().includes(lowerQuery) ||
          hub.city?.toLowerCase().includes(lowerQuery) ||
          hub.leader.toLowerCase().includes(lowerQuery)
      );
      setFilteredHubs(filtered);
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
              Church in the House
            </h1>
            <p className="font-body text-xl md:text-2xl text-[#F5F5F5]">
              Find fellowship near you
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Search & Hubs List Section */}
      <SectionWrapper variant="white">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <FadeIn>
            <div className="mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8E] w-5 h-5" />
                <Input
                  placeholder="Search by location, hub name, or leader..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-12 w-full"
                />
              </div>
            </div>
          </FadeIn>

          {/* Hubs Grid */}
          {isLoading ? (
            <SkeletonGroup count={6} variant="card" />
          ) : filteredHubs.length > 0 ? (
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHubs.map(hub => (
                  <StaggerItem key={hub.id}>
                    <div className="bg-white rounded-lg border border-[#E4E0EF] shadow-sm p-6 hover:shadow-md transition-shadow h-full">
                      <h3 className="font-heading text-lg font-bold text-[#241A42] mb-1">
                        {hub.name}
                      </h3>
                      <p className="text-[#8A8A8E] text-sm mb-4">
                        Led by {hub.leader}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-[#31333B]">
                          <MapPin className="w-4 h-4 text-[#771996]" />
                          <span className="text-sm">{hub.location || `${hub.area}, ${hub.city}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#31333B]">
                          <Users className="w-4 h-4 text-[#771996]" />
                          <span className="text-sm">{hub.members || 0} members</span>
                        </div>
                      </div>

                      <Link href={`/cith/${hub.id}`}>
                        <Button variant="primary" className="w-full">
                          View Hub
                        </Button>
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-[#E4E0EF] mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-[#241A42] mb-2">
                No hubs found
              </h3>
              <p className="text-[#8A8A8E]">
                Try adjusting your search or register your own hub.
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper variant="dark-purple">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Can't Find a Hub Near You?
            </h2>
            <p className="font-body text-lg text-[#E4E0EF] mb-8 max-w-2xl mx-auto">
              Join our e-Hub to connect with believers worldwide, or register your home as a hub
              to lead a fellowship group in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cith/ehub">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Join e-Hub
                </Button>
              </Link>
              <Link href="/cith/register">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto bg-[#771996] hover:bg-[#4A1D6E]"
                >
                  Register a Hub
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </main>
  );
}
