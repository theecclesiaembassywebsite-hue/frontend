'use client';

import { useEffect, useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { media } from '@/lib/api';
import { SkeletonGroup } from '@/components/ui/Skeleton';
import { FadeIn } from '@/components/ui/Motion';
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { BookOpen, Download, Search } from 'lucide-react';

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: 'book' | 'pdf' | 'guide' | 'study';
  url: string;
  cover?: string;
  description?: string;
}

export default function EcclesialibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await media.getLibrary();
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch library items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-[#4A1D6E] text-white';
      case 'pdf':
        return 'bg-[#771996] text-white';
      case 'guide':
        return 'bg-[#E4E0EF] text-[#241A42]';
      case 'study':
        return 'bg-[#lavender] text-[#241A42]';
      default:
        return 'bg-[#F5F5F5] text-[#31333B]';
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#241A42] to-[#4A1D6E]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-[#E4E0EF]" />
          </div>
          <h1 className="text-5xl font-bold font-heading text-white mb-4">Ecclesia Library</h1>
          <p className="text-xl text-[#E4E0EF]">Books and resources for your growth</p>
        </div>
      </section>

      {/* Library Content */}
      <SectionWrapper variant="white">
        <FadeIn>
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#8A8A8E]" />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E4E0EF] rounded-lg font-body text-[#31333B] focus:outline-none focus:border-[#771996] transition-colors"
                />
              </div>
            </div>

            {/* Items Grid */}
            {isLoading ? (
              <SkeletonGroup count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-[#E4E0EF] mx-auto mb-4" />
                <p className="text-lg text-[#8A8A8E] font-body">No resources found matching your search.</p>
              </div>
            ) : (
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item) => (
                    <StaggerItem key={item.id}>
                      <div className="bg-[#F5F5F5] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                        {/* Cover Area */}
                        <div className="bg-gradient-to-br from-[#E4E0EF] to-[#lavender] h-40 flex items-center justify-center group-hover:from-[#771996] group-hover:to-[#4A1D6E] transition-colors">
                          {item.cover ? (
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-16 h-16 text-[#8A8A8E]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="mb-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-heading font-semibold ${getTypeBadgeColor(item.type)}`}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </div>

                          <h3 className="text-lg font-heading font-bold text-[#241A42] mb-2">
                            {item.title}
                          </h3>

                          <p className="text-sm text-[#8A8A8E] font-body mb-3">
                            By {item.author}
                          </p>

                          {item.description && (
                            <p className="text-sm text-[#8A8A8E] font-body mb-4 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Download Button */}
                          <a
                            href={item.url}
                            download
                            className="mt-auto inline-flex items-center justify-center gap-2 bg-[#771996] hover:bg-[#4A1D6E] text-white font-heading font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
