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

// Survives the round trip to Paystack's hosted checkout and back.
const PENDING_PURCHASE_KEY = 'library:pendingPurchase';

export default function EcclesialibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Paystack redirects back here with ?reference=... once checkout finishes.
  // Landing on this page is not proof of payment — the backend re-verifies the
  // reference against Paystack, and against what it recorded as owed, before it
  // will hand back a file URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const resourceId = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!reference || !resourceId) return;

    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
    // Drop the reference from the address bar so a refresh doesn't re-run this.
    window.history.replaceState({}, '', window.location.pathname);

    setPurchasingId(resourceId);
    media
      .verifyLibraryPurchase(resourceId, reference)
      .then((result) => {
        success('Payment confirmed. Your download will begin shortly.');
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.click();
      })
      .catch(() => {
        error(
          `We could not confirm that payment. If you were charged, contact support with reference ${reference}.`,
        );
      })
      .finally(() => setPurchasingId(null));
  }, [success, error]);

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
        return 'bg-[#0E0B1E] text-white';
      case 'bulletin':
        return 'bg-[#C9A84C] text-white';
      case 'ministry_material':
        return 'bg-[#E8E6F0] text-[#0E0B1E]';
      default:
        return 'bg-[#FAFAF8] text-[#0E0B1E]';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '₦0';
    return `₦${Number(price).toLocaleString()}`;
  };

  // The server creates the transaction — at its own price, with its own
  // reference — and we redirect to the checkout it returns. The browser states
  // no amount and mints no reference, so there is nothing here for a buyer to
  // tamper with; the price is read from the database on the way out and the
  // settled amount is compared against it on the way back.
  const handlePurchase = async (item: LibraryItem) => {
    if (!isAuthenticated) {
      error('Please sign in to purchase this resource.');
      return;
    }

    setPurchasingId(item.id);
    try {
      const { authorization_url } = await media.initializeLibraryPurchase(item.id);
      // Remember which resource this checkout was for, so the return trip knows
      // what to verify. The reference itself comes back in the callback URL.
      sessionStorage.setItem(PENDING_PURCHASE_KEY, item.id);
      window.location.href = authorization_url;
    } catch (err) {
      setPurchasingId(null);
      error(
        err instanceof Error && err.message
          ? err.message
          : 'We could not start that purchase. Please try again.',
      );
    }
  };

  // Always goes through /download, which re-checks entitlement server-side and
  // returns the url. The previous fallback to `item.fileUrl` on error surfaced
  // whatever the public listing happened to carry; that field is null for priced
  // resources, so it could never have leaked one — but it also meant a genuine
  // "you don't own this" was swallowed into a silent no-op instead of being said.
  const handleDownload = async (item: LibraryItem) => {
    try {
      const result = await media.downloadLibraryResource(item.id);
      if (!result?.downloadUrl) {
        error('That download is not available right now.');
        return;
      }
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = item.title;
      link.click();
    } catch {
      error('We could not start that download. Please try again.');
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0E0B1E] to-[#0E0B1E]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-[#E8E6F0]" />
          </div>
          <h1 className="text-5xl font-bold font-heading text-white mb-4">Ecclesia Library</h1>
          <p className="text-xl text-[#E8E6F0]">Books and resources for your growth</p>
        </div>
      </section>

      {/* App Download */}
      <section className="bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.14),transparent_55%),linear-gradient(135deg,#0A0718_0%,#12102A_50%,#1E1040_100%)] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 text-center">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[2.5px] text-gold mb-3">
            Ecclesia Library App
          </p>
          <h2 className="font-heading text-[26px] font-bold text-white md:text-[30px]">
            Carry the Library Everywhere
          </h2>
          <p className="mt-3 font-body text-sm leading-7 text-white/55 max-w-md mx-auto">
            Download the app and access kingdom resources — books, materials, and more — right from your pocket.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.ecclesia.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-[18px] border border-white/12 bg-white/8 px-6 py-4 backdrop-blur-sm transition-all duration-200 hover:border-gold/35 hover:bg-white/14 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M3.18 23.76a2 2 0 01-.68-.88V1.12A2 2 0 012.5 1L14.09 12 3.18 23.76z" fill="#EA4335" />
                <path d="M17.96 15.9L4.23 23.97l-.13.07 9.99-11.04 3.87 2.9z" fill="#FBBC04" />
                <path d="M21.5 11.11c.31.44.5.96.5 1.52v-.26c0 .54-.17 1.04-.47 1.46l-3.57 2.07-3.87-2.9L17.93 9l3.57 2.11z" fill="#4285F4" />
                <path d="M4.1.03L17.93 9 14.09 12 2.5 1a2 2 0 011.6-.97z" fill="#34A853" />
              </svg>
              <div className="text-left">
                <p className="font-body text-[10px] uppercase tracking-[1.2px] text-white/45">Get it on</p>
                <p className="font-heading text-[15px] font-bold text-white">Google Play</p>
              </div>
            </a>

            <a
              href="https://apps.apple.com/za/app/ecclesia-library/id6753295575"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-[18px] border border-white/12 bg-white/8 px-6 py-4 backdrop-blur-sm transition-all duration-200 hover:border-gold/35 hover:bg-white/14 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <svg className="h-8 w-8 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="font-body text-[10px] uppercase tracking-[1.2px] text-white/45">Download on the</p>
                <p className="font-heading text-[15px] font-bold text-white">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Library Content */}
      <SectionWrapper variant="white">
        <FadeIn>
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#8A8A90]" />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E8E6F0] rounded-lg font-body text-[#0E0B1E] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>

            {/* Items Grid */}
            {isLoading ? (
              <SkeletonGroup count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-[#E8E6F0] mx-auto mb-4" />
                <p className="text-lg text-[#8A8A90] font-body">No resources found matching your search.</p>
              </div>
            ) : (
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item) => {
                    const isFree = item.isFree || !item.price || Number(item.price) === 0;
                    return (
                      <StaggerItem key={item.id}>
                        <div className="bg-[#FAFAF8] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                          {/* Cover Area */}
                          <div className="bg-gradient-to-br from-[#E8E6F0] to-[#FAFAF8] h-40 flex items-center justify-center group-hover:from-[#C9A84C] group-hover:to-[#0E0B1E] transition-colors relative">
                            {item.coverUrl ? (
                              <img
                                src={item.coverUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-16 h-16 text-[#8A8A90] group-hover:text-white transition-colors" />
                            )}
                            {/* Price badge */}
                            <div className="absolute top-3 right-3">
                              {isFree ? (
                                <span className="bg-[#27AE60] text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow-sm">
                                  FREE
                                </span>
                              ) : (
                                <span className="bg-[#C9A84C] text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow-sm">
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

                            <h3 className="text-lg font-heading font-bold text-[#0E0B1E] mb-2">
                              {item.title}
                            </h3>

                            <p className="text-sm text-[#8A8A90] font-body mb-3">
                              By {item.author}
                            </p>

                            {item.description && (
                              <p className="text-sm text-[#8A8A90] font-body mb-4 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Action Button */}
                            <div className="mt-auto">
                              {isFree ? (
                                <button
                                  onClick={() => handleDownload(item)}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#0E0B1E] text-white font-heading font-semibold py-2.5 px-4 rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Free
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePurchase(item)}
                                  disabled={purchasingId === item.id}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#B8912F] text-white font-heading font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
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
