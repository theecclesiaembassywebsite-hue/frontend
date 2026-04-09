'use client';

import { useEffect, useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { media } from '@/lib/api';
import { SkeletonGroup } from '@/components/ui/Skeleton';
import { FadeIn } from '@/components/ui/Motion';
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { BookOpen, Download, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import Script from 'next/script';

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: string;
  fileUrl?: string;
  coverUrl?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export default function EcclesialibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await media.getLibrary();
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch library items:', err);
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
    const t = type?.toLowerCase();
    switch (t) {
      case 'book':
        return 'bg-[#4A1D6E] text-white';
      case 'bulletin':
        return 'bg-[#771996] text-white';
      case 'ministry_material':
        return 'bg-[#E4E0EF] text-[#241A42]';
      default:
        return 'bg-[#F5F5F5] text-[#31333B]';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '₦0';
    return `₦${Number(price).toLocaleString()}`;
  };

  const handlePurchase = (item: LibraryItem) => {
    if (!isAuthenticated) {
      error('Please sign in to purchase this resource.');
      return;
    }

    if (!window.PaystackPop) {
      error('Payment system is loading. Please try again in a moment.');
      return;
    }

    setPurchasingId(item.id);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: (user as any)?.email || '',
      amount: Math.round((item.price || 0) * 100), // Paystack expects kobo
      currency: 'NGN',
      ref: `LIB-${item.id}-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Resource', variable_name: 'resource', value: item.title },
          { display_name: 'Type', variable_name: 'type', value: 'library_purchase' },
        ],
      },
      callback: () => {
        success('Payment successful! Your download will begin shortly.');
        setPurchasingId(null);
        // Trigger download after successful payment
        if (item.fileUrl) {
          const link = document.createElement('a');
          link.href = item.fileUrl;
          link.download = item.title;
          link.click();
        }
      },
      onClose: () => {
        setPurchasingId(null);
      },
    });

    handler.openIframe();
  };

  const handleDownload = async (item: LibraryItem) => {
    try {
      const result = await media.downloadLibraryResource(item.id);
      if (result?.downloadUrl || item.fileUrl) {
        const link = document.createElement('a');
        link.href = result?.downloadUrl || item.fileUrl || '';
        link.download = item.title;
        link.click();
      }
    } catch {
      // Fallback to direct file URL
      if (item.fileUrl) {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = item.title;
        link.click();
      }
    }
  };

  return (
    <main className="min-h-screen">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

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
                  {filteredItems.map((item) => {
                    const isFree = item.isFree || !item.price || Number(item.price) === 0;
                    return (
                      <StaggerItem key={item.id}>
                        <div className="bg-[#F5F5F5] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                          {/* Cover Area */}
                          <div className="bg-gradient-to-br from-[#E4E0EF] to-[#F5F5F5] h-40 flex items-center justify-center group-hover:from-[#771996] group-hover:to-[#4A1D6E] transition-colors relative">
                            {item.coverUrl ? (
                              <img
                                src={item.coverUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-16 h-16 text-[#8A8A8E] group-hover:text-white transition-colors" />
                            )}
                            {/* Price badge */}
                            <div className="absolute top-3 right-3">
                              {isFree ? (
                                <span className="bg-[#27AE60] text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow-sm">
                                  FREE
                                </span>
                              ) : (
                                <span className="bg-[#D4A843] text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow-sm">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex flex-col flex-1">
                            <div className="mb-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-heading font-semibold ${getTypeBadgeColor(item.type)}`}>
                                {(item.type || 'book').replace('_', ' ').charAt(0).toUpperCase() + (item.type || 'book').replace('_', ' ').slice(1).toLowerCase()}
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

                            {/* Action Button */}
                            <div className="mt-auto">
                              {isFree ? (
                                <button
                                  onClick={() => handleDownload(item)}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#771996] hover:bg-[#4A1D6E] text-white font-heading font-semibold py-2.5 px-4 rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Free
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePurchase(item)}
                                  disabled={purchasingId === item.id}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#B8912F] text-white font-heading font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {purchasingId === item.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-4 h-4" />
                                      Buy {formatPrice(item.price)}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </div>
              </StaggerContainer>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
